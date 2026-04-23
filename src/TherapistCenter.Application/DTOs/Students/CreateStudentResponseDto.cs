namespace TherapistCenter.Application.DTOs.Students;

public class CreateStudentResponseDto
{
    public StudentDto Student { get; set; } = null!;
    public ParentCredentialsDto? ParentCredentials { get; set; }
}

public class ParentCredentialsDto
{
    public string ParentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
}
