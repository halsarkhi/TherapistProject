using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Schedules;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Schedules.Commands;

public record CreateScheduleCommand(CreateScheduleDto Dto) : IRequest<ApiResponse<SessionScheduleDto>>;

public class CreateScheduleCommandHandler : IRequestHandler<CreateScheduleCommand, ApiResponse<SessionScheduleDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateScheduleCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<SessionScheduleDto>> Handle(CreateScheduleCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        // Verify student exists
        var student = await _unitOfWork.Students.GetByIdAsync(dto.StudentId);
        if (student is null || student.IsDeleted)
            return ApiResponse<SessionScheduleDto>.FailureResponse("Student not found");

        // Verify therapist exists
        var therapist = await _unitOfWork.Staff.GetByIdAsync(dto.TherapistId);
        if (therapist is null || therapist.IsDeleted)
            return ApiResponse<SessionScheduleDto>.FailureResponse("Therapist not found");

        // Conflict checks
        var therapistConflict = await _unitOfWork.SessionSchedules.FindTherapistConflictAsync(
            dto.TherapistId, dto.DayOfWeek, dto.StartTime, dto.EndTime);
        if (therapistConflict is not null)
        {
            return ApiResponse<SessionScheduleDto>.FailureResponse(
                $"Therapist already has a session at this time with student '{therapistConflict.Student?.FullName}' " +
                $"({therapistConflict.StartTime:hh\\:mm}–{therapistConflict.EndTime:hh\\:mm})");
        }

        var studentConflict = await _unitOfWork.SessionSchedules.FindStudentConflictAsync(
            dto.StudentId, dto.DayOfWeek, dto.StartTime, dto.EndTime);
        if (studentConflict is not null)
        {
            return ApiResponse<SessionScheduleDto>.FailureResponse(
                $"Student already has a session at this time with therapist '{studentConflict.Therapist?.FullName}' " +
                $"({studentConflict.StartTime:hh\\:mm}–{studentConflict.EndTime:hh\\:mm})");
        }

        var roomConflict = await _unitOfWork.SessionSchedules.FindRoomConflictAsync(
            dto.RoomName, dto.DayOfWeek, dto.StartTime, dto.EndTime);
        if (roomConflict is not null)
        {
            return ApiResponse<SessionScheduleDto>.FailureResponse(
                $"Room '{dto.RoomName}' is already booked at this time " +
                $"({roomConflict.StartTime:hh\\:mm}–{roomConflict.EndTime:hh\\:mm})");
        }

        var schedule = dto.ToEntity();

        await _unitOfWork.SessionSchedules.AddAsync(schedule);
        await _unitOfWork.SaveChangesAsync();

        // Reload with navigation properties
        var saved = await _unitOfWork.SessionSchedules.GetByIdAsync(schedule.Id);
        return ApiResponse<SessionScheduleDto>.SuccessResponse(saved!.ToDto(), "Schedule created successfully");
    }
}
