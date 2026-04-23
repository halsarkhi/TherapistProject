using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Auth;

namespace TherapistCenter.Application.Features.Auth.Commands;

public record RegisterCommand(RegisterDto RegisterDto) : IRequest<ApiResponse<string>>;
