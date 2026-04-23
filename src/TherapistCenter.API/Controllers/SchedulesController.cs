using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TherapistCenter.Application.DTOs.Schedules;
using TherapistCenter.Application.Features.Schedules.Commands;
using TherapistCenter.Application.Features.Schedules.Queries;

namespace TherapistCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SchedulesController : ControllerBase
{
    private readonly IMediator _mediator;

    public SchedulesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Therapist")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllSchedulesQuery());
        return Ok(result);
    }

    [HttpGet("student/{studentId:guid}")]
    public async Task<IActionResult> GetByStudent(Guid studentId)
    {
        var result = await _mediator.Send(new GetSchedulesByStudentQuery(studentId));
        return Ok(result);
    }

    [HttpGet("therapist/{therapistId:guid}")]
    [Authorize(Roles = "Admin,Therapist")]
    public async Task<IActionResult> GetByTherapist(Guid therapistId)
    {
        var result = await _mediator.Send(new GetSchedulesByTherapistQuery(therapistId));
        return Ok(result);
    }

    [HttpGet("available-slots")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAvailableSlots(
        [FromQuery] Guid therapistId,
        [FromQuery] DayOfWeek dayOfWeek,
        [FromQuery] Guid? studentId = null)
    {
        var result = await _mediator.Send(new GetAvailableSlotsQuery(therapistId, dayOfWeek, studentId));
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateScheduleDto dto)
    {
        var result = await _mediator.Send(new CreateScheduleCommand(dto));

        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetByStudent), new { studentId = result.Data!.StudentId }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateScheduleRequest request)
    {
        var command = new UpdateScheduleCommand(
            id,
            request.DayOfWeek,
            request.StartTime,
            request.EndTime,
            request.RoomName,
            request.IsActive
        );

        var result = await _mediator.Send(command);

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteScheduleCommand(id));

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }
}

public class UpdateScheduleRequest
{
    public DayOfWeek? DayOfWeek { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public string? RoomName { get; set; }
    public bool? IsActive { get; set; }
}
