using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Students;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Students.Queries;

public record GetStudentsByParentQuery(string ParentId) : IRequest<ApiResponse<List<StudentDto>>>;

public class GetStudentsByParentQueryHandler : IRequestHandler<GetStudentsByParentQuery, ApiResponse<List<StudentDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetStudentsByParentQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<StudentDto>>> Handle(GetStudentsByParentQuery request, CancellationToken cancellationToken)
    {
        var students = await _unitOfWork.Students.GetByParentIdAsync(request.ParentId);
        var studentDtos = students.Select(s => s.ToDto()).ToList();
        return ApiResponse<List<StudentDto>>.SuccessResponse(studentDtos, "Students retrieved successfully");
    }
}
