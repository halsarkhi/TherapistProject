using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Auth;
using TherapistCenter.Application.Interfaces;

namespace TherapistCenter.Application.Features.Auth.Commands;

public class LoginCommandHandler : IRequestHandler<LoginCommand, ApiResponse<AuthResponseDto>>
{
    private readonly IAuthService _authService;

    public LoginCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<ApiResponse<AuthResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request.LoginDto.Email, request.LoginDto.Password);

        if (!result.Success)
        {
            return ApiResponse<AuthResponseDto>.FailureResponse(result.Error ?? "Login failed.");
        }

        var response = new AuthResponseDto
        {
            Token = result.Token,
            Email = result.Email,
            FullName = result.FullName,
            Role = result.Role,
            ExpiresAt = result.ExpiresAt
        };

        return ApiResponse<AuthResponseDto>.SuccessResponse(response, "Login successful.");
    }
}
