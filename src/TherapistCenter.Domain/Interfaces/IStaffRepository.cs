using TherapistCenter.Domain.Entities;
using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Domain.Interfaces;

public interface IStaffRepository : IGenericRepository<Staff>
{
    Task<IReadOnlyList<Staff>> GetBySpecializationAsync(Specialization specialization);
}
