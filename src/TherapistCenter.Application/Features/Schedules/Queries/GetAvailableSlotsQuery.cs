using MediatR;
using Microsoft.Extensions.Options;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Schedules;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Schedules.Queries;

public record GetAvailableSlotsQuery(Guid TherapistId, DayOfWeek DayOfWeek, Guid? StudentId = null)
    : IRequest<ApiResponse<List<AvailableSlotDto>>>;

public class GetAvailableSlotsQueryHandler
    : IRequestHandler<GetAvailableSlotsQuery, ApiResponse<List<AvailableSlotDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly SessionSchedulingOptions _options;

    public GetAvailableSlotsQueryHandler(
        IUnitOfWork unitOfWork,
        IOptions<SessionSchedulingOptions> options)
    {
        _unitOfWork = unitOfWork;
        _options = options.Value;
    }

    public async Task<ApiResponse<List<AvailableSlotDto>>> Handle(
        GetAvailableSlotsQuery request, CancellationToken cancellationToken)
    {
        var therapist = await _unitOfWork.Staff.GetByIdAsync(request.TherapistId);
        if (therapist is null || therapist.IsDeleted)
            return ApiResponse<List<AvailableSlotDto>>.FailureResponse("Therapist not found");

        var therapistDay = await _unitOfWork.SessionSchedules
            .GetTherapistDayScheduleAsync(request.TherapistId, request.DayOfWeek);

        var studentDay = request.StudentId.HasValue
            ? (await _unitOfWork.SessionSchedules.GetByStudentIdAsync(request.StudentId.Value))
                .Where(s => s.DayOfWeek == request.DayOfWeek && s.IsActive)
                .ToList()
            : new();

        var duration = TimeSpan.FromMinutes(_options.SessionDurationMinutes);
        var dayStart = TimeSpan.FromHours(_options.DayStartHour);
        var dayEnd = TimeSpan.FromHours(_options.DayEndHour);

        var slots = new List<AvailableSlotDto>();
        for (var t = dayStart; t + duration <= dayEnd; t += duration)
        {
            var slotEnd = t + duration;

            var therapistBusy = therapistDay.FirstOrDefault(s =>
                s.StartTime < slotEnd && s.EndTime > t);
            var studentBusy = studentDay.FirstOrDefault(s =>
                s.StartTime < slotEnd && s.EndTime > t);

            var isAvailable = therapistBusy is null && studentBusy is null;
            var busy = therapistBusy ?? studentBusy;

            slots.Add(new AvailableSlotDto
            {
                StartTime = t,
                EndTime = slotEnd,
                IsAvailable = isAvailable,
                OccupiedBy = busy is null ? null : (therapistBusy is not null ? "therapist" : "student"),
                OccupiedByStudentId = therapistBusy?.StudentId
            });
        }

        return ApiResponse<List<AvailableSlotDto>>.SuccessResponse(slots);
    }
}
