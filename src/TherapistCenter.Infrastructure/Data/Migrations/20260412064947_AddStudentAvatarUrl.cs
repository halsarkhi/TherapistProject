using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TherapistCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentAvatarUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Students");
        }
    }
}
