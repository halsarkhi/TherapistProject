using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Sessions;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Sessions.Queries;

public record GetSessionByIdQuery(Guid Id) : IRequest<ApiResponse<TherapySessionDto>>;

public class GetSessionByIdQueryHandler : IRequestHandler<GetSessionByIdQuery, ApiResponse<TherapySessionDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetSessionByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<TherapySessionDto>> Handle(GetSessionByIdQuery request, CancellationToken cancellationToken)
    {
        var session = await _unitOfWork.TherapySessions.GetByIdAsync(request.Id);

        if (session is null)
            return ApiResponse<TherapySessionDto>.FailureResponse("Session not found");

        return ApiResponse<TherapySessionDto>.SuccessResponse(session.ToDto(), "Session retrieved successfully");
    }
}
