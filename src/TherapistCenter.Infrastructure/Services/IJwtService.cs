using TherapistCenter.Infrastructure.Identity;

namespace TherapistCenter.Infrastructure.Services;

public interface IJwtService
{
    string GenerateToken(ApplicationUser user);
}
