namespace DIBA_Backend.Dto.Notification
{
    public class NotificationResponseDto
    {
        public Guid NotificationId { get; set; }

        public string NotificationType { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public DateTime DateCreated { get; set; }

        public bool IsRead { get; set; }

        public Guid UserId { get; set; }

        public Guid BookingId { get; set; }
    }
}
