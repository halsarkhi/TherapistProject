using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Sessions;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Enums;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Sessions.Commands;

public record CreateSessionCommand(CreateSessionDto Dto, Guid TherapistId) : IRequest<ApiResponse<TherapySessionDto>>;

public class CreateSessionCommandHandler : IRequestHandler<CreateSessionCommand, ApiResponse<TherapySessionDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateSessionCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<TherapySessionDto>> Handle(CreateSessionCommand request, CancellationToken cancellationToken)
    {
        var session = request.Dto.ToEntity(request.TherapistId);
        session.Status = SessionStatus.Scheduled;

        await _unitOfWork.TherapySessions.AddAsync(session);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<TherapySessionDto>.SuccessResponse(session.ToDto(), "Session created successfully");
    }
}
