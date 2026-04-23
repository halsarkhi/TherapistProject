namespace TherapistCenter.Application.DTOs.Dashboard;

public class DashboardStatsDto
{
    public int TotalStudents { get; set; }
    public int TotalStaff { get; set; }
    public int ActiveSessions { get; set; }
    public int UnreadMessages { get; set; }
    public Dictionary<string, int> StudentsByDisability { get; set; } = new();
}
