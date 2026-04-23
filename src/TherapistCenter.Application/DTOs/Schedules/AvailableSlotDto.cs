namespace TherapistCenter.Application.DTOs.Schedules;

public class AvailableSlotDto
{
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsAvailable { get; set; }
    public string? OccupiedBy { get; set; }
    public Guid? OccupiedByStudentId { get; set; }
}
