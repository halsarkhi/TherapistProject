namespace TherapistCenter.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IStudentRepository Students { get; }
    IStaffRepository Staff { get; }
    ITherapySessionRepository TherapySessions { get; }
    IMessageRepository Messages { get; }
    ISessionScheduleRepository SessionSchedules { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitAsync();
    Task RollbackAsync();
}
