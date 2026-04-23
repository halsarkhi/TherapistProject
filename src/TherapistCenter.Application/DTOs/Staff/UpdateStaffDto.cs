using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Application.DTOs.Staff;

public class UpdateStaffDto
{
    public string FullName { get; set; } = string.Empty;
    public Specialization Specialization { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string? EmployeeNumber { get; set; }
    public string? MobilePhone { get; set; }
    public string? PhotoUrl { get; set; }
    public bool IsActive { get; set; }
}
