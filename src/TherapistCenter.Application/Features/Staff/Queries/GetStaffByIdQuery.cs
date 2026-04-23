using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Staff;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Staff.Queries;

public record GetStaffByIdQuery(Guid Id) : IRequest<ApiResponse<StaffDto>>;

public class GetStaffByIdQueryHandler : IRequestHandler<GetStaffByIdQuery, ApiResponse<StaffDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetStaffByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<StaffDto>> Handle(GetStaffByIdQuery request, CancellationToken cancellationToken)
    {
        var staff = await _unitOfWork.Staff.GetByIdAsync(request.Id);

        if (staff is null)
        {
            return ApiResponse<StaffDto>.FailureResponse("Staff member not found.");
        }

        return ApiResponse<StaffDto>.SuccessResponse(staff.ToDto(), "Staff member retrieved successfully.");
    }
}
