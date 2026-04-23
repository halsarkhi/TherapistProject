namespace TherapistCenter.Domain.Entities;

public class SessionSchedule : BaseEntity
{
    public Guid StudentId { get; set; }
    public Guid TherapistId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Student Student { get; set; } = null!;
    public Staff Therapist { get; set; } = null!;
}
