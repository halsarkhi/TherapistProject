using FluentValidation;
using TherapistCenter.Application.Features.Staff.Commands;

namespace TherapistCenter.Application.Features.Staff.Validators;

public class CreateStaffCommandValidator : AbstractValidator<CreateStaffCommand>
{
    public CreateStaffCommandValidator()
    {
        RuleFor(x => x.Dto.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(200).WithMessage("Full name must not exceed 200 characters.");

        RuleFor(x => x.Dto.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Dto.Phone)
            .NotEmpty().WithMessage("Phone number is required.");

        RuleFor(x => x.Dto.Specialization)
            .IsInEnum().WithMessage("A valid specialization is required.");

        RuleFor(x => x.Dto.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters.");
    }
}
