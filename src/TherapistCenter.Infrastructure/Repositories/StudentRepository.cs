using Microsoft.EntityFrameworkCore;
using TherapistCenter.Domain.Entities;
using TherapistCenter.Domain.Interfaces;
using TherapistCenter.Infrastructure.Data;

namespace TherapistCenter.Infrastructure.Repositories;

public class StudentRepository : GenericRepository<Student>, IStudentRepository
{
    public StudentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<Student?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(s => s.TherapySessions)
            .Include(s => s.SessionSchedules)
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
    }

    public async Task<IReadOnlyList<Student>> GetByParentIdAsync(string parentId)
    {
        return await _dbSet
            .Include(s => s.TherapySessions)
            .Include(s => s.SessionSchedules)
            .Where(s => s.ParentId == parentId && !s.IsDeleted)
            .ToListAsync();
    }
}
