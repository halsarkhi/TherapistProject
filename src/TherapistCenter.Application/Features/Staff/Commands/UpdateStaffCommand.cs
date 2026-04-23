using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Staff;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Staff.Commands;

public record UpdateStaffCommand(Guid Id, UpdateStaffDto Dto) : IRequest<ApiResponse<StaffDto>>;

public class UpdateStaffCommandHandler : IRequestHandler<UpdateStaffCommand, ApiResponse<StaffDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateStaffCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<StaffDto>> Handle(UpdateStaffCommand request, CancellationToken cancellationToken)
    {
        var staff = await _unitOfWork.Staff.GetByIdAsync(request.Id);

        if (staff is null)
        {
            return ApiResponse<StaffDto>.FailureResponse("Staff member not found.");
        }

        staff.FullName = request.Dto.FullName;
        staff.Specialization = request.Dto.Specialization;
        staff.Phone = request.Dto.Phone;
        staff.EmployeeNumber = request.Dto.EmployeeNumber;
        staff.MobilePhone = request.Dto.MobilePhone;
        if (request.Dto.PhotoUrl is not null)
        {
            staff.PhotoUrl = request.Dto.PhotoUrl;
        }
        staff.IsActive = request.Dto.IsActive;
        staff.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Staff.Update(staff);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<StaffDto>.SuccessResponse(staff.ToDto(), "Staff member updated successfully.");
    }
}
