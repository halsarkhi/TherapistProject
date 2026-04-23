using FluentValidation;
using Microsoft.Extensions.Options;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.Features.Schedules.Commands;

namespace TherapistCenter.Application.Features.Schedules.Validators;

public class UpdateScheduleCommandValidator : AbstractValidator<UpdateScheduleCommand>
{
    public UpdateScheduleCommandValidator(IOptions<SessionSchedulingOptions> options)
    {
        var opts = options.Value;
        var duration = TimeSpan.FromMinutes(opts.SessionDurationMinutes);
        var dayStart = TimeSpan.FromHours(opts.DayStartHour);
        var dayEnd = TimeSpan.FromHours(opts.DayEndHour);

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Schedule ID is required");

        RuleFor(x => x.RoomName)
            .MaximumLength(100).WithMessage("Room name must not exceed 100 characters")
            .When(x => x.RoomName is not null);

        // If both start and end are provided, validate window + duration
        When(x => x.StartTime.HasValue && x.EndTime.HasValue, () =>
        {
            RuleFor(x => x.StartTime!.Value)
                .LessThan(x => x.EndTime!.Value).WithMessage("Start time must be before end time")
                .GreaterThanOrEqualTo(dayStart).WithMessage($"Session must start no earlier than {dayStart:hh\\:mm}")
                .LessThan(dayEnd).WithMessage($"Session must start before {dayEnd:hh\\:mm}");

            RuleFor(x => x.EndTime!.Value)
                .LessThanOrEqualTo(dayEnd).WithMessage($"Session must end no later than {dayEnd:hh\\:mm}");

            RuleFor(x => x)
                .Must(x => (x.EndTime!.Value - x.StartTime!.Value) == duration)
                .WithMessage($"Session duration must be exactly {opts.SessionDurationMinutes} minutes");
        });
    }
}
