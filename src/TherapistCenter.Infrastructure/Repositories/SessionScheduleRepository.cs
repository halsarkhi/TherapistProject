using Microsoft.EntityFrameworkCore;
using TherapistCenter.Domain.Entities;
using TherapistCenter.Domain.Interfaces;
using TherapistCenter.Infrastructure.Data;

namespace TherapistCenter.Infrastructure.Repositories;

public class SessionScheduleRepository : GenericRepository<SessionSchedule>, ISessionScheduleRepository
{
    public SessionScheduleRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<SessionSchedule?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(ss => ss.Student)
            .Include(ss => ss.Therapist)
            .FirstOrDefaultAsync(ss => ss.Id == id && !ss.IsDeleted);
    }

    public async Task<IReadOnlyList<SessionSchedule>> GetAllWithDetailsAsync()
    {
        return await _dbSet
            .Include(ss => ss.Student)
            .Include(ss => ss.Therapist)
            .Where(ss => !ss.IsDeleted)
            .OrderBy(ss => ss.DayOfWeek)
            .ThenBy(ss => ss.StartTime)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<SessionSchedule>> GetByStudentIdAsync(Guid studentId)
    {
        return await _dbSet
            .Include(ss => ss.Student)
            .Include(ss => ss.Therapist)
            .Where(ss => ss.StudentId == studentId && !ss.IsDeleted)
            .OrderBy(ss => ss.DayOfWeek)
            .ThenBy(ss => ss.StartTime)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<SessionSchedule>> GetByTherapistIdAsync(Guid therapistId)
    {
        return await _dbSet
            .Include(ss => ss.Student)
            .Include(ss => ss.Therapist)
            .Where(ss => ss.TherapistId == therapistId && !ss.IsDeleted)
            .OrderBy(ss => ss.DayOfWeek)
            .ThenBy(ss => ss.StartTime)
            .ToListAsync();
    }

    public async Task<SessionSchedule?> FindTherapistConflictAsync(
        Guid therapistId, DayOfWeek day, TimeSpan start, TimeSpan end, Guid? excludeId = null)
    {
        return await _dbSet
            .Include(ss => ss.Student)
            .Where(ss =>
                !ss.IsDeleted &&
                ss.IsActive &&
                ss.TherapistId == therapistId &&
                ss.DayOfWeek == day &&
                ss.StartTime < end &&
                ss.EndTime > start &&
                (excludeId == null || ss.Id != excludeId))
            .FirstOrDefaultAsync();
    }

    public async Task<SessionSchedule?> FindStudentConflictAsync(
        Guid studentId, DayOfWeek day, TimeSpan start, TimeSpan end, Guid? excludeId = null)
    {
        return await _dbSet
            .Include(ss => ss.Therapist)
            .Where(ss =>
                !ss.IsDeleted &&
                ss.IsActive &&
                ss.StudentId == studentId &&
                ss.DayOfWeek == day &&
                ss.StartTime < end &&
                ss.EndTime > start &&
                (excludeId == null || ss.Id != excludeId))
            .FirstOrDefaultAsync();
    }

    public async Task<SessionSchedule?> FindRoomConflictAsync(
        string roomName, DayOfWeek day, TimeSpan start, TimeSpan end, Guid? excludeId = null)
    {
        if (string.IsNullOrWhiteSpace(roomName))
            return null;

        return await _dbSet
            .Where(ss =>
                !ss.IsDeleted &&
                ss.IsActive &&
                ss.RoomName == roomName &&
                ss.DayOfWeek == day &&
                ss.StartTime < end &&
                ss.EndTime > start &&
                (excludeId == null || ss.Id != excludeId))
            .FirstOrDefaultAsync();
    }

    public async Task<IReadOnlyList<SessionSchedule>> GetTherapistDayScheduleAsync(Guid therapistId, DayOfWeek day)
    {
        return await _dbSet
            .Where(ss =>
                !ss.IsDeleted &&
                ss.IsActive &&
                ss.TherapistId == therapistId &&
                ss.DayOfWeek == day)
            .OrderBy(ss => ss.StartTime)
            .ToListAsync();
    }
}
