using DIBA_Backend.Data;
using DIBA_Backend.Dto.Payment;
using DIBA_Backend.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DIBA_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly DIBABookingsDbContext dbContext;

        public PaymentsController(DIBABookingsDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        // GET: api/Payments
        [HttpGet]
        [Authorize(Roles = "Administrator,Staff")]
        public async Task<IActionResult> GetPayments()
        {
            var payments = await dbContext.Payments
                .Select(p => new PaymentResponseDto
                {
                    PaymentId = p.PaymentId,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    ReferenceNumber = p.ReferenceNumber,
                    BookingId = p.BookingId
                })
                .ToListAsync();

            return Ok(payments);
        }

        // GET: api/Payments/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetPayment(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized("User ID could not be determined.");
            }

            if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
            {
                return Unauthorized("Invalid user ID.");
            }

            var payment = await dbContext.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.PaymentId == id);

            if (payment == null)
            {
                return NotFound("Payment not found.");
            }

            var isStaffOrAdmin =
                User.IsInRole("Staff") ||
                User.IsInRole("Administrator");

            if (!isStaffOrAdmin &&
                (payment.Booking == null ||
                 payment.Booking.UserId != userId))
            {
                return Forbid();
            }

            var response = new PaymentResponseDto
            {
                PaymentId = payment.PaymentId,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                ReferenceNumber = payment.ReferenceNumber,
                BookingId = payment.BookingId
            };

            return Ok(response);
        }

        // POST: api/Payments
        [HttpPost]
        [Authorize(Roles = "Event Organiser")]
        public async Task<IActionResult> CreatePayment(
            CreatePaymentDto createPaymentDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized("User ID could not be determined.");
            }

            if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
            {
                return Unauthorized("Invalid user ID.");
            }

            if (createPaymentDto.Amount <= 0)
            {
                return BadRequest("Payment amount must be greater than zero.");
            }

            var booking = await dbContext.Bookings
                .Include(b => b.BookingStatus)
                .FirstOrDefaultAsync(
                    b => b.BookingId == createPaymentDto.BookingId);

            if (booking == null)
            {
                return NotFound("Booking not found.");
            }

            // Make sure the user owns the booking
            if (booking.UserId != userId)
            {
                return Forbid();
            }

            if (booking.BookingStatus == null)
            {
                return StatusCode(
                    500,
                    "Booking status could not be determined.");
            }

            // Only approved bookings can have payments
            if (!booking.BookingStatus.StatusName.Equals(
                "Approved",
                StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(
                    "Payment can only be recorded for an approved booking.");
            }

            // Check if a payment already exists
            var existingPayment = await dbContext.Payments
                .AnyAsync(p => p.BookingId == createPaymentDto.BookingId);

            if (existingPayment)
            {
                return Conflict(
                    "A payment already exists for this booking.");
            }

            var payment = new Payment
            {
                PaymentId = Guid.NewGuid(),
                Amount = createPaymentDto.Amount,
                PaymentDate = DateTime.UtcNow,
                ReferenceNumber = createPaymentDto.ReferenceNumber,
                BookingId = createPaymentDto.BookingId
            };

            dbContext.Payments.Add(payment);

            await dbContext.SaveChangesAsync();

            var response = new PaymentResponseDto
            {
                PaymentId = payment.PaymentId,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                ReferenceNumber = payment.ReferenceNumber,
                BookingId = payment.BookingId
            };

            return Ok(response);
        }
    }
}
