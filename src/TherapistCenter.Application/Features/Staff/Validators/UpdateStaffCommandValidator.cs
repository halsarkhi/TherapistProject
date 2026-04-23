using FluentValidation;
using TherapistCenter.Application.Features.Staff.Commands;

namespace TherapistCenter.Application.Features.Staff.Validators;

public class UpdateStaffCommandValidator : AbstractValidator<UpdateStaffCommand>
{
    public UpdateStaffCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Staff ID is required.");

        RuleFor(x => x.Dto.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(200).WithMessage("Full name must not exceed 200 characters.");

        RuleFor(x => x.Dto.Phone)
            .NotEmpty().WithMessage("Phone number is required.");

        RuleFor(x => x.Dto.Specialization)
            .IsInEnum().WithMessage("A valid specialization is required.");
    }
}
