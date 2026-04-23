using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Students.Commands;

public record DeleteStudentCommand(Guid Id) : IRequest<ApiResponse<bool>>;

public class DeleteStudentCommandHandler : IRequestHandler<DeleteStudentCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteStudentCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(DeleteStudentCommand request, CancellationToken cancellationToken)
    {
        var student = await _unitOfWork.Students.GetByIdAsync(request.Id);

        if (student is null || student.IsDeleted)
            return ApiResponse<bool>.FailureResponse("Student not found");

        student.IsDeleted = true;
        student.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Students.Update(student);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Student deleted successfully");
    }
}
