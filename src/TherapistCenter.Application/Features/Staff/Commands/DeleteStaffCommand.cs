using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Staff.Commands;

public record DeleteStaffCommand(Guid Id) : IRequest<ApiResponse<bool>>;

public class DeleteStaffCommandHandler : IRequestHandler<DeleteStaffCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteStaffCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(DeleteStaffCommand request, CancellationToken cancellationToken)
    {
        var staff = await _unitOfWork.Staff.GetByIdAsync(request.Id);

        if (staff is null)
        {
            return ApiResponse<bool>.FailureResponse("Staff member not found.");
        }

        staff.IsDeleted = true;
        staff.IsActive = false;
        staff.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Staff.Update(staff);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Staff member deleted successfully.");
    }
}
