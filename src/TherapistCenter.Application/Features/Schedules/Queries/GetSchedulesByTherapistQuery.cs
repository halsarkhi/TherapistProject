using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Schedules;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Schedules.Queries;

public record GetSchedulesByTherapistQuery(Guid TherapistId) : IRequest<ApiResponse<List<SessionScheduleDto>>>;

public class GetSchedulesByTherapistQueryHandler : IRequestHandler<GetSchedulesByTherapistQuery, ApiResponse<List<SessionScheduleDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetSchedulesByTherapistQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<SessionScheduleDto>>> Handle(GetSchedulesByTherapistQuery request, CancellationToken cancellationToken)
    {
        var schedules = await _unitOfWork.SessionSchedules.GetByTherapistIdAsync(request.TherapistId);
        var scheduleDtos = schedules.Select(s => s.ToDto()).ToList();
        return ApiResponse<List<SessionScheduleDto>>.SuccessResponse(scheduleDtos, "Schedules retrieved successfully");
    }
}
