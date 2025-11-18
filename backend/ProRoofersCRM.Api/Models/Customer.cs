namespace ProRoofersCRM.Api.Models
{
    public class Customer
    {
        public int Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Phone { get; set; }

        // Billing address
        public required string BillingStreet { get; set; }
        public required string BillingCity { get; set; }
        public required string BillingState { get; set; }
        public required string BillingZipCode { get; set; }

        // Property address (where work happens)
        public required string PropertyStreet { get; set; }
        public required string PropertyCity { get; set; }
        public required string PropertyState { get; set; }
        public required string PropertyZipCode { get; set; }

        public DateTime CreatedAt { get; set; }
        
        // Navigation properties
        public List<Project> Projects { get; set; } = new();
    }
}