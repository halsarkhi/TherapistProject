import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { Observable, map, switchMap, shareReplay, of } from 'rxjs';
import { Student } from '../../core/models/student.model';
import { TherapySession, CreateSessionDto } from '../../core/models/session.model';
import { Message, CreateMessageDto } from '../../core/models/message.model';
import { Staff } from '../../core/models/staff.model';

/** Broadcast-specific message type for quick templates */
export enum BroadcastType {
  ArrivedSafely = 0,
  SessionCompleted = 1,
  NeedsSupplies = 2,
  Custom = 3,
}

export interface ParentContact {
  id: string;
  name: string;
  studentName: string;
  unreadCount: number;
}

export interface SessionTypeOption {
  value: string;
  labelKey: string;
}

export const SESSION_TYPE_OPTIONS: SessionTypeOption[] = [
  { value: 'OccupationalTherapy', labelKey: 'session_type_occupational' },
  { value: 'PhysicalTherapy', labelKey: 'session_type_physical' },
  { value: 'SpeechTherapy', labelKey: 'session_type_speech' },
  { value: 'Psychology', labelKey: 'session_type_psychology' },
];

@Injectable({ providedIn: 'root' })
export class TherapistService {
  /** Cached staff profile observable (avoids re-fetching on every call) */
  private staffProfile$: Observable<Staff> | null = null;

  private readonly ts = inject(TranslationService);

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
  ) {}

  /**
   * Gets the current therapist's Staff record by looking up all staff
   * and filtering by the current user's ID (from JWT sub claim).
   * The result is cached via shareReplay to avoid redundant requests.
   */
  getMyStaffProfile(): Observable<Staff> {
    if (!this.staffProfile$) {
      this.staffProfile$ = this.api.get<Staff>('staff/me').pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
      );
    }
    return this.staffProfile$;
  }

  /** GET /api/students - returns all students visible to the therapist */
  getMyStudents(): Observable<Student[]> {
    return this.api.get<Student[]>('students');
  }

  /**
   * POST /api/sessions
   * The backend expects: { studentId, sessionType, sessionDate, summary, notes }
   * The therapist's staffId is extracted from the JWT on the backend side.
   */
  createSession(dto: CreateSessionDto): Observable<TherapySession> {
    const body = {
      studentId: dto.studentId,
      sessionType: dto.sessionType,
      sessionDate: dto.scheduledDate,
      summary: dto.notes ?? '',
      notes: dto.goals ?? '',
    };
    return this.api.post<TherapySession>('sessions', body);
  }

  /**
   * GET /api/sessions/therapist/{staffId}
   * First resolves the therapist's staffId, then fetches their sessions.
   */
  getMySessions(): Observable<TherapySession[]> {
    return this.getMyStaffProfile().pipe(
      switchMap((staff) =>
        this.api.get<TherapySession[]>(`sessions/therapist/${staff.id}`),
      ),
    );
  }

  /**
   * POST /api/messages
   * The backend expects: { recipientId, messageType (integer 0-3), content }
   * The senderId is extracted from the JWT on the backend side.
   *
   * BroadcastType integer mapping:
   *   0 = ArrivedSafely, 1 = SessionCompleted, 2 = NeedsSupplies, 3 = Custom
   */
  sendMessage(dto: CreateMessageDto): Observable<Message> {
    const messageTypeInt = this.mapMessageTypeToInt(dto.messageType);
    const body = {
      recipientId: dto.receiverId,
      messageType: messageTypeInt,
      content: dto.content,
    };
    return this.api.post<Message>('messages', body);
  }

  /**
   * GET /api/messages/sent/{staffId}
   * Fetches all sent messages for the current therapist.
   * Optionally filters by parentId (receiverId) on the client side.
   */
  getSentMessages(parentId?: string): Observable<Message[]> {
    return this.getMyStaffProfile().pipe(
      switchMap((staff) =>
        this.api.get<Message[]>(`messages/sent/${staff.id}`),
      ),
      map((messages) =>
        parentId
          ? messages.filter((m) => m.receiverId === parentId)
          : messages,
      ),
    );
  }

  /**
   * Derives parent contacts from the students list.
   * Groups students by parentId to produce unique parent entries.
   */
  getParentContacts(): Observable<ParentContact[]> {
    return this.getMyStudents().pipe(
      map((students) => {
        const parentMap = new Map<string, ParentContact>();
        for (const student of students) {
          if (!parentMap.has(student.parentId)) {
            parentMap.set(student.parentId, {
              id: student.parentId,
              name: (student as any).parentName || `${this.ts.t('parent_of')} ${student.fullName}`,
              studentName: student.fullName,
              unreadCount: 0,
            });
          } else {
            const existing = parentMap.get(student.parentId)!;
            existing.studentName += `, ${student.fullName}`;
          }
        }
        return Array.from(parentMap.values());
      }),
    );
  }

  /**
   * Maps the string-based MessageType enum to the integer values
   * the backend expects.
   */
  private mapMessageTypeToInt(
    messageType: string,
  ): number {
    switch (messageType) {
      case 'General':
        return 0; // ArrivedSafely
      case 'Report':
        return 1; // SessionCompleted
      case 'Alert':
        return 2; // NeedsSupplies
      case 'Broadcast':
        return 3; // Custom
      default:
        return 3;
    }
  }
}
