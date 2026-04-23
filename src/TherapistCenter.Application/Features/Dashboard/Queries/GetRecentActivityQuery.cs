using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Dashboard;
using TherapistCenter.Domain.Enums;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Dashboard.Queries;

public record GetRecentActivityQuery : IRequest<ApiResponse<List<RecentActivityDto>>>;

public class GetRecentActivityQueryHandler : IRequestHandler<GetRecentActivityQuery, ApiResponse<List<RecentActivityDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetRecentActivityQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<RecentActivityDto>>> Handle(GetRecentActivityQuery request, CancellationToken cancellationToken)
    {
        var activities = new List<(DateTime Date, string Description, string PersonName)>();

        // Recently added students
        var students = await _unitOfWork.Students.GetAllAsync();
        var recentStudents = students
            .OrderByDescending(s => s.CreatedAt)
            .Take(10);

        foreach (var student in recentStudents)
        {
            activities.Add((student.CreatedAt, "New student registered", student.FullName));
        }

        // Completed sessions
        var completedSessions = await _unitOfWork.TherapySessions.FindAsync(s =>
            s.Status == SessionStatus.Completed && !s.IsDeleted);
        var recentCompletedSessions = completedSessions
            .OrderByDescending(s => s.UpdatedAt ?? s.CreatedAt)
            .Take(10);

        foreach (var session in recentCompletedSessions)
        {
            var sessionDate = session.UpdatedAt ?? session.CreatedAt;
            var therapistName = session.Therapist?.FullName ?? "Therapist";
            activities.Add((sessionDate, "Session completed", therapistName));
        }

        // New messages
        var messages = await _unitOfWork.Messages.FindAsync(m => !m.IsDeleted);
        var recentMessages = messages
            .OrderByDescending(m => m.CreatedAt)
            .Take(10);

        foreach (var message in recentMessages)
        {
            var senderName = message.Sender?.FullName ?? "Staff";
            activities.Add((message.CreatedAt, "New message sent", senderName));
        }

        // Combine, sort, and take top 10
        var result = activities
            .OrderByDescending(a => a.Date)
            .Take(10)
            .Select(a => new RecentActivityDto
            {
                Description = a.Description,
                PersonName = a.PersonName,
                TimeAgo = FormatTimeAgo(a.Date)
            })
            .ToList();

        return ApiResponse<List<RecentActivityDto>>.SuccessResponse(result, "Recent activities retrieved successfully");
    }

    private static string FormatTimeAgo(DateTime dateTime)
    {
        var timeSpan = DateTime.UtcNow - dateTime;

        if (timeSpan.TotalMinutes < 1)
            return "Just now";
        if (timeSpan.TotalMinutes < 60)
            return $"{(int)timeSpan.TotalMinutes} minutes ago";
        if (timeSpan.TotalHours < 24)
            return $"{(int)timeSpan.TotalHours} hours ago";
        if (timeSpan.TotalDays < 7)
            return $"{(int)timeSpan.TotalDays} days ago";
        if (timeSpan.TotalDays < 30)
            return $"{(int)(timeSpan.TotalDays / 7)} weeks ago";

        return $"{(int)(timeSpan.TotalDays / 30)} months ago";
    }
}
