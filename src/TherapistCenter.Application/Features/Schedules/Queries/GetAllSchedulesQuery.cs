using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Schedules;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Schedules.Queries;

public record GetAllSchedulesQuery : IRequest<ApiResponse<List<SessionScheduleDto>>>;

public class GetAllSchedulesQueryHandler : IRequestHandler<GetAllSchedulesQuery, ApiResponse<List<SessionScheduleDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllSchedulesQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<SessionScheduleDto>>> Handle(GetAllSchedulesQuery request, CancellationToken cancellationToken)
    {
        var schedules = await _unitOfWork.SessionSchedules.GetAllWithDetailsAsync();
        var scheduleDtos = schedules.Select(s => s.ToDto()).ToList();
        return ApiResponse<List<SessionScheduleDto>>.SuccessResponse(scheduleDtos, "All schedules retrieved successfully");
    }
}
