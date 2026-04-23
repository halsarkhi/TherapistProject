using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Sessions;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Sessions.Queries;

public record GetSessionsByStudentQuery(Guid StudentId) : IRequest<ApiResponse<IReadOnlyList<TherapySessionDto>>>;

public class GetSessionsByStudentQueryHandler : IRequestHandler<GetSessionsByStudentQuery, ApiResponse<IReadOnlyList<TherapySessionDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetSessionsByStudentQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<IReadOnlyList<TherapySessionDto>>> Handle(GetSessionsByStudentQuery request, CancellationToken cancellationToken)
    {
        var sessions = await _unitOfWork.TherapySessions.GetByStudentIdAsync(request.StudentId);
        var dtos = sessions.Select(s => s.ToDto()).ToList().AsReadOnly();
        return ApiResponse<IReadOnlyList<TherapySessionDto>>.SuccessResponse(dtos, "Sessions retrieved successfully");
    }
}
