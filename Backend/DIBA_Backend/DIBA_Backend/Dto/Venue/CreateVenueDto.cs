namespace DIBA_Backend.Dto.Venue
{
    public class CreateVenueDto
    {
        public Guid VenueId { get; set; }

        public string VenueName { get; set; } = string.Empty; 
        
        public string VenueDescription { get; set; } = string.Empty; 
        
        public int Capacity { get; set; }

        public string Location { get; set; } = string.Empty; 
        
        public string VenueStatus { get; set; } = string.Empty;
    }
}
