using System.ComponentModel.DataAnnotations;

namespace DIBA_Backend.Dto.Authentication
{
    public class ResetPasswordDto
    {
        [Required]
        public required string Token { get; set; }

        [Required]
        [MinLength(8)]
        public required string NewPassword { get; set; }
    }
}
