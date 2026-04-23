using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Students;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Students.Queries;

public record GetStudentByIdQuery(Guid Id) : IRequest<ApiResponse<StudentDto>>;

public class GetStudentByIdQueryHandler : IRequestHandler<GetStudentByIdQuery, ApiResponse<StudentDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetStudentByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<StudentDto>> Handle(GetStudentByIdQuery request, CancellationToken cancellationToken)
    {
        var student = await _unitOfWork.Students.GetByIdAsync(request.Id);

        if (student is null || student.IsDeleted)
            return ApiResponse<StudentDto>.FailureResponse("Student not found");

        return ApiResponse<StudentDto>.SuccessResponse(student.ToDto(), "Student retrieved successfully");
    }
}
