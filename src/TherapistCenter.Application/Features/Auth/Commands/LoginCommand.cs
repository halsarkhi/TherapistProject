using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Auth;

namespace TherapistCenter.Application.Features.Auth.Commands;

public record LoginCommand(LoginDto LoginDto) : IRequest<ApiResponse<AuthResponseDto>>;
