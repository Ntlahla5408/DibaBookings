namespace DIBA_Backend.Models.Entities
{
    public class BookingStatus
    {
        public Guid BookingStatusId { get; set; }

        public required string StatusName { get; set; }

        public string StatusDescription { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
