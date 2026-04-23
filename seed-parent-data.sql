-- Link therapist1 user to a Staff record (and repair earlier ???? names)
DECLARE @therapistUserId NVARCHAR(450) = '5bb8291f-35ff-4f04-95b4-1d13028c37f0';
DECLARE @parentUserId    NVARCHAR(450) = '45aa26ed-b361-44dc-9c50-0a9f14461100';

-- Repair all Arabic ???? names in Staff and Students caused by prior curl encoding
UPDATE Staff SET FullName = N'د. سارة المعالجة', Email = N'therapist1@test.com', Phone = N'0500000001'
  WHERE Id = 'a4001fa2-b7ac-4bf5-aba5-b430aa43cad7';
UPDATE Staff SET FullName = N'د. محمد خالد', Email = N'm.khaled@therapistcenter.com', Phone = N'0500000002'
  WHERE Id = 'b5002fb3-c8bd-5cf6-bcb6-c541bb54dbe8';
UPDATE Staff SET FullName = N'د. ليلى حسن', Email = N'l.hassan@therapistcenter.com', Phone = N'0500000003'
  WHERE Id = 'c6003ac4-d9ce-6da7-cdc7-d652cc65ecf9';

-- Link therapist1 user to Staff row
UPDATE Staff SET UserId = @therapistUserId
  WHERE Id = 'a4001fa2-b7ac-4bf5-aba5-b430aa43cad7';

UPDATE Students SET FullName = N'خالد عبدالله' WHERE Id = '68af9eda-9a88-4c06-a725-4d36f26fe070';
UPDATE Students SET FullName = N'فاطمة علي' WHERE Id = 'fa64c36a-6765-49c1-bf36-6209f3121704';
UPDATE Students SET FullName = N'أحمد محمد' WHERE Id = '9677e712-9c46-450c-b6b2-b040084b9909';

-- Ensure parent1 has a student
DECLARE @parentStudentId UNIQUEIDENTIFIER;
SELECT TOP 1 @parentStudentId = Id FROM Students WHERE ParentId = @parentUserId AND IsDeleted = 0;
IF @parentStudentId IS NULL
BEGIN
    SET @parentStudentId = NEWID();
    INSERT INTO Students (Id, FullName, DateOfBirth, Gender, DisabilityType, ParentId, Notes, IsActive, CreatedAt, UpdatedAt, IsDeleted, AvatarUrl)
    VALUES (@parentStudentId, N'يوسف أحمد', '2018-06-15', 0, 0, @parentUserId, N'طالب نشيط', 1, SYSUTCDATETIME(), NULL, 0, NULL);
END

-- Staff id for therapist1
DECLARE @therapistStaffId UNIQUEIDENTIFIER = 'a4001fa2-b7ac-4bf5-aba5-b430aa43cad7';

-- Delete any prior schedule/session/message for this student to keep idempotent
DELETE FROM SessionSchedules WHERE StudentId = @parentStudentId;
DELETE FROM TherapySessions  WHERE StudentId = @parentStudentId;
DELETE FROM Messages WHERE RecipientId = @parentUserId;

-- Schedule: next session = this coming day (for parent portal "next session" card)
INSERT INTO SessionSchedules (Id, StudentId, TherapistId, DayOfWeek, StartTime, EndTime, RoomName, IsActive, CreatedAt, UpdatedAt, IsDeleted)
VALUES
  (NEWID(), @parentStudentId, @therapistStaffId, 1, '09:00', '10:00', N'غرفة 101', 1, SYSUTCDATETIME(), NULL, 0),
  (NEWID(), @parentStudentId, @therapistStaffId, 3, '11:00', '12:00', N'غرفة 202', 1, SYSUTCDATETIME(), NULL, 0),
  (NEWID(), @parentStudentId, @therapistStaffId, 5, '10:00', '11:00', N'غرفة 101', 1, SYSUTCDATETIME(), NULL, 0);

-- Past therapy sessions (for reports)
INSERT INTO TherapySessions (Id, StudentId, TherapistId, SessionType, SessionDate, Summary, Notes, Status, CreatedAt, UpdatedAt, IsDeleted)
VALUES
  (NEWID(), @parentStudentId, @therapistStaffId, 0, DATEADD(day, -7, SYSUTCDATETIME()),
   N'جلسة علاج طبيعي — تحسن ملحوظ في الحركة',
   N'أظهر الطالب استجابة جيدة للتمارين',
   2, SYSUTCDATETIME(), NULL, 0),
  (NEWID(), @parentStudentId, @therapistStaffId, 2, DATEADD(day, -3, SYSUTCDATETIME()),
   N'جلسة علاج نطق — تحسّن في نطق الأصوات',
   N'تمرّن على الكلمات الجديدة في المنزل',
   2, SYSUTCDATETIME(), NULL, 0);

-- Message to parent
INSERT INTO Messages (Id, SenderId, RecipientId, MessageType, Content, IsRead, ReadAt, CreatedAt, UpdatedAt, IsDeleted)
VALUES
  (NEWID(), @therapistStaffId, @parentUserId, 0,
   N'السلام عليكم، يوسف أظهر تقدماً رائعاً في جلسة اليوم. يرجى تشجيعه على ممارسة التمارين في المنزل.',
   0, NULL, DATEADD(hour, -2, SYSUTCDATETIME()), NULL, 0);

SELECT 'done' AS Result;
