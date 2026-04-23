using MediatR;
using TherapistCenter.Application.Common;
using TherapistCenter.Application.DTOs.Students;
using TherapistCenter.Application.Interfaces;
using TherapistCenter.Application.Mappings;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.Application.Features.Students.Commands;

public record CreateStudentCommand(CreateStudentDto Dto) : IRequest<ApiResponse<CreateStudentResponseDto>>;

public class CreateStudentCommandHandler : IRequestHandler<CreateStudentCommand, ApiResponse<CreateStudentResponseDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthService _authService;

    public CreateStudentCommandHandler(IUnitOfWork unitOfWork, IAuthService authService)
    {
        _unitOfWork = unitOfWork;
        _authService = authService;
    }

    public async Task<ApiResponse<CreateStudentResponseDto>> Handle(CreateStudentCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;
        ParentCredentialsDto? parentCredentials = null;

        // Auto-create parent account if parent fields are provided and ParentId is not
        if (string.IsNullOrWhiteSpace(dto.ParentId)
            && !string.IsNullOrWhiteSpace(dto.ParentName)
            && !string.IsNullOrWhiteSpace(dto.ParentEmail)
            && !string.IsNullOrWhiteSpace(dto.ParentPassword))
        {
            var (success, userId, error) = await _authService.RegisterAndGetUserIdAsync(
                dto.ParentEmail, dto.ParentPassword, dto.ParentName, "Parent");

            if (!success)
            {
                return ApiResponse<CreateStudentResponseDto>.FailureResponse(
                    $"Failed to create parent account: {error}");
            }

            dto.ParentId = userId;

            parentCredentials = new ParentCredentialsDto
            {
                ParentName = dto.ParentName,
                Email = dto.ParentEmail,
                Password = dto.ParentPassword,
                UserId = userId!
            };
        }

        var student = dto.ToEntity();

        await _unitOfWork.Students.AddAsync(student);
        await _unitOfWork.SaveChangesAsync();

        var response = new CreateStudentResponseDto
        {
            Student = student.ToDto(),
            ParentCredentials = parentCredentials
        };

        return ApiResponse<CreateStudentResponseDto>.SuccessResponse(response, "Student created successfully");
    }
}
