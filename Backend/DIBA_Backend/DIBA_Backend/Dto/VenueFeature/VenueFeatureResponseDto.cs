namespace DIBA_Backend.Dto.VenueFeature
{
    public class VenueFeatureResponseDto
    {
        public Guid VenueFeatureId { get; set; }

        public string FeatureName { get; set; } = string.Empty;
        
        public string FeatureDescription { get; set; } = string.Empty; 

        public string FeatureStatus { get; set; } = string.Empty; 

        public Guid VenueId { get; set; }
    }
}
