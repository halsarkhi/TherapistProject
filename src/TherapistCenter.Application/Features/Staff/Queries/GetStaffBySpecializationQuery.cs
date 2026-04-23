using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Staff;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Enums;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Staff.Queries;

public record GetStaffBySpecializationQuery(Specialization Specialization) : IRequest<ApiResponse<List<StaffDto>>>;

public class GetStaffBySpecializationQueryHandler : IRequestHandler<GetStaffBySpecializationQuery, ApiResponse<List<StaffDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetStaffBySpecializationQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<StaffDto>>> Handle(GetStaffBySpecializationQuery request, CancellationToken cancellationToken)
    {
        var staffList = await _unitOfWork.Staff.GetBySpecializationAsync(request.Specialization);
        var staffDtos = staffList.Select(s => s.ToDto()).ToList();
        return ApiResponse<List<StaffDto>>.SuccessResponse(staffDtos, "Staff filtered by specialization retrieved successfully.");
    }
}
