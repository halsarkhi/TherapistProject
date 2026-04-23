using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Application.DTOs.Sessions;

public class CreateSessionDto
{
    public Guid StudentId { get; set; }
    public SessionType SessionType { get; set; }
    public DateTime SessionDate { get; set; }
    public string? Summary { get; set; }
    public string? Notes { get; set; }
}
