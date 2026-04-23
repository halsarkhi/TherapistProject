using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Messages;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Messages.Queries;

public record GetUnreadMessagesQuery(string RecipientId) : IRequest<ApiResponse<List<MessageDto>>>;

public class GetUnreadMessagesQueryHandler : IRequestHandler<GetUnreadMessagesQuery, ApiResponse<List<MessageDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetUnreadMessagesQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<MessageDto>>> Handle(GetUnreadMessagesQuery request, CancellationToken cancellationToken)
    {
        var messages = await _unitOfWork.Messages.GetUnreadByRecipientIdAsync(request.RecipientId);
        var dtos = messages.Select(m => m.ToDto()).ToList();
        return ApiResponse<List<MessageDto>>.SuccessResponse(dtos, "Unread messages retrieved successfully.");
    }
}
