using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Sessions;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Sessions.Queries;

public record GetSessionsByTherapistQuery(Guid TherapistId) : IRequest<ApiResponse<IReadOnlyList<TherapySessionDto>>>;

public class GetSessionsByTherapistQueryHandler : IRequestHandler<GetSessionsByTherapistQuery, ApiResponse<IReadOnlyList<TherapySessionDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetSessionsByTherapistQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<IReadOnlyList<TherapySessionDto>>> Handle(GetSessionsByTherapistQuery request, CancellationToken cancellationToken)
    {
        var sessions = await _unitOfWork.TherapySessions.GetByTherapistIdAsync(request.TherapistId);
        var dtos = sessions.Select(s => s.ToDto()).ToList().AsReadOnly();
        return ApiResponse<IReadOnlyList<TherapySessionDto>>.SuccessResponse(dtos, "Sessions retrieved successfully");
    }
}
