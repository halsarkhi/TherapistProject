using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Staff;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Staff.Queries;

public record GetAllStaffQuery : IRequest<ApiResponse<List<StaffDto>>>;

public class GetAllStaffQueryHandler : IRequestHandler<GetAllStaffQuery, ApiResponse<List<StaffDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllStaffQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<StaffDto>>> Handle(GetAllStaffQuery request, CancellationToken cancellationToken)
    {
        var staffList = await _unitOfWork.Staff.GetAllAsync();
        var staffDtos = staffList.Select(s => s.ToDto()).ToList();
        return ApiResponse<List<StaffDto>>.SuccessResponse(staffDtos, "Staff retrieved successfully.");
    }
}
