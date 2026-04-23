using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Application.DTOs.Students;

public class StudentDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public int Age => CalculateAge();
    public Gender Gender { get; set; }
    public DisabilityType DisabilityType { get; set; }
    public string ParentId { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    private int CalculateAge()
    {
        var today = DateTime.UtcNow;
        var age = today.Year - DateOfBirth.Year;
        if (DateOfBirth.Date > today.AddYears(-age))
            age--;
        return age;
    }
}
