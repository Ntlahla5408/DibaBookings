namespace DIBA_Backend.Models.Entities
{
    public class User
    {
        public Guid UserId { get; set; }

        public required string FirstName { get; set; } = string.Empty;

        public required string LastName { get; set; } = string.Empty;

        public required string Email { get; set; } = string.Empty;

        public required string PasswordHash { get; set; } = string.Empty;

        public Guid RoleId { get; set; }

        // Navigation property
        public Role? Role { get; set; }

        public Event Event
        {
            get => default;
            set
            {
            }
        }

        public Booking Booking
        {
            get => default;
            set
            {
            }
        }

        public Notification Notification
        {
            get => default;
            set
            {
            }
        }

        public AuditLog AuditLog
        {
            get => default;
            set
            {
            }
        }
    }
}
