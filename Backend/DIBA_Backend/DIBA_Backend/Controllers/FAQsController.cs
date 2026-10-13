using DIBA_Backend.Data;
using DIBA_Backend.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DIBA_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FAQsController : ControllerBase
    {
        private readonly DIBABookingsDbContext _dbContext;

        public FAQsController(DIBABookingsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/FAQs
        // Returns published questions for the public help centre.
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublishedFAQs()
        {
            var faqs = await _dbContext.FAQs
                .Where(faq => faq.IsPublished)
                .OrderBy(faq => faq.Category)
                .ThenBy(faq => faq.Question)
                .Select(faq => new
                {
                    faq.FAQId,
                    faq.Question,
                    faq.Answer,
                    faq.Category,
                    faq.UpdatedAt
                })
                .ToListAsync();

            return Ok(faqs);
        }

        // GET: api/FAQs/manage
        // Allows staff and administrators to review published and hidden entries.
        [HttpGet("manage")]
        [Authorize(Roles = "Administrator,Staff")]
        public async Task<IActionResult> GetAllFAQs()
        {
            var faqs = await _dbContext.FAQs
                .OrderBy(faq => faq.Category)
                .ThenBy(faq => faq.Question)
                .ToListAsync();

            return Ok(faqs);
        }

        // POST: api/FAQs
        // Creates a new help-centre entry.
        [HttpPost]
        [Authorize(Roles = "Administrator,Staff")]
        public async Task<IActionResult> CreateFAQ([FromBody] SaveFAQRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Question) ||
                string.IsNullOrWhiteSpace(request.Answer))
            {
                return BadRequest("Both a question and an answer are required.");
            }

            var faq = new FAQ
            {
                FAQId = Guid.NewGuid(),
                Question = request.Question.Trim(),
                Answer = request.Answer.Trim(),
                Category = string.IsNullOrWhiteSpace(request.Category)
                    ? "General"
                    : request.Category.Trim(),
                IsPublished = request.IsPublished,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.FAQs.Add(faq);
            await _dbContext.SaveChangesAsync();

            return Ok(faq);
        }

        // PUT: api/FAQs/{id}
        // Updates an existing FAQ without requiring a code change.
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Administrator,Staff")]
        public async Task<IActionResult> UpdateFAQ(Guid id, [FromBody] SaveFAQRequest request)
        {
            var faq = await _dbContext.FAQs.FindAsync(id);

            if (faq == null)
            {
                return NotFound("FAQ entry not found.");
            }

            if (string.IsNullOrWhiteSpace(request.Question) ||
                string.IsNullOrWhiteSpace(request.Answer))
            {
                return BadRequest("Both a question and an answer are required.");
            }

            faq.Question = request.Question.Trim();
            faq.Answer = request.Answer.Trim();
            faq.Category = string.IsNullOrWhiteSpace(request.Category)
                ? "General"
                : request.Category.Trim();
            faq.IsPublished = request.IsPublished;
            faq.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return Ok(faq);
        }

        // DELETE: api/FAQs/{id}
        // Hides an FAQ instead of permanently deleting it.
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Administrator,Staff")]
        public async Task<IActionResult> HideFAQ(Guid id)
        {
            var faq = await _dbContext.FAQs.FindAsync(id);

            if (faq == null)
            {
                return NotFound("FAQ entry not found.");
            }

            faq.IsPublished = false;
            faq.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }
    }

    /// <summary>
    /// Request body used to create or update a help-centre FAQ.
    /// </summary>
    public class SaveFAQRequest
    {
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
        public bool IsPublished { get; set; } = true;
    }
}