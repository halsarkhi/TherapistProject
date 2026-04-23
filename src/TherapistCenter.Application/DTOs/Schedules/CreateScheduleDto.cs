namespace TherapistCenter.Application.DTOs.Schedules;

public class CreateScheduleDto
{
    public Guid StudentId { get; set; }
    public Guid TherapistId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string RoomName { get; set; } = string.Empty;
}
