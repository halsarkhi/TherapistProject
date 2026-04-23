using FluentValidation;
using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Application.Features.Auth.Commands;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.RegisterDto.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.RegisterDto.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

        RuleFor(x => x.RegisterDto.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(200).WithMessage("Full name must not exceed 200 characters.");

        RuleFor(x => x.RegisterDto.Role)
            .NotEmpty().WithMessage("Role is required.")
            .Must(BeAValidRole).WithMessage("Role must be one of: Admin, Therapist, Parent.");
    }

    private static bool BeAValidRole(string role)
    {
        return Enum.TryParse<UserRole>(role, ignoreCase: true, out _);
    }
}
