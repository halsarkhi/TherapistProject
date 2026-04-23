using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Sessions;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Enums;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Sessions.Commands;

public record CompleteSessionCommand(Guid Id, string Summary, string Notes) : IRequest<ApiResponse<TherapySessionDto>>;

public class CompleteSessionCommandHandler : IRequestHandler<CompleteSessionCommand, ApiResponse<TherapySessionDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public CompleteSessionCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<TherapySessionDto>> Handle(CompleteSessionCommand request, CancellationToken cancellationToken)
    {
        var session = await _unitOfWork.TherapySessions.GetByIdAsync(request.Id);

        if (session is null)
            return ApiResponse<TherapySessionDto>.FailureResponse("Session not found");

        session.Status = SessionStatus.Completed;
        session.Summary = request.Summary;
        session.Notes = request.Notes;
        session.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.TherapySessions.Update(session);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<TherapySessionDto>.SuccessResponse(session.ToDto(), "Session completed successfully");
    }
}
