namespace DIBA_Backend.Models.Entities
{
    public class Payment
    {
        public Guid PaymentId { get; set; }

        public decimal Amount { get; set; }

        public DateTime PaymentDate { get; set; }

        public string? ReferenceNumber { get; set; }

        public Guid BookingId { get; set; }

        // Navigation property
        public Booking? Booking { get; set; }
    }
}
