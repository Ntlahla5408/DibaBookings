namespace DIBA_Backend.Models.Entities
{
    public class AuditLog
    {
        public Guid AuditLogId { get; set; }

        public string Action { get; set; } = string.Empty;

        public string ? LogDescription { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public Guid UserId { get; set; }

        // Navigation property
        public User? User { get; set; }
    }
}
