using TherapistCenter.Domain.Entities;

namespace TherapistCenter.Domain.Interfaces;

public interface ITherapySessionRepository : IGenericRepository<TherapySession>
{
    Task<IReadOnlyList<TherapySession>> GetByStudentIdAsync(Guid studentId);
    Task<IReadOnlyList<TherapySession>> GetByTherapistIdAsync(Guid therapistId);
}
