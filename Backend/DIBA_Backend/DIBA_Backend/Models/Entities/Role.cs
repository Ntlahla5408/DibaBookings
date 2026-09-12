namespace DIBA_Backend.Models.Entities
{
    public class Role
    {

        public Guid RoleId { get; set; }

        public string RoleName { get; set; } = string.Empty;

        // Navigation property
        public ICollection<User> Users { get; set; } = new List<User>();

    }
}
