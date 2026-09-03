using DIBA_Backend.Data;
using DIBA_Backend.Dto.Notification;
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
    public class NotificationsController : ControllerBase
    {
        private readonly DIBABookingsDbContext dbContext;

        public NotificationsController(DIBABookingsDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        // GET: api/Notifications
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
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

            var notifications = await dbContext.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.DateCreated)
                .Select(n => new NotificationResponseDto
                {
                    NotificationId = n.NotificationId,
                    NotificationType = n.NotificationType,
                    Message = n.Message,
                    DateCreated = n.DateCreated,
                    IsRead = n.IsRead,
                    UserId = n.UserId,
                    BookingId = n.BookingId
                })
                .ToListAsync();

            return Ok(notifications);
        }

        // GET: api/Notifications/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetNotification(Guid id)
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

            var notification = await dbContext.Notifications
                .FirstOrDefaultAsync(n =>
                    n.NotificationId == id &&
                    n.UserId == userId);

            if (notification == null)
            {
                return NotFound("Notification not found.");
            }

            var response = new NotificationResponseDto
            {
                NotificationId = notification.NotificationId,
                NotificationType = notification.NotificationType,
                Message = notification.Message,
                DateCreated = notification.DateCreated,
                IsRead = notification.IsRead,
                UserId = notification.UserId,
                BookingId = notification.BookingId
            };

            return Ok(response);
        }

        // PUT: api/Notifications/{id}/read
        [HttpPut("{id:guid}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
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

            var notification = await dbContext.Notifications
                .FirstOrDefaultAsync(n =>
                    n.NotificationId == id &&
                    n.UserId == userId);

            if (notification == null)
            {
                return NotFound("Notification not found.");
            }

            notification.IsRead = true;

            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                message = "Notification marked as read.",
                notificationId = notification.NotificationId
            });
        }

        // PUT: api/Notifications/read-all
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
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

            var notifications = await dbContext.Notifications
                .Where(n =>
                    n.UserId == userId &&
                    !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                message = "All notifications marked as read.",
                count = notifications.Count
            });
        }
    }
}
