using TherapistCenter.Domain.Entities;

namespace TherapistCenter.Domain.Interfaces;

public interface IMessageRepository : IGenericRepository<Message>
{
    Task<IReadOnlyList<Message>> GetByRecipientIdAsync(string recipientId);
    Task<IReadOnlyList<Message>> GetUnreadByRecipientIdAsync(string recipientId);
    Task<IReadOnlyList<Message>> GetConversationAsync(string userAId, string userBId);
    Task MarkAsReadAsync(Guid messageId);
}
