using Microsoft.EntityFrameworkCore;
using TherapistCenter.Domain.Entities;
using TherapistCenter.Domain.Enums;
using TherapistCenter.Domain.Interfaces;
using TherapistCenter.Infrastructure.Data;

namespace TherapistCenter.Infrastructure.Repositories;

public class StaffRepository : GenericRepository<Staff>, IStaffRepository
{
    public StaffRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<Staff?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(s => s.TherapySessions)
            .Include(s => s.SessionSchedules)
            .Include(s => s.SentMessages)
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
    }

    public async Task<IReadOnlyList<Staff>> GetBySpecializationAsync(Specialization specialization)
    {
        return await _dbSet
            .Where(s => s.Specialization == specialization && !s.IsDeleted)
            .ToListAsync();
    }
}
