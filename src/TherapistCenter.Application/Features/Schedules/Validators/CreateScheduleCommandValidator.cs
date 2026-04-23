using FluentValidation;
using Microsoft.Extensions.Options;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.Features.Schedules.Commands;

namespace TherapistCenter.Application.Features.Schedules.Validators;

public class CreateScheduleCommandValidator : AbstractValidator<CreateScheduleCommand>
{
    public CreateScheduleCommandValidator(IOptions<SessionSchedulingOptions> options)
    {
        var opts = options.Value;
        var duration = TimeSpan.FromMinutes(opts.SessionDurationMinutes);
        var dayStart = TimeSpan.FromHours(opts.DayStartHour);
        var dayEnd = TimeSpan.FromHours(opts.DayEndHour);

        RuleFor(x => x.Dto.StudentId)
            .NotEmpty().WithMessage("Student ID is required");

        RuleFor(x => x.Dto.TherapistId)
            .NotEmpty().WithMessage("Therapist ID is required");

        RuleFor(x => x.Dto.DayOfWeek)
            .IsInEnum().WithMessage("Valid day of week is required");

        RuleFor(x => x.Dto.StartTime)
            .LessThan(x => x.Dto.EndTime).WithMessage("Start time must be before end time")
            .GreaterThanOrEqualTo(dayStart).WithMessage($"Session must start no earlier than {dayStart:hh\\:mm}")
            .LessThan(dayEnd).WithMessage($"Session must start before {dayEnd:hh\\:mm}");

        RuleFor(x => x.Dto.EndTime)
            .LessThanOrEqualTo(dayEnd).WithMessage($"Session must end no later than {dayEnd:hh\\:mm}");

        RuleFor(x => x.Dto)
            .Must(d => (d.EndTime - d.StartTime) == duration)
            .WithMessage($"Session duration must be exactly {opts.SessionDurationMinutes} minutes");

        RuleFor(x => x.Dto.RoomName)
            .NotEmpty().WithMessage("Room name is required")
            .MaximumLength(100).WithMessage("Room name must not exceed 100 characters");
    }
}
