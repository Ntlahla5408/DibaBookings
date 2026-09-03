namespace DIBA_Backend.Dto.Event
{
    public class EventResponseDto
    {
        public Guid EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public string EventDescription { get; set; } = string.Empty;
        public string? EventType { get; set; }
        public string? EventAttendance { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public Guid VenueId { get; set; }
        public Guid UserId { get; set; }
    }
}
