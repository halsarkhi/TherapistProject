import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Assessment,
  AssessmentSummary,
  AssessmentStatus,
  AssessmentType,
} from '../../core/models/assessment.model';

/**
 * In-memory mock store for assessments.
 *
 * Replace with HTTP-backed implementation once the backend endpoints are
 * available. The shape of the methods matches what the future API will expose.
 */
@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private readonly store = signal<Assessment[]>([]);

  listForStudent(studentId: string): Observable<AssessmentSummary[]> {
    const items = this.store()
      .filter((a) => a.studentId === studentId)
      .map(this.toSummary);
    return of(items).pipe(delay(120));
  }

  listByType(type: AssessmentType): Observable<AssessmentSummary[]> {
    const items = this.store()
      .filter((a) => a.type === type)
      .map(this.toSummary);
    return of(items).pipe(delay(120));
  }

  get(id: string): Observable<Assessment | null> {
    const item = this.store().find((a) => a.id === id) ?? null;
    return of(item).pipe(delay(80));
  }

  save(assessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>): Observable<Assessment> {
    const now = new Date().toISOString();
    const created: Assessment = {
      ...assessment,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.store.update((arr) => [...arr, created]);
    return of(created).pipe(delay(150));
  }

  update(id: string, patch: Partial<Assessment>): Observable<Assessment | null> {
    let updated: Assessment | null = null;
    this.store.update((arr) =>
      arr.map((a) => {
        if (a.id !== id) return a;
        updated = { ...a, ...patch, updatedAt: new Date().toISOString() };
        return updated;
      }),
    );
    return of(updated).pipe(delay(120));
  }

  setStatus(id: string, status: AssessmentStatus): Observable<Assessment | null> {
    return this.update(id, { status });
  }

  private toSummary = (a: Assessment): AssessmentSummary => ({
    id: a.id,
    type: a.type,
    studentId: a.studentId,
    studentName: a.studentName ?? '',
    evaluatorName: a.evaluatorName ?? '',
    date: a.date,
    status: a.status,
  });
}
