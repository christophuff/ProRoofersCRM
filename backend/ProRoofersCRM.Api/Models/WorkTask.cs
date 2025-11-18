using System.ComponentModel.DataAnnotations;

namespace ProRoofersCRM.Api.Models
{
    public enum TaskStatus
    {
        Pending = 0,
        InProgress = 1, 
        Completed = 2,
        Cancelled = 3
    }

    public enum TaskPriority
    {
        Low = 0,
        Medium = 1,
        High = 2, 
        Urgent = 3
    }

    public class WorkTask
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public TaskStatus Status { get; set; } = TaskStatus.Pending;
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        
        // Foreign Keys  
        public int? CustomerId { get; set; }
        public int? ProjectId { get; set; }
        public int AssignedToId { get; set; }
        public int CreatedById { get; set; }
        
        // Navigation Properties
        public Customer? Customer { get; set; }
        public Project? Project { get; set; }
        public User? AssignedTo { get; set; }
        public User? CreatedBy { get; set; }
        
        // Dates
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}