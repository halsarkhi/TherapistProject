using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Messages.Commands;

public record MarkAllAsReadCommand(string RecipientId) : IRequest<ApiResponse<int>>;

public class MarkAllAsReadCommandHandler : IRequestHandler<MarkAllAsReadCommand, ApiResponse<int>>
{
    private readonly IUnitOfWork _unitOfWork;

    public MarkAllAsReadCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<int>> Handle(MarkAllAsReadCommand request, CancellationToken cancellationToken)
    {
        var unreadMessages = await _unitOfWork.Messages.GetUnreadByRecipientIdAsync(request.RecipientId);

        if (unreadMessages.Count == 0)
            return ApiResponse<int>.SuccessResponse(0, "No unread messages found.");

        foreach (var message in unreadMessages)
        {
            await _unitOfWork.Messages.MarkAsReadAsync(message.Id);
        }

        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<int>.SuccessResponse(unreadMessages.Count, $"{unreadMessages.Count} messages marked as read.");
    }
}
