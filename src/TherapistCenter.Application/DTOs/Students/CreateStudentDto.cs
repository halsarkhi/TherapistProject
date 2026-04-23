using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Application.DTOs.Students;

public class CreateStudentDto
{
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public DisabilityType DisabilityType { get; set; }
    public string? ParentId { get; set; }
    public string? Notes { get; set; }
    public string? AvatarUrl { get; set; }

    // Optional: provide these to auto-create a parent account
    public string? ParentName { get; set; }
    public string? ParentEmail { get; set; }
    public string? ParentPhone { get; set; }
    public string? ParentPassword { get; set; }
}
