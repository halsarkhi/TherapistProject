import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { Observable, switchMap, map, of } from 'rxjs';
import { Message } from '../../core/models/message.model';
import { SessionSchedule } from '../../core/models/schedule.model';
import { TherapySession } from '../../core/models/session.model';
import { Student } from '../../core/models/student.model';

/** Day-of-week index (0=Sunday) → translation key */
const DAY_KEYS: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export function dayOfWeekName(day: number, ts: TranslationService): string {
  const key = DAY_KEYS[day];
  return key ? ts.t(key) : '';
}

/** Convert 24h "HH:mm" to localized 12h display with AM/PM */
export function formatTime12h(time: string, ts: TranslationService): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? ts.t('time_am') : ts.t('time_pm');
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

@Injectable({ providedIn: 'root' })
export class ParentService {
  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
  ) {}

  private get userId(): string {
    return this.auth.getUserId() ?? '';
  }

  // ── Messages ──

  getMyMessages(userId?: string): Observable<Message[]> {
    const id = userId ?? this.userId;
    return this.api.get<Message[]>(`messages/received/${id}`);
  }

  getUnreadMessages(userId?: string): Observable<Message[]> {
    const id = userId ?? this.userId;
    return this.api.get<Message[]>(`messages/received/${id}/unread`);
  }

  markAsRead(messageId: string): Observable<boolean> {
    return this.api.put<boolean>(`messages/${messageId}/read`, {});
  }

  markAllAsRead(userId?: string): Observable<number> {
    const id = userId ?? this.userId;
    return this.api.put<number>(`messages/read-all/${id}`, {});
  }

  getConversation(otherUserId: string): Observable<Message[]> {
    return this.api.get<Message[]>(`messages/conversation/${otherUserId}`);
  }

  sendMessageToTherapist(recipientUserId: string, content: string): Observable<Message> {
    return this.api.post<Message>('messages/parent-send', { recipientUserId, content });
  }

  // ── Children (Students) ──

  getMyChildren(): Observable<Student[]> {
    return this.api.get<Student[]>(`students/parent/${this.userId}`);
  }

  // ── Schedule ──

  getMySchedule(studentId?: string): Observable<SessionSchedule[]> {
    if (studentId) {
      return this.api.get<SessionSchedule[]>(`schedules/student/${studentId}`).pipe(
        map(schedules => this.normalizeSchedules(schedules)),
      );
    }
    return this.getMyChildren().pipe(
      switchMap(children => {
        const firstChildId = children[0]?.id;
        if (!firstChildId) return of([] as SessionSchedule[]);
        return this.api.get<SessionSchedule[]>(`schedules/student/${firstChildId}`);
      }),
      map(schedules => this.normalizeSchedules(schedules)),
    );
  }

  // ── Sessions ──

  getMyStudentSessions(studentId?: string): Observable<TherapySession[]> {
    if (studentId) {
      return this.api.get<TherapySession[]>(`sessions/student/${studentId}`).pipe(
        map(sessions => this.normalizeSessions(sessions)),
      );
    }
    return this.getMyChildren().pipe(
      switchMap(children => {
        const firstChildId = children[0]?.id;
        if (!firstChildId) return of([] as TherapySession[]);
        return this.api.get<TherapySession[]>(`sessions/student/${firstChildId}`);
      }),
      map(sessions => this.normalizeSessions(sessions)),
    );
  }

  // ── Normalization helpers ──

  /** Map API field `roomName` to `room` so templates can use `session.room` */
  private normalizeSchedules(schedules: SessionSchedule[]): SessionSchedule[] {
    const dayMap: Record<string, number> = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6,
    };
    return schedules.map(s => ({
      ...s,
      room: s.room ?? (s as any).roomName,
      dayOfWeek: typeof s.dayOfWeek === 'string' ? (dayMap[s.dayOfWeek] ?? 0) : s.dayOfWeek,
    }));
  }

  /** Map API field `sessionDate` to `scheduledDate` so templates can use `session.scheduledDate` */
  private normalizeSessions(sessions: TherapySession[]): TherapySession[] {
    return sessions.map(s => ({
      ...s,
      scheduledDate: s.scheduledDate ?? s.sessionDate,
    }));
  }
}
