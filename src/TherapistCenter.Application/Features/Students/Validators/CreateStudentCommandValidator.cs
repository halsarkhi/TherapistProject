using FluentValidation;
using TherapistCenter.Application.Features.Students.Commands;

namespace TherapistCenter.Application.Features.Students.Validators;

public class CreateStudentCommandValidator : AbstractValidator<CreateStudentCommand>
{
    public CreateStudentCommandValidator()
    {
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

        // ParentId is required only when parent creation fields are not provided
        RuleFor(x => x.Dto.ParentId)
            .NotEmpty().WithMessage("Parent ID is required when parent creation fields are not provided")
            .When(x => string.IsNullOrWhiteSpace(x.Dto.ParentName)
                     || string.IsNullOrWhiteSpace(x.Dto.ParentEmail)
                     || string.IsNullOrWhiteSpace(x.Dto.ParentPassword));

        // When creating a new parent, all parent fields are required
        RuleFor(x => x.Dto.ParentName)
            .NotEmpty().WithMessage("Parent name is required when creating a new parent")
            .When(x => string.IsNullOrWhiteSpace(x.Dto.ParentId));

        RuleFor(x => x.Dto.ParentEmail)
            .NotEmpty().WithMessage("Parent email is required when creating a new parent")
            .EmailAddress().WithMessage("Parent email must be a valid email address")
            .When(x => string.IsNullOrWhiteSpace(x.Dto.ParentId));

        RuleFor(x => x.Dto.ParentPassword)
            .NotEmpty().WithMessage("Parent password is required when creating a new parent")
            .MinimumLength(6).WithMessage("Parent password must be at least 6 characters")
            .When(x => string.IsNullOrWhiteSpace(x.Dto.ParentId));
    }
}
