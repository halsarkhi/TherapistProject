using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TherapistCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStaffEmployeeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmployeeNumber",
                table: "Staff",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MobilePhone",
                table: "Staff",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhotoUrl",
                table: "Staff",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmployeeNumber",
                table: "Staff");

            migrationBuilder.DropColumn(
                name: "MobilePhone",
                table: "Staff");

            migrationBuilder.DropColumn(
                name: "PhotoUrl",
                table: "Staff");
        }
    }
}
