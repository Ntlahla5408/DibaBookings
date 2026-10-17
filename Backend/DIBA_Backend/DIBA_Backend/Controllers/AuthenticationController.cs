using DIBA_Backend.Data;
using DIBA_Backend.Dto.Authentication;
using DIBA_Backend.Models.Entities;
using DIBA_Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace DIBA_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly DIBABookingsDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly NotificationEmailService _notificationEmailService;
        private readonly ILogger<AuthenticationController> _logger;

        public AuthenticationController(
            DIBABookingsDbContext dbContext,
            IConfiguration configuration,
            NotificationEmailService notificationEmailService,
            ILogger<AuthenticationController> logger)
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _notificationEmailService = notificationEmailService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterUserDto registerUser)
        {
            var normalizedEmail = registerUser.Email.Trim();
            var existingUser = await _dbContext.Users
                .FirstOrDefaultAsync(user => user.Email == normalizedEmail);

            if (existingUser != null)
            {
                return BadRequest("A user with this email already exists.");
            }

            // Public registration always assigns Event Organiser on the server.
            // The client cannot choose or override this role.
            var eventOrganiserRole = await _dbContext.Roles
                .FirstOrDefaultAsync(role => role.RoleName == "Event Organiser");

            if (eventOrganiserRole == null)
            {
                return BadRequest("Default role was not found.");
            }

            var user = new User
            {
                UserId = Guid.NewGuid(),
                FirstName = registerUser.FirstName.Trim(),
                LastName = registerUser.LastName.Trim(),
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerUser.Password),
                RoleId = eventOrganiserRole.RoleId
            };

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                message = "User registered successfully.",
                userId = user.UserId,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                role = eventOrganiserRole.RoleName
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var normalizedEmail = loginDto.Email.Trim();
            var user = await _dbContext.Users
                .Include(user => user.Role)
                .FirstOrDefaultAsync(user => user.Email == normalizedEmail);

            if (user == null)
            {
                return Unauthorized("Invalid credentials.");
            }

            if (!user.IsActive)
            {
                return Unauthorized("This account has been deactivated.");
            }

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid credentials.");
            }

            if (user.Role == null)
            {
                return BadRequest("User role was not found.");
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token = token,
                userId = user.UserId,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                role = user.Role.RoleName
            });
        }

        [EnableRateLimiting("password-reset")]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto request)
        {
            // Always return the same response so callers cannot discover whether
            // an email address belongs to an active account.
            const string publicMessage =
                "If an active account exists for that email, a password reset link will be sent shortly.";

            var email = request.Email.Trim().ToLowerInvariant();
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(candidate =>
                    candidate.Email.ToLower() == email && candidate.IsActive);

            if (user == null)
            {
                return Ok(new { message = publicMessage });
            }

            var signingKey = _configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(signingKey))
            {
                _logger.LogError("Password reset email was not prepared because Jwt:Key is not configured.");
                return Ok(new { message = publicMessage });
            }

            var token = GeneratePasswordResetToken(user, signingKey);
            var frontendBaseUrl = (_configuration["Frontend:BaseUrl"] ?? "http://localhost:3000")
                .TrimEnd('/');
            var resetUrl = $"{frontendBaseUrl}/reset-password?token={Uri.EscapeDataString(token)}";
            var body =
                $"A password reset was requested for your DIBA Bookings account.\n\n" +
                $"Use this link to choose a new password (valid for 30 minutes):\n{resetUrl}\n\n" +
                "If you did not request this change, you can safely ignore this email.";

            // Uses the existing Brevo notification-email infrastructure and its delivery logging.
            // Delivery is controlled by the existing Email configuration.
            await _notificationEmailService.TrySendAsync(
                user.UserId,
                null,
                "Reset your DIBA Bookings password",
                body);

            return Ok(new { message = publicMessage });
        }

        [EnableRateLimiting("password-reset")]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto request)
        {
            if (string.IsNullOrWhiteSpace(request.NewPassword) ||
                request.NewPassword.Length < 8 ||
                !request.NewPassword.Any(char.IsUpper) ||
                !request.NewPassword.Any(char.IsLower) ||
                !request.NewPassword.Any(char.IsDigit))
            {
                return BadRequest("Use at least 8 characters, including an uppercase letter, a lowercase letter and a number.");
            }

            var signingKey = _configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(signingKey))
            {
                return BadRequest("The password reset link is invalid or has expired.");
            }

            ClaimsPrincipal principal;
            try
            {
                var handler = new JwtSecurityTokenHandler();
                principal = handler.ValidateToken(request.Token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 }
                }, out _);
            }
            catch (Exception exception) when (
                exception is SecurityTokenException ||
                exception is ArgumentException ||
                exception is FormatException)
            {
                return BadRequest("The password reset link is invalid or has expired.");
            }

            if (principal.FindFirst("purpose")?.Value != "password-reset" ||
                !Guid.TryParse(principal.FindFirst("userId")?.Value, out var userId))
            {
                return BadRequest("The password reset link is invalid or has expired.");
            }

            var suppliedFingerprint = principal.FindFirst("passwordHashFingerprint")?.Value;
            var user = await _dbContext.Users.FirstOrDefaultAsync(candidate => candidate.UserId == userId);
            if (user == null || !user.IsActive || string.IsNullOrWhiteSpace(suppliedFingerprint))
            {
                return BadRequest("The password reset link is invalid or has expired.");
            }

            byte[] suppliedFingerprintBytes;
            try
            {
                suppliedFingerprintBytes = Convert.FromHexString(suppliedFingerprint);
            }
            catch (FormatException)
            {
                return BadRequest("The password reset link is invalid or has expired.");
            }

            // The token is single-use without adding a database table: changing
            // the password changes its fingerprint and invalidates old reset tokens.
            var currentFingerprint = SHA256.HashData(Encoding.UTF8.GetBytes(user.PasswordHash));
            if (suppliedFingerprintBytes.Length != currentFingerprint.Length ||
                !CryptographicOperations.FixedTimeEquals(suppliedFingerprintBytes, currentFingerprint))
            {
                return BadRequest("The password reset link is invalid or has expired.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Your password has been reset. You can now sign in." });
        }

        private string GeneratePasswordResetToken(User user, string signingKey)
        {
            var fingerprint = SHA256.HashData(Encoding.UTF8.GetBytes(user.PasswordHash));
            var claims = new[]
            {
                new Claim("userId", user.UserId.ToString()),
                new Claim("purpose", "password-reset"),
                new Claim("passwordHashFingerprint", Convert.ToHexString(fingerprint)),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                    SecurityAlgorithms.HmacSha256));

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.Role, user.Role!.RoleName)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
