using TherapistCenter.Application.DTOs.Auth;

namespace TherapistCenter.Application.Interfaces;

public interface IAuthService
{
    Task<(bool Success, string Token, string Email, string FullName, string Role, DateTime ExpiresAt, string? Error)> LoginAsync(string email, string password);
    Task<(bool Success, string? Error)> RegisterAsync(string email, string password, string fullName, string role);
    Task<(bool Success, string? UserId, string? Error)> RegisterAndGetUserIdAsync(string email, string password, string fullName, string role);
    Task<List<ParentUserDto>> GetUsersByRoleAsync(string role);
}
