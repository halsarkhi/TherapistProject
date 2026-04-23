using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TherapistCenter.Application.DTOs.Sessions;
using TherapistCenter.Application.Features.Sessions.Commands;
using TherapistCenter.Application.Features.Sessions.Queries;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SessionsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;

    public SessionsController(IMediator mediator, IUnitOfWork unitOfWork)
    {
        _mediator = mediator;
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllSessionsQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetSessionByIdQuery(id));

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpGet("student/{studentId:guid}")]
    [Authorize(Roles = "Therapist,Parent,Admin")]
    public async Task<IActionResult> GetByStudent(Guid studentId)
    {
        var result = await _mediator.Send(new GetSessionsByStudentQuery(studentId));
        return Ok(result);
    }

    [HttpGet("therapist/{therapistId:guid}")]
    [Authorize(Roles = "Therapist,Admin")]
    public async Task<IActionResult> GetByTherapist(Guid therapistId)
    {
        var result = await _mediator.Send(new GetSessionsByTherapistQuery(therapistId));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Therapist")]
    public async Task<IActionResult> Create([FromBody] CreateSessionDto dto)
    {
        var therapistId = await GetTherapistStaffIdAsync();

        if (therapistId is null)
            return BadRequest(new { Success = false, Message = "Therapist profile not found for current user" });

        var result = await _mediator.Send(new CreateSessionCommand(dto, therapistId.Value));
        return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Therapist,Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSessionDto dto)
    {
        var result = await _mediator.Send(new UpdateSessionCommand(id, dto));

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}/complete")]
    [Authorize(Roles = "Therapist")]
    public async Task<IActionResult> Complete(Guid id, [FromBody] CompleteSessionRequest request)
    {
        var result = await _mediator.Send(new CompleteSessionCommand(id, request.Summary, request.Notes));

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    private async Task<Guid?> GetTherapistStaffIdAsync()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userId))
            return null;

        var staffMembers = await _unitOfWork.Staff.FindAsync(s => s.UserId == userId && s.IsActive);
        var staff = staffMembers.FirstOrDefault();
        return staff?.Id;
    }
}

public class CompleteSessionRequest
{
    public string Summary { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}
