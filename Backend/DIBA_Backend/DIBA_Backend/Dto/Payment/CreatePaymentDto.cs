namespace DIBA_Backend.Dto.Payment
{
    public class CreatePaymentDto
    {
        public decimal Amount { get; set; }

        public string? ReferenceNumber { get; set; }

        public Guid BookingId { get; set; }
    }
}
