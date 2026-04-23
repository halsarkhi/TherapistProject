using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TherapistCenter.Application.DTOs.Auth;
using TherapistCenter.Application.Interfaces;
using TherapistCenter.Domain.Enums;
using TherapistCenter.Infrastructure.Identity;

namespace TherapistCenter.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<ApplicationUser> userManager, IJwtService jwtService, IConfiguration configuration)
    {
        _userManager = userManager;
        _jwtService = jwtService;
        _configuration = configuration;
    }

    public async Task<(bool Success, string Token, string Email, string FullName, string Role, DateTime ExpiresAt, string? Error)> LoginAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user is null)
        {
            return (false, string.Empty, string.Empty, string.Empty, string.Empty, default, "Invalid email or password.");
        }

        if (!user.IsActive)
        {
            return (false, string.Empty, string.Empty, string.Empty, string.Empty, default, "Account is deactivated. Please contact an administrator.");
        }

        var passwordValid = await _userManager.CheckPasswordAsync(user, password);

        if (!passwordValid)
        {
            return (false, string.Empty, string.Empty, string.Empty, string.Empty, default, "Invalid email or password.");
        }

        var token = _jwtService.GenerateToken(user);
        var expirationMinutes = int.Parse(_configuration["Jwt:ExpirationInMinutes"] ?? "60");
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        return (true, token, user.Email ?? string.Empty, user.FullName, user.Role.ToString(), expiresAt, null);
    }

    public async Task<(bool Success, string? Error)> RegisterAsync(string email, string password, string fullName, string role)
    {
        var existingUser = await _userManager.FindByEmailAsync(email);

        if (existingUser is not null)
        {
            return (false, "A user with this email already exists.");
        }

        if (!Enum.TryParse<UserRole>(role, ignoreCase: true, out var userRole))
        {
            return (false, "Invalid role specified.");
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            Role = userRole,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            return (false, errors);
        }

        await _userManager.AddToRoleAsync(user, userRole.ToString());

        return (true, null);
    }

    public async Task<(bool Success, string? UserId, string? Error)> RegisterAndGetUserIdAsync(string email, string password, string fullName, string role)
    {
        var existingUser = await _userManager.FindByEmailAsync(email);

        if (existingUser is not null)
        {
            return (false, null, "A user with this email already exists.");
        }

        if (!Enum.TryParse<UserRole>(role, ignoreCase: true, out var userRole))
        {
            return (false, null, "Invalid role specified.");
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            Role = userRole,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            return (false, null, errors);
        }

        await _userManager.AddToRoleAsync(user, userRole.ToString());

        return (true, user.Id, null);
    }

    public async Task<List<ParentUserDto>> GetUsersByRoleAsync(string role)
    {
        if (!Enum.TryParse<UserRole>(role, ignoreCase: true, out var userRole))
        {
            return new List<ParentUserDto>();
        }

        var users = await _userManager.Users
            .Where(u => u.Role == userRole && u.IsActive)
            .Select(u => new ParentUserDto
            {
                UserId = u.Id,
                FullName = u.FullName,
                Email = u.Email ?? string.Empty
            })
            .ToListAsync();

        return users;
    }
}
