using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Domain.Entities;

public class TherapySession : BaseEntity
{
    public Guid StudentId { get; set; }
    public Guid TherapistId { get; set; }
    public SessionType SessionType { get; set; }
    public DateTime SessionDate { get; set; }
    public string? Summary { get; set; }
    public string? Notes { get; set; }
    public SessionStatus Status { get; set; } = SessionStatus.Scheduled;

    // Navigation properties
    public Student Student { get; set; } = null!;
    public Staff Therapist { get; set; } = null!;
}
