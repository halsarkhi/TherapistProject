using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Messages;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Messages.Queries;

public record GetMessagesBySenderQuery(Guid SenderId) : IRequest<ApiResponse<List<MessageDto>>>;

public class GetMessagesBySenderQueryHandler : IRequestHandler<GetMessagesBySenderQuery, ApiResponse<List<MessageDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetMessagesBySenderQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<MessageDto>>> Handle(GetMessagesBySenderQuery request, CancellationToken cancellationToken)
    {
        var messages = await _unitOfWork.Messages.FindAsync(m => m.SenderId == request.SenderId && !m.IsDeleted);
        var dtos = messages
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => m.ToDto())
            .ToList();
        return ApiResponse<List<MessageDto>>.SuccessResponse(dtos, "Sent messages retrieved successfully.");
    }
}
