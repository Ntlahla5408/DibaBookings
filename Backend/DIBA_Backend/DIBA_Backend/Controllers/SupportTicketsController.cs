using DIBA_Backend.Data;
using DIBA_Backend.Helpers;
using DIBA_Backend.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DIBA_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SupportTicketsController : ControllerBase
    {
        private readonly DIBABookingsDbContext _dbContext;

        public SupportTicketsController(DIBABookingsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/SupportTickets
        // Organisers can only see their own tickets; staff and administrators can see all.
        [HttpGet]
        public async Task<IActionResult> GetTickets()
        {
            if (!UserHelper.TryGetUserId(User, out Guid userId))
            {
                return Unauthorized("User ID could not be determined.");
            }

            var query = _dbContext.SupportTickets
                .Include(ticket => ticket.User)
                .AsQueryable();

            if (!User.IsInRole("Administrator") && !User.IsInRole("Staff"))
            {
                query = query.Where(ticket => ticket.UserId == userId);
            }

            var tickets = await query
                .OrderByDescending(ticket => ticket.UpdatedAt)
                .Select(ticket => new
                {
                    ticket.SupportTicketId,
                    ticket.TicketNumber,
                    ticket.Subject,
                    ticket.Description,
                    ticket.Category,
                    ticket.Status,
                    ticket.StaffResponse,
                    ticket.CreatedAt,
                    ticket.UpdatedAt,
                    ticket.RespondedAt,
                    ticket.UserId,
                    UserName = ticket.User == null
                        ? string.Empty
                        : ticket.User.FirstName + " " + ticket.User.LastName
                })
                .ToListAsync();

            return Ok(tickets);
        }

        // POST: api/SupportTickets
        // Creates a support request for the currently authenticated user.
        [HttpPost]
        [Authorize(Roles = "Administrator,Staff,Event Organiser")]
        public async Task<IActionResult> CreateTicket([FromBody] CreateSupportTicketRequest request)
        {
            if (!UserHelper.TryGetUserId(User, out Guid userId))
            {
                return Unauthorized("User ID could not be determined.");
            }

            if (string.IsNullOrWhiteSpace(request.Subject) ||
                string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest("A subject and description are required.");
            }

            var ticket = new SupportTicket
            {
                SupportTicketId = Guid.NewGuid(),
                TicketNumber = $"DIBA-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}",
                Subject = request.Subject.Trim(),
                Description = request.Description.Trim(),
                Category = string.IsNullOrWhiteSpace(request.Category)
                    ? "General"
                    : request.Category.Trim(),
                Status = "Open",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = userId
            };

            _dbContext.SupportTickets.Add(ticket);

            _dbContext.AuditLogs.Add(new AuditLog
            {
                AuditLogId = Guid.NewGuid(),
                Action = "Created Support Ticket",
                LogDescription = $"Support ticket {ticket.TicketNumber} was created.",
                Timestamp = DateTime.UtcNow,
                UserId = userId
            });

            await _dbContext.SaveChangesAsync();

            return Ok(ticket);
        }

        // PUT: api/SupportTickets/{id}/respond
        // Staff can reply to a ticket and update its status.
        [HttpPut("{id:guid}/respond")]
        [Authorize(Roles = "Administrator,Staff")]
        public async Task<IActionResult> RespondToTicket(
            Guid id,
            [FromBody] RespondToSupportTicketRequest request)
        {
            if (!UserHelper.TryGetUserId(User, out Guid staffUserId))
            {
                return Unauthorized("User ID could not be determined.");
            }

            var ticket = await _dbContext.SupportTickets.FindAsync(id);

            if (ticket == null)
            {
                return NotFound("Support ticket not found.");
            }

            var allowedStatuses = new[]
            {
                "Open",
                "In Progress",
                "Waiting for User",
                "Resolved",
                "Closed"
            };

            if (!allowedStatuses.Contains(request.Status))
            {
                return BadRequest("The supplied ticket status is not supported.");
            }

            ticket.Status = request.Status;
            ticket.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrWhiteSpace(request.StaffResponse))
            {
                ticket.StaffResponse = request.StaffResponse.Trim();
                ticket.RespondedAt = DateTime.UtcNow;
            }

            _dbContext.AuditLogs.Add(new AuditLog
            {
                AuditLogId = Guid.NewGuid(),
                Action = "Updated Support Ticket",
                LogDescription = $"Support ticket {ticket.TicketNumber} was updated to {ticket.Status}.",
                Timestamp = DateTime.UtcNow,
                UserId = staffUserId
            });

            await _dbContext.SaveChangesAsync();
            return Ok(ticket);
        }
    }

    /// <summary>
    /// Request body used when a user opens a help request.
    /// </summary>
    public class CreateSupportTicketRequest
    {
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
    }

    /// <summary>
    /// Request body used by staff to respond to a ticket and update its status.
    /// </summary>
    public class RespondToSupportTicketRequest
    {
        public string Status { get; set; } = "In Progress";
        public string? StaffResponse { get; set; }
    }
}