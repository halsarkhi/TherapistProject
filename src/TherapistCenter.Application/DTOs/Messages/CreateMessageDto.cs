using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Application.DTOs.Messages;

public class CreateMessageDto
{
    public string RecipientId { get; set; } = string.Empty;
    public MessageType MessageType { get; set; }
    public string Content { get; set; } = string.Empty;
}
