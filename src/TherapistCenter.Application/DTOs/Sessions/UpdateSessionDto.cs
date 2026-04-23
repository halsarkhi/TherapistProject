using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Application.DTOs.Sessions;

public class UpdateSessionDto
{
    public string? Summary { get; set; }
    public string? Notes { get; set; }
    public SessionStatus Status { get; set; }
}
