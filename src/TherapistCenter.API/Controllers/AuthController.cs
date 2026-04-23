using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TherapistCenter.Application.DTOs.Auth;
using TherapistCenter.Application.Features.Auth.Commands;
using TherapistCenter.Application.Interfaces;

namespace TherapistCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IAuthService _authService;

    public AuthController(IMediator mediator, IAuthService authService)
    {
        _mediator = mediator;
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _mediator.Send(new LoginCommand(dto));
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _mediator.Send(new RegisterCommand(dto));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("parents")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetParents()
    {
        var parents = await _authService.GetUsersByRoleAsync("Parent");
        return Ok(new { success = true, data = parents });
    }
}
