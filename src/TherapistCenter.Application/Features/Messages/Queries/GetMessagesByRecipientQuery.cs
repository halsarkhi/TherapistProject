using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Messages;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Messages.Queries;

public record GetMessagesByRecipientQuery(string RecipientId) : IRequest<ApiResponse<List<MessageDto>>>;

public class GetMessagesByRecipientQueryHandler : IRequestHandler<GetMessagesByRecipientQuery, ApiResponse<List<MessageDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetMessagesByRecipientQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<MessageDto>>> Handle(GetMessagesByRecipientQuery request, CancellationToken cancellationToken)
    {
        var messages = await _unitOfWork.Messages.GetByRecipientIdAsync(request.RecipientId);
        var dtos = messages.Select(m => m.ToDto()).ToList();
        return ApiResponse<List<MessageDto>>.SuccessResponse(dtos, "Messages retrieved successfully.");
    }
}
