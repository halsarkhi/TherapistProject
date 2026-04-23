using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Messages;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Messages.Queries;

public record GetConversationQuery(string UserAId, string UserBId) : IRequest<ApiResponse<List<MessageDto>>>;

public class GetConversationQueryHandler : IRequestHandler<GetConversationQuery, ApiResponse<List<MessageDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetConversationQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<MessageDto>>> Handle(GetConversationQuery request, CancellationToken cancellationToken)
    {
        var messages = await _unitOfWork.Messages.GetConversationAsync(request.UserAId, request.UserBId);
        var dtos = messages.Select(m => m.ToDto()).ToList();
        return ApiResponse<List<MessageDto>>.SuccessResponse(dtos, "Conversation retrieved successfully.");
    }
}
