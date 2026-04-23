using Microsoft.EntityFrameworkCore.Storage;
using TherapistCenter.Domain.Interfaces;
using TherapistCenter.Infrastructure.Data;

namespace TherapistCenter.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    private IStudentRepository? _students;
    private IStaffRepository? _staff;
    private ITherapySessionRepository? _therapySessions;
    private IMessageRepository? _messages;
    private ISessionScheduleRepository? _sessionSchedules;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IStudentRepository Students =>
        _students ??= new StudentRepository(_context);

    public IStaffRepository Staff =>
        _staff ??= new StaffRepository(_context);

    public ITherapySessionRepository TherapySessions =>
        _therapySessions ??= new TherapySessionRepository(_context);

    public IMessageRepository Messages =>
        _messages ??= new MessageRepository(_context);

    public ISessionScheduleRepository SessionSchedules =>
        _sessionSchedules ??= new SessionScheduleRepository(_context);

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitAsync()
    {
        if (_transaction is not null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackAsync()
    {
        if (_transaction is not null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _transaction?.Dispose();
                _context.Dispose();
            }
            _disposed = true;
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}
