using DIBA_Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DIBA_Backend.Data
{
    public class DIBABookingsDbContext : DbContext
    {
        public DIBABookingsDbContext(DbContextOptions<DIBABookingsDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Role>()
                .HasMany(r => r.Users)
                .WithOne(u => u.Role)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Role>().HasData(
                new Role
                {
                    RoleId = new Guid("11111111-1111-1111-1111-111111111111"),
                    RoleName = "Administrator"
                },
                new Role
                {
                    RoleId = new Guid("22222222-2222-2222-2222-222222222222"),
                    RoleName = "Staff"
                },
                new Role
                {
                    RoleId = new Guid("33333333-3333-3333-3333-333333333333"),
                    RoleName = "Event Organiser"
                }
            );
        }
    }
}
