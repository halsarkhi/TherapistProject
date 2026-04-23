using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Students;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Students.Commands;

public record UpdateStudentCommand(Guid Id, UpdateStudentDto Dto) : IRequest<ApiResponse<StudentDto>>;

public class UpdateStudentCommandHandler : IRequestHandler<UpdateStudentCommand, ApiResponse<StudentDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateStudentCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<StudentDto>> Handle(UpdateStudentCommand request, CancellationToken cancellationToken)
    {
        var student = await _unitOfWork.Students.GetByIdAsync(request.Id);

        if (student is null || student.IsDeleted)
            return ApiResponse<StudentDto>.FailureResponse("Student not found");

        student.FullName = request.Dto.FullName;
        student.DateOfBirth = request.Dto.DateOfBirth;
        student.Gender = request.Dto.Gender;
        student.DisabilityType = request.Dto.DisabilityType;
        student.Notes = request.Dto.Notes;
        if (request.Dto.AvatarUrl is not null)
            student.AvatarUrl = request.Dto.AvatarUrl;
        student.IsActive = request.Dto.IsActive;
        student.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Students.Update(student);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<StudentDto>.SuccessResponse(student.ToDto(), "Student updated successfully");
    }
}
