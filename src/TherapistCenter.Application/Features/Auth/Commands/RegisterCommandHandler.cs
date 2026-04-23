using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.Interfaces;

namespace TherapistCenter.Application.Features.Auth.Commands;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, ApiResponse<string>>
{
    private readonly IAuthService _authService;

    public RegisterCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<ApiResponse<string>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var dto = request.RegisterDto;
        var result = await _authService.RegisterAsync(dto.Email, dto.Password, dto.FullName, dto.Role);

        if (!result.Success)
        {
            return ApiResponse<string>.FailureResponse(result.Error ?? "Registration failed.");
        }

        return ApiResponse<string>.SuccessResponse("User registered successfully.", "Registration successful.");
    }
}
