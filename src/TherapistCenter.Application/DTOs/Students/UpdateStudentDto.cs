using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Application.DTOs.Students;

public class UpdateStudentDto
{
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public DisabilityType DisabilityType { get; set; }
    public string? Notes { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; }
}
