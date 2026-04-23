namespace TherapistCenter.Application.DTOs.Messages;

public class ParentSendMessageDto
{
    public string RecipientUserId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
