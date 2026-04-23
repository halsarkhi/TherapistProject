using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Students;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Students.Queries;

public record GetAllStudentsQuery : IRequest<ApiResponse<List<StudentDto>>>;

public class GetAllStudentsQueryHandler : IRequestHandler<GetAllStudentsQuery, ApiResponse<List<StudentDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllStudentsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<StudentDto>>> Handle(GetAllStudentsQuery request, CancellationToken cancellationToken)
    {
        var students = await _unitOfWork.Students.GetAllAsync();
        var studentDtos = students.Select(s => s.ToDto()).ToList();
        return ApiResponse<List<StudentDto>>.SuccessResponse(studentDtos, "Students retrieved successfully");
    }
}
