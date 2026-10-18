using System.Data;
using System.Security.Cryptography;
using System.Text;
using DIBA_Backend.Data;
using DIBA_Backend.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace DIBA_Backend.Controllers
{
    /// <summary>
    /// Provides one-time initial administrator provisioning for a newly deployed database.
    /// This endpoint is disabled unless Bootstrap:Secret is configured and no administrator exists.
    /// Remove the bootstrap secret from the deployment environment after the first administrator is created.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class BootstrapAdminController : ControllerBase
    {
        private readonly DIBABookingsDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public BootstrapAdminController(
            DIBABookingsDbContext dbContext,
            IConfiguration configuration)
        {
            _dbContext = dbContext;
            _configuration = configuration;
        }

        [HttpPost]
        [EnableRateLimiting("bootstrap-admin")]
        public async Task<IActionResult> CreateFirstAdministrator(
            [FromHeader(Name = "X-Bootstrap-Secret")] string? suppliedSecret,
            [FromBody] BootstrapAdministratorRequest request)
        {
            var configuredSecret = _configuration["Bootstrap:Secret"];
            if (string.IsNullOrWhiteSpace(configuredSecret))
            {
                return NotFound();
            }

            if (!SecretsMatch(configuredSecret, suppliedSecret))
            {
                return Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(request.FirstName) ||
                string.IsNullOrWhiteSpace(request.LastName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("First name, last name, email and password are required.");
            }

            var email = request.Email.Trim();
            if (!new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(email))
            {
                return BadRequest("A valid email address is required.");
            }

            if (request.Password.Length < 12 ||
                !request.Password.Any(char.IsUpper) ||
                !request.Password.Any(char.IsLower) ||
                !request.Password.Any(char.IsDigit))
            {
                return BadRequest("Use at least 12 characters, including an uppercase letter, a lowercase letter and a number.");
            }

            // Serializable isolation prevents concurrent requests from both creating
            // the initial administrator during first-time setup.
            await using var transaction = await _dbContext.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

            var administratorRole = await _dbContext.Roles
                .SingleOrDefaultAsync(role => role.RoleName == "Administrator");

            if (administratorRole == null)
            {
                return Conflict("The Administrator role is missing. Apply the EF Core migrations first.");
            }

            var administratorAlreadyExists = await _dbContext.Users
                .AnyAsync(user => user.RoleId == administratorRole.RoleId);

            if (administratorAlreadyExists)
            {
                return Conflict("An administrator already exists. Initial provisioning is closed.");
            }

            var normalizedEmail = email.ToLowerInvariant();
            var emailAlreadyExists = await _dbContext.Users
                .AnyAsync(user => user.Email.ToLower() == normalizedEmail);

            if (emailAlreadyExists)
            {
                return Conflict("A user with this email already exists.");
            }

            var administrator = new User
            {
                UserId = Guid.NewGuid(),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                RoleId = administratorRole.RoleId,
                IsActive = true
            };

            _dbContext.Users.Add(administrator);
            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return Created("/api/Users/me", new
            {
                message = "Initial administrator created. Remove Bootstrap:Secret from the environment now.",
                userId = administrator.UserId,
                email = administrator.Email
            });
        }

        private static bool SecretsMatch(string expected, string? supplied)
        {
            if (string.IsNullOrEmpty(supplied))
            {
                return false;
            }

            var expectedBytes = Encoding.UTF8.GetBytes(expected);
            var suppliedBytes = Encoding.UTF8.GetBytes(supplied);

            return expectedBytes.Length == suppliedBytes.Length &&
                CryptographicOperations.FixedTimeEquals(expectedBytes, suppliedBytes);
        }
    }

    public class BootstrapAdministratorRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
