using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Staff;
using TherapistCenter.Application.Interfaces;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Staff.Commands;

public record CreateStaffCommand(CreateStaffDto Dto) : IRequest<ApiResponse<StaffDto>>;

public class CreateStaffCommandHandler : IRequestHandler<CreateStaffCommand, ApiResponse<StaffDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthService _authService;

    public CreateStaffCommandHandler(IUnitOfWork unitOfWork, IAuthService authService)
    {
        _unitOfWork = unitOfWork;
        _authService = authService;
    }

    public async Task<ApiResponse<StaffDto>> Handle(CreateStaffCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        await _unitOfWork.BeginTransactionAsync();

        try
        {
            var (success, userId, error) = await _authService.RegisterAndGetUserIdAsync(
                dto.Email, dto.Password, dto.FullName, "Therapist");

            if (!success)
            {
                await _unitOfWork.RollbackAsync();
                return ApiResponse<StaffDto>.FailureResponse(error ?? "Failed to create user account.");
            }

            var staff = dto.ToEntity();
            staff.UserId = userId;

            await _unitOfWork.Staff.AddAsync(staff);
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitAsync();

            return ApiResponse<StaffDto>.SuccessResponse(staff.ToDto(), "Staff member created successfully.");
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }
}
