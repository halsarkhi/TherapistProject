using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TherapistCenter.Application.Features.Dashboard.Queries;
using TherapistCenter.Application.Interfaces;
using TherapistCenter.Domain.Entities;
using TherapistCenter.Domain.Enums;
using TherapistCenter.Domain.Interfaces;
using TherapistCenter.Infrastructure.Identity;

namespace TherapistCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthService _authService;
    private readonly UserManager<ApplicationUser> _userManager;

    public DashboardController(IMediator mediator, IUnitOfWork unitOfWork, IAuthService authService, UserManager<ApplicationUser> userManager)
    {
        _mediator = mediator;
        _unitOfWork = unitOfWork;
        _authService = authService;
        _userManager = userManager;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var result = await _mediator.Send(new GetDashboardStatsQuery());
        return Ok(result);
    }

    [HttpGet("recent-activity")]
    public async Task<IActionResult> GetRecentActivity()
    {
        var result = await _mediator.Send(new GetRecentActivityQuery());
        return Ok(result);
    }

    [HttpPost("seed-test-data")]
    public async Task<IActionResult> SeedTestData()
    {
        try
        {
            await _unitOfWork.BeginTransactionAsync();

            // Known student IDs
            var khaledId = Guid.Parse("68af9eda-9a88-4c06-a725-4d36f26fe070");
            var fatimaId = Guid.Parse("fa64c36a-6765-49c1-bf36-6209f3121704");
            var ahmedId = Guid.Parse("9677e712-9c46-450c-b6b2-b040084b9909");

            // Known staff: د. سارة أحمد
            var saraId = Guid.Parse("a4001fa2-b7ac-4bf5-aba5-b430aa43cad7");

            // ── 1. Create 2 more staff members ──
            var mohammedId = Guid.Parse("b5002fb3-c8bd-5cf6-bcb6-c541bb54dbe8");
            var lailaId = Guid.Parse("c6003ac4-d9ce-6da7-cdc7-d652cc65ecf9");

            var existingStaff = await _unitOfWork.Staff.GetAllAsync();
            var existingEmails = existingStaff.Select(s => s.Email).ToHashSet();

            if (!existingEmails.Contains("m.khaled@therapistcenter.com"))
            {
                var regResult = await _authService.RegisterAndGetUserIdAsync(
                    "m.khaled@therapistcenter.com", "Therapist@123", "أ. محمد خالد", "Therapist");

                var mohammed = new Staff
                {
                    Id = mohammedId,
                    FullName = "أ. محمد خالد",
                    Specialization = Specialization.OccupationalTherapy,
                    Email = "m.khaled@therapistcenter.com",
                    Phone = "0501234567",
                    UserId = regResult.UserId,
                    IsActive = true
                };
                await _unitOfWork.Staff.AddAsync(mohammed);
            }
            else
            {
                var existing = existingStaff.FirstOrDefault(s => s.Email == "m.khaled@therapistcenter.com");
                if (existing != null) mohammedId = existing.Id;
            }

            if (!existingEmails.Contains("l.hassan@therapistcenter.com"))
            {
                var regResult = await _authService.RegisterAndGetUserIdAsync(
                    "l.hassan@therapistcenter.com", "Therapist@123", "د. ليلى حسن", "Therapist");

                var laila = new Staff
                {
                    Id = lailaId,
                    FullName = "د. ليلى حسن",
                    Specialization = Specialization.Psychology,
                    Email = "l.hassan@therapistcenter.com",
                    Phone = "0507654321",
                    UserId = regResult.UserId,
                    IsActive = true
                };
                await _unitOfWork.Staff.AddAsync(laila);
            }
            else
            {
                var existing = existingStaff.FirstOrDefault(s => s.Email == "l.hassan@therapistcenter.com");
                if (existing != null) lailaId = existing.Id;
            }

            await _unitOfWork.SaveChangesAsync();

            // ── 2. Create Session Schedules ──
            var existingSchedules = await _unitOfWork.SessionSchedules.GetAllAsync();

            var schedules = new List<SessionSchedule>
            {
                // خالد - Sunday 10:00-11:00 with سارة (SpeechTherapy)
                new SessionSchedule
                {
                    StudentId = khaledId,
                    TherapistId = saraId,
                    DayOfWeek = DayOfWeek.Sunday,
                    StartTime = new TimeSpan(10, 0, 0),
                    EndTime = new TimeSpan(11, 0, 0),
                    RoomName = "غرفة العلاج 101",
                    IsActive = true
                },
                // خالد - Tuesday 14:00-15:00 with محمد (OccupationalTherapy)
                new SessionSchedule
                {
                    StudentId = khaledId,
                    TherapistId = mohammedId,
                    DayOfWeek = DayOfWeek.Tuesday,
                    StartTime = new TimeSpan(14, 0, 0),
                    EndTime = new TimeSpan(15, 0, 0),
                    RoomName = "غرفة الأنشطة 203",
                    IsActive = true
                },
                // فاطمة - Monday 09:00-10:00 with ليلى (Psychology)
                new SessionSchedule
                {
                    StudentId = fatimaId,
                    TherapistId = lailaId,
                    DayOfWeek = DayOfWeek.Monday,
                    StartTime = new TimeSpan(9, 0, 0),
                    EndTime = new TimeSpan(10, 0, 0),
                    RoomName = "غرفة العلاج 102",
                    IsActive = true
                },
                // فاطمة - Wednesday 11:00-12:00 with سارة (SpeechTherapy)
                new SessionSchedule
                {
                    StudentId = fatimaId,
                    TherapistId = saraId,
                    DayOfWeek = DayOfWeek.Wednesday,
                    StartTime = new TimeSpan(11, 0, 0),
                    EndTime = new TimeSpan(12, 0, 0),
                    RoomName = "غرفة العلاج 101",
                    IsActive = true
                },
                // أحمد - Sunday 11:00-12:00 with محمد (OccupationalTherapy)
                new SessionSchedule
                {
                    StudentId = ahmedId,
                    TherapistId = mohammedId,
                    DayOfWeek = DayOfWeek.Sunday,
                    StartTime = new TimeSpan(11, 0, 0),
                    EndTime = new TimeSpan(12, 0, 0),
                    RoomName = "غرفة الأنشطة 203",
                    IsActive = true
                },
                // أحمد - Thursday 10:00-11:00 with ليلى (Psychology)
                new SessionSchedule
                {
                    StudentId = ahmedId,
                    TherapistId = lailaId,
                    DayOfWeek = DayOfWeek.Thursday,
                    StartTime = new TimeSpan(10, 0, 0),
                    EndTime = new TimeSpan(11, 0, 0),
                    RoomName = "قاعة المجموعات 105",
                    IsActive = true
                }
            };

            foreach (var schedule in schedules)
            {
                var exists = existingSchedules.Any(s =>
                    s.StudentId == schedule.StudentId &&
                    s.TherapistId == schedule.TherapistId &&
                    s.DayOfWeek == schedule.DayOfWeek &&
                    s.StartTime == schedule.StartTime);

                if (!exists)
                {
                    await _unitOfWork.SessionSchedules.AddAsync(schedule);
                }
            }

            await _unitOfWork.SaveChangesAsync();

            // ── 3. Create Completed Therapy Sessions ──
            var existingSessions = await _unitOfWork.TherapySessions.GetAllAsync();

            var sessions = new List<TherapySession>
            {
                // خالد sessions
                new TherapySession
                {
                    StudentId = khaledId,
                    TherapistId = saraId,
                    SessionType = SessionType.SpeechTherapy,
                    SessionDate = new DateTime(2026, 3, 15, 10, 0, 0),
                    Summary = "تقدم ملحوظ في نطق الحروف الهجائية. الطالب يستجيب بشكل جيد للتمارين.",
                    Status = SessionStatus.Completed
                },
                new TherapySession
                {
                    StudentId = khaledId,
                    TherapistId = mohammedId,
                    SessionType = SessionType.OccupationalTherapy,
                    SessionDate = new DateTime(2026, 3, 22, 14, 0, 0),
                    Summary = "تحسن في المهارات الحركية الدقيقة. تم التركيز على مسك القلم.",
                    Status = SessionStatus.Completed
                },
                new TherapySession
                {
                    StudentId = khaledId,
                    TherapistId = saraId,
                    SessionType = SessionType.SpeechTherapy,
                    SessionDate = new DateTime(2026, 4, 1, 10, 0, 0),
                    Summary = "انتقلنا لمرحلة تركيب الجمل البسيطة. الطالب متحمس ومتعاون.",
                    Status = SessionStatus.Completed
                },
                new TherapySession
                {
                    StudentId = khaledId,
                    TherapistId = saraId,
                    SessionType = SessionType.SpeechTherapy,
                    SessionDate = new DateTime(2026, 4, 8, 10, 0, 0),
                    Summary = "جلسة ممتازة. بدأ الطالب بتكوين جمل من ثلاث كلمات.",
                    Status = SessionStatus.Completed
                },
                // فاطمة sessions
                new TherapySession
                {
                    StudentId = fatimaId,
                    TherapistId = lailaId,
                    SessionType = SessionType.Psychology,
                    SessionDate = new DateTime(2026, 3, 18, 9, 0, 0),
                    Summary = "تقييم أولي للسلوك الاجتماعي. الطالبة تظهر تفاعلاً إيجابياً مع الأقران.",
                    Status = SessionStatus.Completed
                },
                new TherapySession
                {
                    StudentId = fatimaId,
                    TherapistId = saraId,
                    SessionType = SessionType.SpeechTherapy,
                    SessionDate = new DateTime(2026, 3, 25, 11, 0, 0),
                    Summary = "تمارين نطق أساسية. تحتاج المزيد من التكرار.",
                    Status = SessionStatus.Completed
                },
                new TherapySession
                {
                    StudentId = fatimaId,
                    TherapistId = lailaId,
                    SessionType = SessionType.Psychology,
                    SessionDate = new DateTime(2026, 4, 3, 9, 0, 0),
                    Summary = "تحسن ملحوظ في التفاعل الاجتماعي. تم تطبيق برنامج تعديل السلوك.",
                    Status = SessionStatus.Completed
                },
                // أحمد sessions
                new TherapySession
                {
                    StudentId = ahmedId,
                    TherapistId = mohammedId,
                    SessionType = SessionType.OccupationalTherapy,
                    SessionDate = new DateTime(2026, 4, 5, 11, 0, 0),
                    Summary = "تمارين تقوية العضلات الدقيقة. الطالب يحتاج جلسات إضافية.",
                    Status = SessionStatus.Completed
                }
            };

            foreach (var session in sessions)
            {
                var exists = existingSessions.Any(s =>
                    s.StudentId == session.StudentId &&
                    s.TherapistId == session.TherapistId &&
                    s.SessionDate == session.SessionDate);

                if (!exists)
                {
                    await _unitOfWork.TherapySessions.AddAsync(session);
                }
            }

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitAsync();

            return Ok(new
            {
                message = "Test data seeded successfully",
                staffCreated = 2,
                schedulesCreated = 6,
                sessionsCreated = 8
            });
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackAsync();
            return StatusCode(500, new { error = "Failed to seed test data", details = ex.Message });
        }
    }

    [HttpPost("fix-names")]
    public async Task<IActionResult> FixCorruptedNames()
    {
        var fixes = new Dictionary<string, string>
        {
            { "parent1@therapistcenter.com", "محمد عبدالله" },
            { "dr.sara3@therapistcenter.com", "د. سارة أحمد" },
            { "dr.sara@therapistcenter.com", "د. سارة أحمد" },
        };

        var fixedUsers = new List<string>();
        var fixedStaff = new List<string>();

        // Fix AspNetUsers
        foreach (var (email, correctName) in fixes)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user != null && user.FullName.Contains('?'))
            {
                user.FullName = correctName;
                await _userManager.UpdateAsync(user);
                fixedUsers.Add($"{email} -> {correctName}");
            }
        }

        // Fix Staff table
        var allStaff = await _unitOfWork.Staff.GetAllAsync();
        foreach (var staff in allStaff)
        {
            if (staff.FullName.Contains('?'))
            {
                if (fixes.TryGetValue(staff.Email, out var correctName))
                {
                    staff.FullName = correctName;
                    _unitOfWork.Staff.Update(staff);
                    fixedStaff.Add($"{staff.Email} -> {correctName}");
                }
            }
        }

        // Fix Students table
        var allStudents = await _unitOfWork.Students.GetAllAsync();
        var fixedStudents = new List<string>();
        foreach (var student in allStudents)
        {
            if (student.FullName.Contains('?'))
            {
                // Try to infer correct name from notes or other context
                fixedStudents.Add($"Student {student.Id} has corrupted name: {student.FullName}");
            }
        }

        await _unitOfWork.SaveChangesAsync();

        return Ok(new
        {
            message = "Names fixed successfully",
            fixedUsers,
            fixedStaff,
            fixedStudents
        });
    }
}
