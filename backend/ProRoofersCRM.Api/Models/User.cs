namespace ProRoofersCRM.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public UserRole Role { get; set; } = UserRole.Staff;
        public DateTime CreatedAt { get; set; }
        
        // Navigation properties
        public List<WorkTask> AssignedTasks { get; set; } = new();
        public List<WorkTask> CreatedTasks { get; set; } = new();
    }

    public enum UserRole
    {
        Staff,
        Admin
    }
}