using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Messages.Commands;

public record MarkAsReadCommand(Guid MessageId) : IRequest<ApiResponse<bool>>;

public class MarkAsReadCommandHandler : IRequestHandler<MarkAsReadCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _unitOfWork;

    public MarkAsReadCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(MarkAsReadCommand request, CancellationToken cancellationToken)
    {
        var message = await _unitOfWork.Messages.GetByIdAsync(request.MessageId);
        if (message is null)
            return ApiResponse<bool>.FailureResponse("Message not found.");

        if (message.IsRead)
            return ApiResponse<bool>.SuccessResponse(true, "Message already marked as read.");

        await _unitOfWork.Messages.MarkAsReadAsync(request.MessageId);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Message marked as read.");
    }
}
