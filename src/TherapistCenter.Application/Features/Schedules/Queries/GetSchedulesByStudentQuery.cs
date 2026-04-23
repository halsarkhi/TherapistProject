using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Schedules;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Schedules.Queries;

public record GetSchedulesByStudentQuery(Guid StudentId) : IRequest<ApiResponse<List<SessionScheduleDto>>>;

public class GetSchedulesByStudentQueryHandler : IRequestHandler<GetSchedulesByStudentQuery, ApiResponse<List<SessionScheduleDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetSchedulesByStudentQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<SessionScheduleDto>>> Handle(GetSchedulesByStudentQuery request, CancellationToken cancellationToken)
    {
        var schedules = await _unitOfWork.SessionSchedules.GetByStudentIdAsync(request.StudentId);
        var scheduleDtos = schedules.Select(s => s.ToDto()).ToList();
        return ApiResponse<List<SessionScheduleDto>>.SuccessResponse(scheduleDtos, "Schedules retrieved successfully");
    }
}
