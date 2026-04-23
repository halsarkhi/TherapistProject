using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Schedules.Commands;

public record DeleteScheduleCommand(Guid Id) : IRequest<ApiResponse<bool>>;

public class DeleteScheduleCommandHandler : IRequestHandler<DeleteScheduleCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteScheduleCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(DeleteScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _unitOfWork.SessionSchedules.GetByIdAsync(request.Id);

        if (schedule is null || schedule.IsDeleted)
            return ApiResponse<bool>.FailureResponse("Schedule not found");

        schedule.IsDeleted = true;
        schedule.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.SessionSchedules.Update(schedule);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Schedule deleted successfully");
    }
}
