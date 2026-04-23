using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Domain.Entities;

public class Staff : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public Specialization Specialization { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? EmployeeNumber { get; set; }
    public string? MobilePhone { get; set; }
    public string? PhotoUrl { get; set; }
    public string? UserId { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<TherapySession> TherapySessions { get; set; } = new List<TherapySession>();
    public ICollection<SessionSchedule> SessionSchedules { get; set; } = new List<SessionSchedule>();
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
}
