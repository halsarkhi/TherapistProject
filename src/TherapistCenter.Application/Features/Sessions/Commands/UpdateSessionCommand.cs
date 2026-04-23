using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Sessions;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Sessions.Commands;

public record UpdateSessionCommand(Guid Id, UpdateSessionDto Dto) : IRequest<ApiResponse<TherapySessionDto>>;

public class UpdateSessionCommandHandler : IRequestHandler<UpdateSessionCommand, ApiResponse<TherapySessionDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateSessionCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<TherapySessionDto>> Handle(UpdateSessionCommand request, CancellationToken cancellationToken)
    {
        var session = await _unitOfWork.TherapySessions.GetByIdAsync(request.Id);

        if (session is null)
            return ApiResponse<TherapySessionDto>.FailureResponse("Session not found");

        if (request.Dto.Summary is not null)
            session.Summary = request.Dto.Summary;

        if (request.Dto.Notes is not null)
            session.Notes = request.Dto.Notes;

        session.Status = request.Dto.Status;
        session.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.TherapySessions.Update(session);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<TherapySessionDto>.SuccessResponse(session.ToDto(), "Session updated successfully");
    }
}
