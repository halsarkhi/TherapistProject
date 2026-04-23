using Microsoft.EntityFrameworkCore;
using TherapistCenter.Domain.Entities;
using TherapistCenter.Domain.Interfaces;
using TherapistCenter.Infrastructure.Data;

namespace TherapistCenter.Infrastructure.Repositories;

public class TherapySessionRepository : GenericRepository<TherapySession>, ITherapySessionRepository
{
    public TherapySessionRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<TherapySession?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(ts => ts.Student)
            .Include(ts => ts.Therapist)
            .FirstOrDefaultAsync(ts => ts.Id == id && !ts.IsDeleted);
    }

    public async Task<IReadOnlyList<TherapySession>> GetByStudentIdAsync(Guid studentId)
    {
        return await _dbSet
            .Include(ts => ts.Student)
            .Include(ts => ts.Therapist)
            .Where(ts => ts.StudentId == studentId && !ts.IsDeleted)
            .OrderByDescending(ts => ts.SessionDate)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<TherapySession>> GetByTherapistIdAsync(Guid therapistId)
    {
        return await _dbSet
            .Include(ts => ts.Student)
            .Include(ts => ts.Therapist)
            .Where(ts => ts.TherapistId == therapistId && !ts.IsDeleted)
            .OrderByDescending(ts => ts.SessionDate)
            .ToListAsync();
    }
}
