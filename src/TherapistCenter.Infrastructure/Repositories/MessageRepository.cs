using Microsoft.EntityFrameworkCore;
using TherapistCenter.Domain.Entities;
using TherapistCenter.Domain.Interfaces;
using TherapistCenter.Infrastructure.Data;

namespace TherapistCenter.Infrastructure.Repositories;

public class MessageRepository : GenericRepository<Message>, IMessageRepository
{
    public MessageRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<Message?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(m => m.Sender)
            .FirstOrDefaultAsync(m => m.Id == id && !m.IsDeleted);
    }

    public async Task<IReadOnlyList<Message>> GetByRecipientIdAsync(string recipientId)
    {
        return await _dbSet
            .Include(m => m.Sender)
            .Where(m => m.RecipientId == recipientId && !m.IsDeleted)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Message>> GetUnreadByRecipientIdAsync(string recipientId)
    {
        return await _dbSet
            .Include(m => m.Sender)
            .Where(m => m.RecipientId == recipientId && !m.IsRead && !m.IsDeleted)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Message>> GetConversationAsync(string userAId, string userBId)
    {
        return await _dbSet
            .Include(m => m.Sender)
            .Where(m => !m.IsDeleted &&
                (
                    (m.RecipientId == userAId && (m.SenderUserId == userBId || (m.Sender != null && m.Sender.UserId == userBId))) ||
                    (m.RecipientId == userBId && (m.SenderUserId == userAId || (m.Sender != null && m.Sender.UserId == userAId)))
                ))
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task MarkAsReadAsync(Guid messageId)
    {
        var message = await _dbSet.FindAsync(messageId);
        if (message is not null && !message.IsRead)
        {
            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;
            _context.Entry(message).State = EntityState.Modified;
        }
    }
}
