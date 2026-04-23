using FluentValidation;
using TherapistCenter.Application.Features.Sessions.Commands;

namespace TherapistCenter.Application.Features.Sessions.Validators;

public class CreateSessionCommandValidator : AbstractValidator<CreateSessionCommand>
{
    public CreateSessionCommandValidator()
    {
        RuleFor(x => x.Dto.StudentId)
            .NotEmpty().WithMessage("StudentId is required");

        RuleFor(x => x.Dto.SessionType)
            .IsInEnum().WithMessage("SessionType must be a valid value");

        RuleFor(x => x.Dto.SessionDate)
            .NotEmpty().WithMessage("SessionDate is required")
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("SessionDate must be today or a future date");
    }
}
