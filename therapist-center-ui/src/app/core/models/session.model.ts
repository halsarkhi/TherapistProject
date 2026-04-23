import { SessionStatus, SessionType } from './enums';

export interface TherapySession {
  id: string;
  studentId: string;
  studentName: string;
  therapistId: string;
  therapistName: string;
  sessionType: SessionType;
  status: SessionStatus;
  scheduledDate?: string;
  sessionDate?: string;
  startTime?: string;
  endTime?: string;
  summary?: string;
  notes?: string;
  goals?: string;
  outcomes?: string;
  parentFeedback?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSessionDto {
  studentId: string;
  therapistId: string;
  sessionType: SessionType;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  goals?: string;
}

export interface UpdateSessionDto {
  sessionType?: SessionType;
  status?: SessionStatus;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  goals?: string;
  outcomes?: string;
}
