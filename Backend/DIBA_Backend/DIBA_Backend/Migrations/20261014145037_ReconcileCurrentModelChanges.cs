using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DIBA_Backend.Migrations
{
    public partial class ReconcileCurrentModelChanges : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // The existing database already contains EmailDeliveryLogs.
            // No schema changes should be made by this migration.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Preserve the existing database table and its data.
        }
    }
}
