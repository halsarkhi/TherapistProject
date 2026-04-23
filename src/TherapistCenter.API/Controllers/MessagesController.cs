using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TherapistCenter.Application.DTOs.Messages;
using TherapistCenter.Application.Features.Messages.Commands;
using TherapistCenter.Application.Features.Messages.Queries;
using TherapistCenter.Domain.Interfaces;

namespace TherapistCenter.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;

    public MessagesController(IMediator mediator, IUnitOfWork unitOfWork)
    {
        _mediator = mediator;
        _unitOfWork = unitOfWork;
    }

    [HttpGet("received/{recipientId}")]
    [Authorize(Roles = "Parent,Admin")]
    public async Task<IActionResult> GetByRecipient(string recipientId)
    {
        var result = await _mediator.Send(new GetMessagesByRecipientQuery(recipientId));
        return Ok(result);
    }

    [HttpGet("received/{recipientId}/unread")]
    [Authorize(Roles = "Parent,Admin")]
    public async Task<IActionResult> GetUnread(string recipientId)
    {
        var result = await _mediator.Send(new GetUnreadMessagesQuery(recipientId));
        return Ok(result);
    }

    [HttpGet("sent/{senderId:guid}")]
    [Authorize(Roles = "Therapist,Admin")]
    public async Task<IActionResult> GetBySender(Guid senderId)
    {
        var result = await _mediator.Send(new GetMessagesBySenderQuery(senderId));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetMessageByIdQuery(id));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [Authorize(Roles = "Therapist")]
    public async Task<IActionResult> Send([FromBody] CreateMessageDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var staffMembers = await _unitOfWork.Staff.FindAsync(s => s.UserId == userId && !s.IsDeleted);
        var staff = staffMembers.FirstOrDefault();
        if (staff is null)
            return BadRequest(new { Message = "Staff profile not found for current user." });

        var result = await _mediator.Send(new SendMessageCommand(dto, staff.Id));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("parent-send")]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> ParentSend([FromBody] ParentSendMessageDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var displayName = User.FindFirstValue("fullName") ?? User.Identity?.Name ?? "Parent";

        var result = await _mediator.Send(new SendParentMessageCommand(
            userId, displayName, dto.RecipientUserId, dto.Content));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("conversation/{otherUserId}")]
    [Authorize(Roles = "Parent,Therapist,Admin")]
    public async Task<IActionResult> GetConversation(string otherUserId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _mediator.Send(new GetConversationQuery(userId, otherUserId));
        return Ok(result);
    }

    [HttpPut("{id:guid}/read")]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var result = await _mediator.Send(new MarkAsReadCommand(id));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPut("read-all/{recipientId}")]
    [Authorize(Roles = "Parent")]
    public async Task<IActionResult> MarkAllAsRead(string recipientId)
    {
        var result = await _mediator.Send(new MarkAllAsReadCommand(recipientId));
        return Ok(result);
    }
}
