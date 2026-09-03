namespace DIBA_Backend.Dto.Notification
{
    public class CreateNotificationDto
    {
        public required string NotificationType { get; set; }

        public required string Message { get; set; }

        public Guid UserId { get; set; }

        public Guid BookingId { get; set; }
    }
}
