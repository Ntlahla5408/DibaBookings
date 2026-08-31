namespace DIBA_Backend.Models.Entities
{
    public class Venue
    {
        public Guid VenueId { get; set; }

        public required string VenueName { get; set; } = string.Empty;

        public string VenueDescription { get; set; } = string.Empty;

        public int Capacity { get; set; }

        public string Location { get; set; } = string.Empty;

        public required string VenueStatus { get; set; } = string.Empty;
        
        // Navigation property
        public ICollection<Event> Events { get; set; } = new List<Event>();

        public ICollection<VenueFeature> VenueFeatures { get; set; } = new List<VenueFeature>();

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
