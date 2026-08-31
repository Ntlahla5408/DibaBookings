namespace DIBA_Backend.Models.Entities
{
    public class Notification
    {
        public Guid NotificationId { get; set; }

        public required string NotificationType { get; set; }

        public required string Message { get; set; }

        public DateTime DateCreated { get; set; } = DateTime.UtcNow;

        public bool IsRead { get; set; } = false;

        public Guid UserId { get; set; }

        public Guid BookingId { get; set; }

        // Navigation property
        public User? User { get; set; }

        public Booking? Booking { get; set; }
    }
}
