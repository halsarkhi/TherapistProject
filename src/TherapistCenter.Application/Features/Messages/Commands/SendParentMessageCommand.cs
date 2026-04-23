using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Messages;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Entities;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Messages.Commands;

public record SendParentMessageCommand(
    string SenderUserId,
    string SenderDisplayName,
    string RecipientUserId,
    string Content
) : IRequest<ApiResponse<MessageDto>>;

public class SendParentMessageCommandHandler : IRequestHandler<SendParentMessageCommand, ApiResponse<MessageDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public SendParentMessageCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<MessageDto>> Handle(SendParentMessageCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return ApiResponse<MessageDto>.FailureResponse("Message content is required.");

        if (string.IsNullOrWhiteSpace(request.RecipientUserId))
            return ApiResponse<MessageDto>.FailureResponse("Recipient is required.");

        var message = new Message
        {
            SenderId = null,
            SenderUserId = request.SenderUserId,
            SenderDisplayName = request.SenderDisplayName,
            RecipientId = request.RecipientUserId,
            MessageType = Domain.Enums.MessageType.Custom,
            Content = request.Content
        };

        await _unitOfWork.Messages.AddAsync(message);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<MessageDto>.SuccessResponse(message.ToDto(), "Message sent successfully.");
    }
}
