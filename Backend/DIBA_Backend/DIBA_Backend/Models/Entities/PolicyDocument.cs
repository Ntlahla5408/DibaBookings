using System.ComponentModel.DataAnnotations;

namespace DIBA_Backend.Models.Entities
{
    /// <summary>
    /// Stores editable policy content such as terms of use, venue rules,
    /// cancellation guidance, and privacy information.
    /// Older versions remain in the database when a new version is published.
    /// </summary>
    public class PolicyDocument
    {
        public Guid PolicyDocumentId { get; set; }

        [Required]
        [MaxLength(60)]
        public string PolicyType { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public int Version { get; set; } = 1;

        public bool IsActive { get; set; } = true;

        // True means this content is illustrative and has not been confirmed as official policy.
        public bool IsSamplePolicy { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}