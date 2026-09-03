namespace DIBA_Backend.Dto.VenueFeature
{
    public class CreateVenueFeatureDto
    {
        public required string FeatureName { get; set; }

        public string FeatureDescription { get; set; } = string.Empty;
        
        public required string FeatureStatus { get; set; }
    }
}
