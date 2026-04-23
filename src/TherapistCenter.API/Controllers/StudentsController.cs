using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TherapistCenter.Application.DTOs.Students;
using TherapistCenter.Application.Features.Students.Commands;
using TherapistCenter.Application.Features.Students.Queries;

namespace TherapistCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StudentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Therapist")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllStudentsQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetStudentByIdQuery(id));

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpGet("parent/{parentId}")]
    [Authorize(Roles = "Parent,Admin")]
    public async Task<IActionResult> GetByParent(string parentId)
    {
        var result = await _mediator.Send(new GetStudentsByParentQuery(parentId));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateStudentDto dto)
    {
        var result = await _mediator.Send(new CreateStudentCommand(dto));

        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Student.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStudentDto dto)
    {
        var result = await _mediator.Send(new UpdateStudentCommand(id, dto));

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteStudentCommand(id));

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }
}
