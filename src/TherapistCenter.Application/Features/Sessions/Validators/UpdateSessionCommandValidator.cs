using FluentValidation;
using TherapistCenter.Application.Features.Sessions.Commands;

namespace TherapistCenter.Application.Features.Sessions.Validators;

public class UpdateSessionCommandValidator : AbstractValidator<UpdateSessionCommand>
{
    public UpdateSessionCommandValidator()
    {
        RuleFor(x => x.Dto.Status)
            .IsInEnum().WithMessage("Status must be a valid enum value");
    }
}
