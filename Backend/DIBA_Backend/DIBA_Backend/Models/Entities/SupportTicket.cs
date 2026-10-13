using System.ComponentModel.DataAnnotations;

namespace DIBA_Backend.Models.Entities
{
    /// <summary>
    /// Stores a help request submitted by a signed-in user and the response
    /// from authorised Conference Centre staff.
    /// </summary>
    public class SupportTicket
    {
        public Guid SupportTicketId { get; set; }

        [Required]
        [MaxLength(30)]
        public string TicketNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [MaxLength(5000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(80)]
        public string Category { get; set; } = "General";

        [Required]
        [MaxLength(40)]
        public string Status { get; set; } = "Open";

        public string? StaffResponse { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? RespondedAt { get; set; }

        public Guid UserId { get; set; }

        public User? User { get; set; }
    }
}