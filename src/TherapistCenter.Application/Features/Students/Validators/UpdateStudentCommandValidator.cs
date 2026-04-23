using FluentValidation;
using TherapistCenter.Application.Features.Students.Commands;

namespace TherapistCenter.Application.Features.Students.Validators;

public class UpdateStudentCommandValidator : AbstractValidator<UpdateStudentCommand>
{
    public UpdateStudentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Student ID is required");

        RuleFor(x => x.Dto.FullName)
            .NotEmpty().WithMessage("Full name is required")
            .MaximumLength(200).WithMessage("Full name must not exceed 200 characters");

        RuleFor(x => x.Dto.DateOfBirth)
            .NotEmpty().WithMessage("Date of birth is required")
            .LessThan(DateTime.UtcNow).WithMessage("Date of birth must be in the past");

        RuleFor(x => x.Dto.Gender)
            .IsInEnum().WithMessage("Gender is required");

        RuleFor(x => x.Dto.DisabilityType)
            .IsInEnum().WithMessage("Disability type is required");
    }
}
