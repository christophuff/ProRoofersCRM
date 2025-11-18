namespace ProRoofersCRM.Api.Models
{
    public class Project
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }
        
        public required string ProjectName { get; set; }
        public string? Description { get; set; }
        
        // Status tracking
        public ProjectStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EstimateDate { get; set; }
        public DateTime? ContractSignedDate { get; set; }
        public DateTime? ScheduledStartDate { get; set; }
        public DateTime? CompletionDate { get; set; }
        
        // Financial
        public decimal? EstimatedCost { get; set; }
        public decimal? FinalCost { get; set; }
        public decimal? AmountPaid { get; set; }
        
        // Work details
        public required string ShingleType { get; set; }
        public required string ShingleColor { get; set; }
        public bool HasMetalWork { get; set; }
        public string? MetalWorkDescription { get; set; }
        
        public string? Notes { get; set; }
    }

    public enum ProjectStatus
    {
        Lead,
        Estimate,
        ContractSigned,
        Scheduled,
        InProgress,
        Completed,
        Cancelled
    }
}