using System.ComponentModel.DataAnnotations;

namespace DIBA_Backend.Models.Entities
{
    /// <summary>
    /// Stores a question and answer shown in the DIBA help centre.
    /// Staff can publish, update, or hide entries without changing application code.
    /// </summary>
    public class FAQ
    {
        public Guid FAQId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Question { get; set; } = string.Empty;

        [Required]
        [MaxLength(5000)]
        public string Answer { get; set; } = string.Empty;

        [MaxLength(80)]
        public string Category { get; set; } = "General";

        public bool IsPublished { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}