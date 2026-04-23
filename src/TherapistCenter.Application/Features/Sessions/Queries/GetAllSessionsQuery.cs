using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Sessions;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Sessions.Queries;

public record GetAllSessionsQuery : IRequest<ApiResponse<IReadOnlyList<TherapySessionDto>>>;

public class GetAllSessionsQueryHandler : IRequestHandler<GetAllSessionsQuery, ApiResponse<IReadOnlyList<TherapySessionDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllSessionsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<IReadOnlyList<TherapySessionDto>>> Handle(GetAllSessionsQuery request, CancellationToken cancellationToken)
    {
        var sessions = await _unitOfWork.TherapySessions.GetAllAsync();
        var dtos = sessions.Select(s => s.ToDto()).ToList().AsReadOnly();
        return ApiResponse<IReadOnlyList<TherapySessionDto>>.SuccessResponse(dtos, "Sessions retrieved successfully");
    }
}
