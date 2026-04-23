using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Application.DTOs.Sessions;

public class TherapySessionDto
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid TherapistId { get; set; }
    public string TherapistName { get; set; } = string.Empty;
    public SessionType SessionType { get; set; }
    public DateTime SessionDate { get; set; }
    public string? Summary { get; set; }
    public string? Notes { get; set; }
    public SessionStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
