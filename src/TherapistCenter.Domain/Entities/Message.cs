using TherapistCenter.Domain.Enums;

namespace TherapistCenter.Domain.Entities;

public class Message : BaseEntity
{
    // Staff sender (for therapist→parent messages). Null when parent is the sender.
    public Guid? SenderId { get; set; }
    // Unified user id of the sender (staff user id or parent user id).
    public string? SenderUserId { get; set; }
    // Denormalized display name so the UI can render parent senders without a Staff row.
    public string? SenderDisplayName { get; set; }

    public string RecipientId { get; set; } = string.Empty;
    public MessageType MessageType { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }

    // Navigation properties
    public Staff? Sender { get; set; }
}
