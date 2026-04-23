import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { SessionSchedule, CreateScheduleDto } from '../../core/models/schedule.model';

const DAY_NAME_TO_NUMBER: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

const DAY_NUMBER_TO_NAME = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function normalizeDay(value: number | string): number {
  if (typeof value === 'number') return value;
  return DAY_NAME_TO_NUMBER[value] ?? 0;
}

function dayToServerEnum(value: number): string {
  return DAY_NUMBER_TO_NAME[value] ?? 'Sunday';
}

function normalizeSchedule(s: SessionSchedule): SessionSchedule {
  return { ...s, dayOfWeek: normalizeDay(s.dayOfWeek as unknown as number | string) };
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  occupiedBy?: 'therapist' | 'student' | null;
  occupiedByStudentId?: string | null;
}

export interface UpdateScheduleDto {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  roomName?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  private readonly api = inject(ApiService);

  getAll(): Observable<SessionSchedule[]> {
    return this.api.get<SessionSchedule[]>('schedules')
      .pipe(map(arr => arr.map(normalizeSchedule)));
  }

  getByTherapist(therapistId: string): Observable<SessionSchedule[]> {
    return this.api.get<SessionSchedule[]>(`schedules/therapist/${therapistId}`)
      .pipe(map(arr => arr.map(normalizeSchedule)));
  }

  getByStudent(studentId: string): Observable<SessionSchedule[]> {
    return this.api.get<SessionSchedule[]>(`schedules/student/${studentId}`)
      .pipe(map(arr => arr.map(normalizeSchedule)));
  }

  getAvailableSlots(
    therapistId: string,
    dayOfWeek: number,
    studentId?: string,
  ): Observable<AvailableSlot[]> {
    const params: Record<string, string | number> = {
      therapistId,
      dayOfWeek: dayToServerEnum(dayOfWeek),
    };
    if (studentId) params['studentId'] = studentId;
    return this.api.get<AvailableSlot[]>('schedules/available-slots', params);
  }

  create(dto: CreateScheduleDto & { roomName: string }): Observable<SessionSchedule> {
    const payload = { ...dto, dayOfWeek: dayToServerEnum(dto.dayOfWeek) };
    return this.api.post<SessionSchedule>('schedules', payload)
      .pipe(map(normalizeSchedule));
  }

  update(id: string, dto: UpdateScheduleDto): Observable<SessionSchedule> {
    const payload = dto.dayOfWeek !== undefined
      ? { ...dto, dayOfWeek: dayToServerEnum(dto.dayOfWeek) as unknown as number }
      : dto;
    return this.api.put<SessionSchedule>(`schedules/${id}`, payload)
      .pipe(map(normalizeSchedule));
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`schedules/${id}`);
  }
}
