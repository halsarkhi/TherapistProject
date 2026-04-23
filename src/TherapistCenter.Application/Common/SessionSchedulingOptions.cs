namespace TherapistCenter.Application.Common;

public class SessionSchedulingOptions
{
    public const string SectionName = "SessionScheduling";

    public int SessionDurationMinutes { get; set; } = 45;
    public int DayStartHour { get; set; } = 8;
    public int DayEndHour { get; set; } = 14;
}
