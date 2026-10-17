
using DIBA_Backend.Data;
using DIBA_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DIBA_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DibaAssistantController : ControllerBase
    {
        private readonly DIBABookingsDbContext _dbContext;
        private readonly DibaAssistantService _assistantService;
        private readonly ILogger<DibaAssistantController> _logger;

        public DibaAssistantController(
            DIBABookingsDbContext dbContext,
            DibaAssistantService assistantService,
            ILogger<DibaAssistantController> logger)
        {
            _dbContext = dbContext;
            _assistantService = assistantService;
            _logger = logger;
        }

        // POST: api/DibaAssistant/ask
        [HttpPost("ask")]
        [AllowAnonymous]
        public async Task<IActionResult> Ask(
            [FromBody] AskAssistantRequest request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return BadRequest(new
                {
                    message = "Please enter a question."
                });
            }

            string question = request.Question.Trim();

            if (question.Length > 1000)
            {
                return BadRequest(new
                {
                    message = "Please keep your question under 1,000 characters."
                });
            }

            // Only published FAQs are supplied to the AI.
            // Hidden FAQs and private booking records are excluded.
            var publishedFaqs = await _dbContext.FAQs
                .AsNoTracking()
                .Where(faq => faq.IsPublished)
                .OrderBy(faq => faq.Category)
                .ThenBy(faq => faq.Question)
                .Select(faq => new
                {
                    faq.Category,
                    faq.Question,
                    faq.Answer
                })
                .ToListAsync(cancellationToken);

            if (publishedFaqs.Count == 0)
            {
                return Ok(new
                {
                    answer =
                        "I don't currently have published help information " +
                        "to answer that question. Please contact the " +
                        "conference centre staff for assistance."
                });
            }

            string faqContext = string.Join(
                "\n\n",
                publishedFaqs.Select(faq =>
                    $"Category: {faq.Category}\n" +
                    $"Question: {faq.Question}\n" +
                    $"Answer: {faq.Answer}"));

            try
            {
                string answer = await _assistantService.GetAnswerAsync(
                    question,
                    faqContext,
                    cancellationToken);

                return Ok(new { answer });
            }
            catch (InvalidOperationException)
            {
                return StatusCode(503, new
                {
                    message =
                        "The assistant is not currently available. " +
                        "Please try again later."
                });
            }
            catch (HttpRequestException)
            {
                return StatusCode(502, new
                {
                    message =
                        "The assistant could not retrieve an answer. " +
                        "Please try again later."
                });
            }
            catch (TaskCanceledException)
                when (!cancellationToken.IsCancellationRequested)
            {
                return StatusCode(504, new
                {
                    message =
                        "The assistant took too long to respond. " +
                        "Please try again."
                });
            }
            catch (Exception exception)
            {
                _logger.LogError(
                    exception,
                    "An unexpected error occurred in the DIBA assistant.");

                return StatusCode(500, new
                {
                    message =
                        "Something went wrong. Please try again later."
                });
            }
        }
    }

    public class AskAssistantRequest
    {
        public string Question { get; set; } = string.Empty;
    }
}
