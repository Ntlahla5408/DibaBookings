namespace DIBA_Backend.Dto.Venue
{
    public class UpdateVenueDto
    {
        public required string VenueName { get; set; }

        public string VenueDescription { get; set; } = string.Empty; 
        
        public int Capacity { get; set; }

        public string Location { get; set; } = string.Empty; 
        
        public string VenueStatus { get; set; } = string.Empty;
    }
}
