using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TherapistCenter.Domain.Entities;
using TherapistCenter.Infrastructure.Identity;

namespace TherapistCenter.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<Staff> Staff => Set<Staff>();
    public DbSet<TherapySession> TherapySessions => Set<TherapySession>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<SessionSchedule> SessionSchedules => Set<SessionSchedule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Global query filters for soft delete ──
        modelBuilder.Entity<Student>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Staff>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<TherapySession>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Message>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<SessionSchedule>().HasQueryFilter(e => !e.IsDeleted);

        // ── Student configuration ──
        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.FullName)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.ParentId)
                .IsRequired()
                .HasMaxLength(450);

            entity.Property(e => e.Notes)
                .HasMaxLength(2000);

            entity.HasIndex(e => e.ParentId);
        });

        // ── Staff configuration ──
        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.FullName)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(256);

            entity.Property(e => e.Phone)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.EmployeeNumber)
                .HasMaxLength(50);

            entity.Property(e => e.MobilePhone)
                .HasMaxLength(20);

            entity.Property(e => e.UserId)
                .HasMaxLength(450);
        });

        // ── TherapySession configuration ──
        modelBuilder.Entity<TherapySession>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Summary)
                .HasMaxLength(2000);

            entity.Property(e => e.Notes)
                .HasMaxLength(2000);

            entity.HasOne(e => e.Student)
                .WithMany(s => s.TherapySessions)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Therapist)
                .WithMany(s => s.TherapySessions)
                .HasForeignKey(e => e.TherapistId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.StudentId);
            entity.HasIndex(e => e.TherapistId);
        });

        // ── Message configuration ──
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.RecipientId)
                .IsRequired()
                .HasMaxLength(450);

            entity.Property(e => e.Content)
                .IsRequired()
                .HasMaxLength(4000);

            entity.Property(e => e.SenderUserId).HasMaxLength(450);
            entity.Property(e => e.SenderDisplayName).HasMaxLength(200);

            entity.HasOne(e => e.Sender)
                .WithMany(s => s.SentMessages)
                .HasForeignKey(e => e.SenderId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.RecipientId);
            entity.HasIndex(e => e.SenderUserId);
            entity.HasIndex(e => e.IsRead);
        });

        // ── SessionSchedule configuration ──
        modelBuilder.Entity<SessionSchedule>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.RoomName)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasOne(e => e.Student)
                .WithMany(s => s.SessionSchedules)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Therapist)
                .WithMany(s => s.SessionSchedules)
                .HasForeignKey(e => e.TherapistId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.StudentId);
            entity.HasIndex(e => e.TherapistId);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
