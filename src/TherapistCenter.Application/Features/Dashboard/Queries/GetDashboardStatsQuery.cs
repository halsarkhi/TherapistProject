using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Dashboard;
using TherapistCenter.Domain.Enums;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Dashboard.Queries;

public record GetDashboardStatsQuery : IRequest<ApiResponse<DashboardStatsDto>>;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, ApiResponse<DashboardStatsDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetDashboardStatsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<DashboardStatsDto>> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var totalStudents = await _unitOfWork.Students.CountAsync();
        var totalStaff = await _unitOfWork.Staff.CountAsync();

        // Active sessions: status = Scheduled and date is today
        var today = DateTime.UtcNow.Date;
        var todaySessions = await _unitOfWork.TherapySessions.FindAsync(s =>
            s.Status == SessionStatus.Scheduled &&
            s.SessionDate.Date == today &&
            !s.IsDeleted);
        var activeSessions = todaySessions.Count;

        // Unread messages
        var unreadMessages = await _unitOfWork.Messages.FindAsync(m => !m.IsRead && !m.IsDeleted);

        // Group students by disability type
        var allStudents = await _unitOfWork.Students.GetAllAsync();
        var studentsByDisability = allStudents
            .GroupBy(s => s.DisabilityType.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        var stats = new DashboardStatsDto
        {
            TotalStudents = totalStudents,
            TotalStaff = totalStaff,
            ActiveSessions = activeSessions,
            UnreadMessages = unreadMessages.Count,
            StudentsByDisability = studentsByDisability
        };

        return ApiResponse<DashboardStatsDto>.SuccessResponse(stats, "Dashboard stats retrieved successfully");
    }
}
