using TherapistCenter.Domain.Entities;

namespace TherapistCenter.Domain.Interfaces;

public interface IStudentRepository : IGenericRepository<Student>
{
    Task<IReadOnlyList<Student>> GetByParentIdAsync(string parentId);
}
