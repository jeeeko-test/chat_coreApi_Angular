using Microsoft.EntityFrameworkCore.Migrations;

namespace JobTask.Migrations
{
    public partial class addSenderIdToMessage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "senderId",
                table: "Messages",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "senderId",
                table: "Messages");
        }
    }
}
