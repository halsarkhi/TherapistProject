using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Domain.Entities;

public class Student : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public DisabilityType DisabilityType { get; set; }
    public string ParentId { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<TherapySession> TherapySessions { get; set; } = new List<TherapySession>();
    public ICollection<SessionSchedule> SessionSchedules { get; set; } = new List<SessionSchedule>();
}
