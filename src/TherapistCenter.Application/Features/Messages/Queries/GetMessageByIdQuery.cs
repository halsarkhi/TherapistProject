using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Messages;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Messages.Queries;

public record GetMessageByIdQuery(Guid Id) : IRequest<ApiResponse<MessageDto>>;

public class GetMessageByIdQueryHandler : IRequestHandler<GetMessageByIdQuery, ApiResponse<MessageDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetMessageByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<MessageDto>> Handle(GetMessageByIdQuery request, CancellationToken cancellationToken)
    {
        var message = await _unitOfWork.Messages.GetByIdAsync(request.Id);

        if (message is null)
            return ApiResponse<MessageDto>.FailureResponse("Message not found.");

        return ApiResponse<MessageDto>.SuccessResponse(message.ToDto(), "Message retrieved successfully.");
    }
}
