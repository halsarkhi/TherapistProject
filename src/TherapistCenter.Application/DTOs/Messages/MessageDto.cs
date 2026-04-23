using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Application.DTOs.Messages;

public class MessageDto
{
    public Guid Id { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderSpecialization { get; set; } = string.Empty;
    public string? SenderUserId { get; set; }
    public string RecipientId { get; set; } = string.Empty;
    public MessageType MessageType { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
