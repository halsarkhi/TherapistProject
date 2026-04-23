using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Schedules;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Schedules.Commands;

public record UpdateScheduleCommand(
    Guid Id,
    DayOfWeek? DayOfWeek,
    TimeSpan? StartTime,
    TimeSpan? EndTime,
    string? RoomName,
    bool? IsActive
) : IRequest<ApiResponse<SessionScheduleDto>>;

public class UpdateScheduleCommandHandler : IRequestHandler<UpdateScheduleCommand, ApiResponse<SessionScheduleDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateScheduleCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<SessionScheduleDto>> Handle(UpdateScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _unitOfWork.SessionSchedules.GetByIdAsync(request.Id);

        if (schedule is null || schedule.IsDeleted)
            return ApiResponse<SessionScheduleDto>.FailureResponse("Schedule not found");

        var newDay = request.DayOfWeek ?? schedule.DayOfWeek;
        var newStart = request.StartTime ?? schedule.StartTime;
        var newEnd = request.EndTime ?? schedule.EndTime;
        var newRoom = request.RoomName ?? schedule.RoomName;

        var timingChanged = request.DayOfWeek.HasValue || request.StartTime.HasValue || request.EndTime.HasValue;
        var roomChanged = request.RoomName is not null && request.RoomName != schedule.RoomName;

        if (timingChanged)
        {
            var therapistConflict = await _unitOfWork.SessionSchedules.FindTherapistConflictAsync(
                schedule.TherapistId, newDay, newStart, newEnd, schedule.Id);
            if (therapistConflict is not null)
            {
                return ApiResponse<SessionScheduleDto>.FailureResponse(
                    $"Therapist already has a session at this time with student '{therapistConflict.Student?.FullName}' " +
                    $"({therapistConflict.StartTime:hh\\:mm}–{therapistConflict.EndTime:hh\\:mm})");
            }

            var studentConflict = await _unitOfWork.SessionSchedules.FindStudentConflictAsync(
                schedule.StudentId, newDay, newStart, newEnd, schedule.Id);
            if (studentConflict is not null)
            {
                return ApiResponse<SessionScheduleDto>.FailureResponse(
                    $"Student already has a session at this time with therapist '{studentConflict.Therapist?.FullName}' " +
                    $"({studentConflict.StartTime:hh\\:mm}–{studentConflict.EndTime:hh\\:mm})");
            }
        }

        if (timingChanged || roomChanged)
        {
            var roomConflict = await _unitOfWork.SessionSchedules.FindRoomConflictAsync(
                newRoom, newDay, newStart, newEnd, schedule.Id);
            if (roomConflict is not null)
            {
                return ApiResponse<SessionScheduleDto>.FailureResponse(
                    $"Room '{newRoom}' is already booked at this time " +
                    $"({roomConflict.StartTime:hh\\:mm}–{roomConflict.EndTime:hh\\:mm})");
            }
        }

        schedule.DayOfWeek = newDay;
        schedule.StartTime = newStart;
        schedule.EndTime = newEnd;
        schedule.RoomName = newRoom;

        if (request.IsActive.HasValue)
            schedule.IsActive = request.IsActive.Value;

        schedule.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.SessionSchedules.Update(schedule);
        await _unitOfWork.SaveChangesAsync();

        // Reload with navigation properties
        var updated = await _unitOfWork.SessionSchedules.GetByIdAsync(schedule.Id);
        return ApiResponse<SessionScheduleDto>.SuccessResponse(updated!.ToDto(), "Schedule updated successfully");
    }
}
