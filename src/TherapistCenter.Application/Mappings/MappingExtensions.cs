using TherapistCenter.Application.DTOs.Messages;
using TherapistCenter.Application.DTOs.Schedules;
using TherapistCenter.Application.DTOs.Sessions;
using TherapistCenter.Application.DTOs.Staff;
using TherapistCenter.Application.DTOs.Students;
using TherapistCenter.Domain.Entities;

namespace TherapistCenter.Application.Mappings;

public static class MappingExtensions
{
    // Student mappings
    public static StudentDto ToDto(this Student entity)
    {
        return new StudentDto
        {
            Id = entity.Id,
            FullName = entity.FullName,
            DateOfBirth = entity.DateOfBirth,
            Gender = entity.Gender,
            DisabilityType = entity.DisabilityType,
            ParentId = entity.ParentId,
            Notes = entity.Notes,
            AvatarUrl = entity.AvatarUrl,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        };
    }

    public static Student ToEntity(this CreateStudentDto dto)
    {
        return new Student
        {
            FullName = dto.FullName,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            DisabilityType = dto.DisabilityType,
            ParentId = dto.ParentId ?? string.Empty,
            Notes = dto.Notes,
            AvatarUrl = dto.AvatarUrl
        };
    }

    // Staff mappings
    public static StaffDto ToDto(this Domain.Entities.Staff entity)
    {
        return new StaffDto
        {
            Id = entity.Id,
            FullName = entity.FullName,
            Specialization = entity.Specialization,
            Email = entity.Email,
            Phone = entity.Phone,
            EmployeeNumber = entity.EmployeeNumber,
            MobilePhone = entity.MobilePhone,
            PhotoUrl = entity.PhotoUrl,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        };
    }

    public static Domain.Entities.Staff ToEntity(this CreateStaffDto dto)
    {
        return new Domain.Entities.Staff
        {
            FullName = dto.FullName,
            Specialization = dto.Specialization,
            Email = dto.Email,
            Phone = dto.Phone,
            EmployeeNumber = dto.EmployeeNumber,
            MobilePhone = dto.MobilePhone,
            PhotoUrl = dto.PhotoUrl
        };
    }

    // TherapySession mappings
    public static TherapySessionDto ToDto(this TherapySession entity, string? studentName = null, string? therapistName = null)
    {
        return new TherapySessionDto
        {
            Id = entity.Id,
            StudentId = entity.StudentId,
            StudentName = studentName ?? entity.Student?.FullName ?? string.Empty,
            TherapistId = entity.TherapistId,
            TherapistName = therapistName ?? entity.Therapist?.FullName ?? string.Empty,
            SessionType = entity.SessionType,
            SessionDate = entity.SessionDate,
            Summary = entity.Summary,
            Notes = entity.Notes,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt
        };
    }

    public static TherapySession ToEntity(this CreateSessionDto dto, Guid therapistId)
    {
        return new TherapySession
        {
            StudentId = dto.StudentId,
            TherapistId = therapistId,
            SessionType = dto.SessionType,
            SessionDate = dto.SessionDate,
            Summary = dto.Summary,
            Notes = dto.Notes
        };
    }

    // Message mappings
    public static MessageDto ToDto(this Message entity, string? senderName = null, string? senderSpecialization = null)
    {
        return new MessageDto
        {
            Id = entity.Id,
            SenderName = senderName ?? entity.SenderDisplayName ?? entity.Sender?.FullName ?? string.Empty,
            SenderSpecialization = senderSpecialization ?? entity.Sender?.Specialization.ToString() ?? string.Empty,
            SenderUserId = entity.SenderUserId ?? entity.Sender?.UserId,
            RecipientId = entity.RecipientId,
            MessageType = entity.MessageType,
            Content = entity.Content,
            IsRead = entity.IsRead,
            ReadAt = entity.ReadAt,
            CreatedAt = entity.CreatedAt
        };
    }

    public static Message ToEntity(this CreateMessageDto dto, Guid senderId)
    {
        return new Message
        {
            SenderId = senderId,
            RecipientId = dto.RecipientId,
            MessageType = dto.MessageType,
            Content = dto.Content
        };
    }

    // SessionSchedule mappings
    public static SessionScheduleDto ToDto(this SessionSchedule entity, string? studentName = null, string? therapistName = null)
    {
        return new SessionScheduleDto
        {
            Id = entity.Id,
            StudentId = entity.StudentId,
            StudentName = studentName ?? entity.Student?.FullName ?? string.Empty,
            TherapistId = entity.TherapistId,
            TherapistName = therapistName ?? entity.Therapist?.FullName ?? string.Empty,
            DayOfWeek = entity.DayOfWeek,
            StartTime = entity.StartTime,
            EndTime = entity.EndTime,
            RoomName = entity.RoomName,
            IsActive = entity.IsActive
        };
    }

    public static SessionSchedule ToEntity(this CreateScheduleDto dto)
    {
        return new SessionSchedule
        {
            StudentId = dto.StudentId,
            TherapistId = dto.TherapistId,
            DayOfWeek = dto.DayOfWeek,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            RoomName = dto.RoomName
        };
    }
}
