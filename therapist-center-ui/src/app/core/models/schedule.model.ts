export interface SessionSchedule {
  id: string;
  studentId: string;
  studentName: string;
  therapistId: string;
  therapistName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  room?: string;
  roomName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScheduleDto {
  studentId: string;
  therapistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}
