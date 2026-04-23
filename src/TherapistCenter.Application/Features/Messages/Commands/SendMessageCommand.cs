using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Messages;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Enums;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Messages.Commands;

public record SendMessageCommand(CreateMessageDto Dto, Guid SenderId) : IRequest<ApiResponse<MessageDto>>;

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, ApiResponse<MessageDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public SendMessageCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<MessageDto>> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var sender = await _unitOfWork.Staff.GetByIdAsync(request.SenderId);
        if (sender is null)
            return ApiResponse<MessageDto>.FailureResponse("Sender staff not found.");

        var content = request.Dto.MessageType switch
        {
            MessageType.ArrivedSafely => "وصل الطالب بسلامة إلى المركز",
            MessageType.SessionCompleted => "تمت الجلسة العلاجية بنجاح",
            MessageType.NeedsSupplies => "يرجى توفير المستلزمات المطلوبة للطالب",
            MessageType.Custom => request.Dto.Content,
            _ => request.Dto.Content
        };

        var message = new Domain.Entities.Message
        {
            SenderId = request.SenderId,
            RecipientId = request.Dto.RecipientId,
            MessageType = request.Dto.MessageType,
            Content = content
        };

        await _unitOfWork.Messages.AddAsync(message);
        await _unitOfWork.SaveChangesAsync();

        var dto = message.ToDto(sender.FullName, sender.Specialization.ToString());
        return ApiResponse<MessageDto>.SuccessResponse(dto, "Message sent successfully.");
    }
}
