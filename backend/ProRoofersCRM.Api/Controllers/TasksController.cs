using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ProRoofersCRM.Api.Data;
using ProRoofersCRM.Api.Models;
using Microsoft.AspNetCore.Authorization;

namespace ProRoofersCRM.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Tasks - Everyone sees all tasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkTask>>> GetTasks()
        {
            return await _context.Tasks
                .Include(t => t.AssignedTo)
                .Include(t => t.CreatedBy)
                .Include(t => t.Customer)
                .Include(t => t.Project)
                .OrderBy(t => t.DueDate)
                .ThenBy(t => t.Priority)
                .ToListAsync();
        }

        // GET: api/Tasks/5 - Everyone can view any task
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkTask>> GetTask(int id)
        {
            var task = await _context.Tasks
                .Include(t => t.AssignedTo)
                .Include(t => t.CreatedBy)
                .Include(t => t.Customer)
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return NotFound();
            return task;
        }

        // POST: api/Tasks - EVERYONE can create and assign tasks
        [HttpPost]
        public async Task<ActionResult<WorkTask>> PostTask(WorkTask task)
        {
            var currentUserId = GetCurrentUserId();
            
            task.CreatedById = currentUserId;
            task.CreatedAt = DateTime.UtcNow;
            
            // Fix PostgreSQL DateTime issue - convert DueDate to UTC if it has a value
            if (task.DueDate.HasValue && task.DueDate.Value.Kind == DateTimeKind.Unspecified)
            {
                task.DueDate = DateTime.SpecifyKind(task.DueDate.Value, DateTimeKind.Utc);
            }
            
            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTask", new { id = task.Id }, task);
        }

        // PUT: api/Tasks/5 - Staff can only edit assigned tasks, Admin can edit any
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask(int id, UpdateTaskDto updateDto)
        {
            var currentUserId = GetCurrentUserId();
            var currentUser = await _context.Users.FindAsync(currentUserId);
            var existingTask = await _context.Tasks.FindAsync(id);

            if (existingTask == null) return NotFound();

            // Permission check
            if (currentUser?.Role == UserRole.Staff && existingTask.AssignedToId != currentUserId)
            {
                return Forbid("You can only edit tasks assigned to you.");
            }

            // Fix DateTime issue
            if (updateDto.DueDate.HasValue && updateDto.DueDate.Value.Kind == DateTimeKind.Unspecified)
            {
                updateDto.DueDate = DateTime.SpecifyKind(updateDto.DueDate.Value, DateTimeKind.Utc);
            }

            // Update only the allowed fields
            existingTask.Title = updateDto.Title;
            existingTask.Description = updateDto.Description;
            existingTask.Priority = updateDto.Priority;
            existingTask.Status = updateDto.Status;
            existingTask.AssignedToId = updateDto.AssignedToId;
            existingTask.CustomerId = updateDto.CustomerId;
            existingTask.ProjectId = updateDto.ProjectId;
            existingTask.DueDate = updateDto.DueDate;
            existingTask.CompletedAt = updateDto.CompletedAt;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Tasks/5 - Staff can only delete assigned tasks, Admin can delete any
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var currentUserId = GetCurrentUserId();
            var currentUser = await _context.Users.FindAsync(currentUserId);
            var task = await _context.Tasks.FindAsync(id);

            if (task == null) return NotFound();

            // Staff can only delete tasks assigned to them, Admin can delete any
            if (currentUser?.Role == UserRole.Staff && task.AssignedToId != currentUserId)
            {
                return Forbid("You can only delete tasks assigned to you.");
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(userIdClaim?.Value ?? "0");
        }

        private bool TaskExists(int id)
        {
            return _context.Tasks.Any(e => e.Id == id);
        }
    }
}