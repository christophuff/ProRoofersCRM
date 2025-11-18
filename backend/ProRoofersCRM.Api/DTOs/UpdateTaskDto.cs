namespace ProRoofersCRM.Api.Models
{
    public class UpdateTaskDto
    {
        public required string Title { get; set; }
        public string? Description { get; set; }
        public TaskPriority Priority { get; set; }
        public TaskStatus Status { get; set; }
        public int AssignedToId { get; set; }
        public int? CustomerId { get; set; }
        public int? ProjectId { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}