import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Student, CreateStudentDto, UpdateStudentDto } from '../../core/models/student.model';
import { Staff, CreateStaffDto, UpdateStaffDto } from '../../core/models/staff.model';
import { Message } from '../../core/models/message.model';
import { DisabilityType } from '../../core/models/enums';

// Shape returned by GET /api/dashboard/stats
export interface ApiDashboardStats {
  totalStudents: number;
  totalStaff: number;
  activeSessions: number;
  unreadMessages: number;
  studentsByDisability: Record<string, number>;
}

// Shape consumed by the dashboard component
export interface AdminDashboardStats {
  totalStudents: number;
  totalStaff: number;
  activeSessions: number;
  unreadMessages: number;
  disabilityDistribution: { type: string; label: string; count: number }[];
}

// Shape returned by GET /api/dashboard/recent-activity
export interface ApiRecentActivity {
  description: string;
  personName: string;
  timeAgo: string;
}

// Shape consumed by the dashboard component
export interface RecentActivityItem {
  id: string;
  description: string;
  personName: string;
  timeAgo: string;
}

const DISABILITY_LABELS: Record<string, string> = {
  [DisabilityType.Autism]: 'التوحد',
  [DisabilityType.DownSyndrome]: 'متلازمة داون',
  [DisabilityType.CerebralPalsy]: 'الشلل الدماغي',
  [DisabilityType.IntellectualDisability]: 'إعاقة ذهنية',
  [DisabilityType.ADHD]: 'فرط الحركة',
  [DisabilityType.SpeechDelay]: 'تأخر النطق',
  [DisabilityType.HearingImpairment]: 'ضعف السمع',
  [DisabilityType.VisualImpairment]: 'ضعف البصر',
  [DisabilityType.MultipleDisabilities]: 'إعاقات متعددة',
  [DisabilityType.Other]: 'أخرى',
};

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private readonly api: ApiService) {}

  // Dashboard
  getDashboardStats(): Observable<AdminDashboardStats> {
    return this.api.get<ApiDashboardStats>('dashboard/stats').pipe(
      map((raw) => ({
        totalStudents: raw.totalStudents,
        totalStaff: raw.totalStaff,
        activeSessions: raw.activeSessions,
        unreadMessages: raw.unreadMessages,
        disabilityDistribution: Object.entries(raw.studentsByDisability ?? {}).map(
          ([type, count]) => ({
            type,
            label: DISABILITY_LABELS[type] ?? type,
            count,
          })
        ),
      }))
    );
  }

  getRecentActivity(): Observable<RecentActivityItem[]> {
    return this.api.get<ApiRecentActivity[]>('dashboard/recent-activity').pipe(
      map((items) =>
        items.map((item, index) => ({
          id: String(index),
          description: item.description,
          personName: item.personName,
          timeAgo: item.timeAgo,
        }))
      )
    );
  }

  // Parents
  getParents(): Observable<{userId: string, fullName: string, email: string}[]> {
    return this.api.get<{userId: string, fullName: string, email: string}[]>('auth/parents');
  }

  // Students CRUD
  getStudents(): Observable<Student[]> {
    return this.api.get<Student[]>('students');
  }

  createStudent(dto: CreateStudentDto): Observable<Student> {
    return this.api.post<Student>('students', dto);
  }

  updateStudent(id: string, dto: UpdateStudentDto): Observable<Student> {
    return this.api.put<Student>(`students/${id}`, dto);
  }

  deleteStudent(id: string): Observable<void> {
    return this.api.delete<void>(`students/${id}`);
  }

  // Staff CRUD
  getStaff(): Observable<Staff[]> {
    return this.api.get<Staff[]>('staff');
  }

  createStaff(dto: CreateStaffDto): Observable<Staff> {
    return this.api.post<Staff>('staff', dto);
  }

  updateStaff(id: string, dto: UpdateStaffDto): Observable<Staff> {
    return this.api.put<Staff>(`staff/${id}`, dto);
  }

  deleteStaff(id: string): Observable<void> {
    return this.api.delete<void>(`staff/${id}`);
  }

  // Messages
  getMessages(): Observable<Message[]> {
    return this.api.get<Message[]>('messages');
  }

  markMessageAsRead(id: string): Observable<void> {
    return this.api.put<void>(`messages/${id}/read`, {});
  }
}
