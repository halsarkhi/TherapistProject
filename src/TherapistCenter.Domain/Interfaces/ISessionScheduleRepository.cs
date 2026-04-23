using TherapistCenter.Domain.Entities;

namespace TherapistCenter.Domain.Interfaces;

public interface ISessionScheduleRepository : IGenericRepository<SessionSchedule>
{
    Task<IReadOnlyList<SessionSchedule>> GetAllWithDetailsAsync();
    Task<IReadOnlyList<SessionSchedule>> GetByStudentIdAsync(Guid studentId);
    Task<IReadOnlyList<SessionSchedule>> GetByTherapistIdAsync(Guid therapistId);

    Task<SessionSchedule?> FindTherapistConflictAsync(
        Guid therapistId, DayOfWeek day, TimeSpan start, TimeSpan end, Guid? excludeId = null);

    Task<SessionSchedule?> FindStudentConflictAsync(
        Guid studentId, DayOfWeek day, TimeSpan start, TimeSpan end, Guid? excludeId = null);

    Task<SessionSchedule?> FindRoomConflictAsync(
        string roomName, DayOfWeek day, TimeSpan start, TimeSpan end, Guid? excludeId = null);

    Task<IReadOnlyList<SessionSchedule>> GetTherapistDayScheduleAsync(Guid therapistId, DayOfWeek day);
}
