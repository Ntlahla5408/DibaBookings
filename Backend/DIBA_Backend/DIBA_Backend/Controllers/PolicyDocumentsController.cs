using DIBA_Backend.Data;
using DIBA_Backend.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DIBA_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PolicyDocumentsController : ControllerBase
    {
        private readonly DIBABookingsDbContext _dbContext;

        public PolicyDocumentsController(DIBABookingsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/PolicyDocuments
        // Returns the current active policy documents for the user interface.
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetActivePolicies()
        {
            var policies = await _dbContext.PolicyDocuments
                .Where(policy => policy.IsActive)
                .OrderBy(policy => policy.PolicyType)
                .Select(policy => new
                {
                    policy.PolicyDocumentId,
                    policy.PolicyType,
                    policy.Title,
                    policy.Content,
                    policy.Version,
                    policy.IsSamplePolicy,
                    policy.UpdatedAt
                })
                .ToListAsync();

            return Ok(policies);
        }

        // GET: api/PolicyDocuments/manage
        // Allows staff and administrators to view active and previous versions.
        [HttpGet("manage")]
        [Authorize(Roles = "Administrator,Staff")]
        public async Task<IActionResult> GetPolicyHistory()
        {
            var policies = await _dbContext.PolicyDocuments
                .OrderBy(policy => policy.PolicyType)
                .ThenByDescending(policy => policy.Version)
                .ToListAsync();

            return Ok(policies);
        }

        // POST: api/PolicyDocuments
        // Creates the first version of a policy or publishes a new version.
        [HttpPost]
        [Authorize(Roles = "Administrator,Staff")]
        public async Task<IActionResult> CreatePolicy([FromBody] SavePolicyDocumentRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.PolicyType) ||
                string.IsNullOrWhiteSpace(request.Title) ||
                string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest("Policy type, title and content are required.");
            }

            var policyType = request.PolicyType.Trim();
            var previousVersions = await _dbContext.PolicyDocuments
                .Where(policy => policy.PolicyType == policyType)
                .ToListAsync();

            foreach (var previousPolicy in previousVersions)
            {
                previousPolicy.IsActive = false;
                previousPolicy.UpdatedAt = DateTime.UtcNow;
            }

            var policy = new PolicyDocument
            {
                PolicyDocumentId = Guid.NewGuid(),
                PolicyType = policyType,
                Title = request.Title.Trim(),
                Content = request.Content.Trim(),
                Version = previousVersions.Count == 0
                    ? 1
                    : previousVersions.Max(item => item.Version) + 1,
                IsActive = true,
                IsSamplePolicy = request.IsSamplePolicy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.PolicyDocuments.Add(policy);
            await _dbContext.SaveChangesAsync();

            return Ok(policy);
        }

        // PUT: api/PolicyDocuments/{id}
        // Publishes edits as a new version so the previous text remains available.
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Administrator,Staff")]
        public async Task<IActionResult> PublishPolicyRevision(
            Guid id,
            [FromBody] SavePolicyDocumentRequest request)
        {
            var currentPolicy = await _dbContext.PolicyDocuments.FindAsync(id);

            if (currentPolicy == null)
            {
                return NotFound("Policy document not found.");
            }

            if (string.IsNullOrWhiteSpace(request.PolicyType) ||
                string.IsNullOrWhiteSpace(request.Title) ||
                string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest("Policy type, title and content are required.");
            }

            var policyType = request.PolicyType.Trim();
            var previousVersions = await _dbContext.PolicyDocuments
                .Where(policy => policy.PolicyType == policyType)
                .ToListAsync();

            foreach (var previousPolicy in previousVersions)
            {
                previousPolicy.IsActive = false;
                previousPolicy.UpdatedAt = DateTime.UtcNow;
            }

            var revisedPolicy = new PolicyDocument
            {
                PolicyDocumentId = Guid.NewGuid(),
                PolicyType = policyType,
                Title = request.Title.Trim(),
                Content = request.Content.Trim(),
                Version = previousVersions.Count == 0
                    ? 1
                    : previousVersions.Max(item => item.Version) + 1,
                IsActive = true,
                IsSamplePolicy = request.IsSamplePolicy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.PolicyDocuments.Add(revisedPolicy);
            await _dbContext.SaveChangesAsync();

            return Ok(revisedPolicy);
        }
    }

    /// <summary>
    /// Request body for publishing a policy or a revised policy version.
    /// Keep IsSamplePolicy true until the content has been confirmed as official.
    /// </summary>
    public class SavePolicyDocumentRequest
    {
        public string PolicyType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsSamplePolicy { get; set; } = true;
    }
}