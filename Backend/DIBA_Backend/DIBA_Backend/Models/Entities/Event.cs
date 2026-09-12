namespace DIBA_Backend.Models.Entities
{
    public class Event
    {
        public Guid EventId { get; set; }

        public required string EventName { get; set; }
        
        public required string EventDescription { get; set; }

        public string ? EventType { get; set; }

        public string ? EventAttendance { get; set; }

        public DateTime StartDateTime { get; set; }

        public DateTime EndDateTime { get; set; }

        public Guid VenueId { get; set; }

        public Guid UserId { get; set; }

        // Navigation properties
        public Venue? Venue { get; set; }

        public User? User { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
