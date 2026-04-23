using FluentValidation;
using TherapistCenter.Application.Features.Messages.Commands;
using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Application.Features.Messages.Validators;

public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
{
    public SendMessageCommandValidator()
    {
        RuleFor(x => x.Dto.RecipientId)
            .NotEmpty().WithMessage("Recipient ID is required.");

        RuleFor(x => x.Dto.MessageType)
            .IsInEnum().WithMessage("A valid message type is required.");

        RuleFor(x => x.Dto.Content)
            .NotEmpty().WithMessage("Content is required for custom messages.")
            .When(x => x.Dto.MessageType == MessageType.Custom);

        RuleFor(x => x.SenderId)
            .NotEmpty().WithMessage("Sender ID is required.");
    }
}
