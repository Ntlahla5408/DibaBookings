namespace DIBA_Backend.Models.Entities
{
    public class VenueFeature
    {
        public Guid VenueFeatureId { get; set; }

        public required string FeatureName { get; set; }

        public string FeatureDescription { get; set; } = string.Empty;

        public required string FeatureStatus { get; set; }

        public Guid VenueId { get; set; }

        // Navigation property
         public Venue? Venue { get; set; }
    }
}
