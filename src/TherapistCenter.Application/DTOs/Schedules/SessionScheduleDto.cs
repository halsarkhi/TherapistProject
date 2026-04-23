namespace TherapistCenter.Application.DTOs.Schedules;

public class SessionScheduleDto
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid TherapistId { get; set; }
    public string TherapistName { get; set; } = string.Empty;
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
