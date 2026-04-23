using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TherapistCenter.Application.DTOs.Staff;
using TherapistCenter.Application.Features.Staff.Commands;
using TherapistCenter.Application.Features.Staff.Queries;
using TherapistCenter.Domain.Enums;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class StaffController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;

    public StaffController(IMediator mediator, IUnitOfWork unitOfWork)
    {
        _mediator = mediator;
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Get current therapist's own staff profile. Accessible by Therapist role.
    /// </summary>
    [HttpGet("me")]
    [Authorize(Roles = "Admin,Therapist")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var staffList = await _unitOfWork.Staff.FindAsync(s => s.UserId == userId && s.IsActive);
        var staff = staffList.FirstOrDefault();
        if (staff == null)
            return NotFound(new { success = false, message = "Staff profile not found" });

        return Ok(new
        {
            success = true,
            message = "Staff profile retrieved",
            data = new
            {
                staff.Id,
                staff.FullName,
                staff.Specialization,
                staff.Email,
                staff.Phone,
                staff.EmployeeNumber,
                staff.MobilePhone,
                staff.PhotoUrl,
                staff.IsActive,
                staff.CreatedAt
            },
            errors = Array.Empty<string>()
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllStaffQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetStaffByIdQuery(id));

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpGet("specialization/{specialization}")]
    public async Task<IActionResult> GetBySpecialization(Specialization specialization)
    {
        var result = await _mediator.Send(new GetStaffBySpecializationQuery(specialization));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStaffDto dto)
    {
        var result = await _mediator.Send(new CreateStaffCommand(dto));

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStaffDto dto)
    {
        var result = await _mediator.Send(new UpdateStaffCommand(id, dto));

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteStaffCommand(id));

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }
}
