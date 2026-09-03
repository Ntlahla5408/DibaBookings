namespace DIBA_Backend.Dto.AuditLog
{
    public class CreateAuditLogDto
    {
        public required string Action { get; set; }

        public string? LogDescription { get; set; }

        public Guid UserId { get; set; }
    }
}
