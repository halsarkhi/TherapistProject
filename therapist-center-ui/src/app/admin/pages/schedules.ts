import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminService } from '../services/admin.service';
import { SchedulesService, AvailableSlot } from '../services/schedules.service';
import { SessionSchedule } from '../../core/models/schedule.model';
import { Student } from '../../core/models/student.model';
import { Staff } from '../../core/models/staff.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

interface FormData {
  therapistId: string;
  studentId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomName: string;
}

const EMPTY_FORM: FormData = {
  therapistId: '',
  studentId: '',
  dayOfWeek: 0,
  startTime: '',
  endTime: '',
  roomName: '',
};

const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">{{ ts.currentLang() === 'ar' ? 'جدول الجلسات' : 'Session Schedules' }}</h1>
        <button class="btn-primary" (click)="openAddModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ ts.currentLang() === 'ar' ? 'إضافة جلسة' : 'Add Schedule' }}
        </button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <select class="filter-select" [ngModel]="filterTherapist()" (ngModelChange)="filterTherapist.set($event)">
          <option value="">{{ ts.currentLang() === 'ar' ? 'كل الأخصائيين' : 'All therapists' }}</option>
          @for (t of therapists(); track t.id) {
            <option [value]="t.id">{{ t.fullName }}</option>
          }
        </select>
        <select class="filter-select" [ngModel]="filterDay()" (ngModelChange)="filterDay.set($event)">
          <option value="-1">{{ ts.currentLang() === 'ar' ? 'كل الأيام' : 'All days' }}</option>
          @for (d of [0,1,2,3,4]; track d) {
            <option [value]="d">{{ getDayName(d) }}</option>
          }
        </select>
      </div>

      @if (loading()) {
        <div class="loading-state"><div class="spinner"></div></div>
      } @else if (filteredSchedules().length === 0) {
        <div class="empty-state">
          <p>{{ ts.currentLang() === 'ar' ? 'لا توجد جلسات مجدولة' : 'No scheduled sessions' }}</p>
        </div>
      } @else {
        <div class="schedule-grid">
          @for (group of groupedByDay(); track group.day) {
            <div class="day-column">
              <div class="day-header">
                <span class="day-name">{{ getDayName(group.day) }}</span>
                <span class="day-count">{{ group.items.length }}</span>
              </div>
              <div class="day-items">
                @for (s of group.items; track s.id) {
                  <div class="schedule-card">
                    <div class="card-time">
                      <strong>{{ formatTime(s.startTime) }}</strong>
                      <span class="time-sep">→</span>
                      <strong>{{ formatTime(s.endTime) }}</strong>
                    </div>
                    <div class="card-row">
                      <span class="card-label">{{ ts.currentLang() === 'ar' ? 'الطالب' : 'Student' }}:</span>
                      <span class="card-value">{{ s.studentName }}</span>
                    </div>
                    <div class="card-row">
                      <span class="card-label">{{ ts.currentLang() === 'ar' ? 'الأخصائية' : 'Therapist' }}:</span>
                      <span class="card-value">{{ s.therapistName }}</span>
                    </div>
                    <div class="card-row">
                      <span class="card-label">{{ ts.currentLang() === 'ar' ? 'الغرفة' : 'Room' }}:</span>
                      <span class="card-value">{{ s.roomName ?? s.room ?? '-' }}</span>
                    </div>
                    <div class="card-actions">
                      <button class="btn-icon delete" (click)="deleteSchedule(s)" [title]="ts.currentLang() === 'ar' ? 'حذف' : 'Delete'">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Add modal -->
    @if (showAddModal()) {
      <div class="modal-overlay" (click)="closeAddModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ ts.currentLang() === 'ar' ? 'إضافة جلسة جديدة' : 'Add New Schedule' }}</h2>
            <button class="close-btn" (click)="closeAddModal()">&times;</button>
          </div>

          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>{{ ts.currentLang() === 'ar' ? 'الأخصائية' : 'Therapist' }} *</label>
                <select [ngModel]="formData.therapistId" (ngModelChange)="onTherapistChange($event)">
                  <option value="">{{ ts.currentLang() === 'ar' ? '— اختر —' : '— Select —' }}</option>
                  @for (t of therapists(); track t.id) {
                    <option [value]="t.id">{{ t.fullName }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>{{ ts.currentLang() === 'ar' ? 'الطالب' : 'Student' }} *</label>
                <select [ngModel]="formData.studentId" (ngModelChange)="onStudentChange($event)">
                  <option value="">{{ ts.currentLang() === 'ar' ? '— اختر —' : '— Select —' }}</option>
                  @for (s of students(); track s.id) {
                    <option [value]="s.id">{{ s.fullName }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ ts.currentLang() === 'ar' ? 'اليوم' : 'Day' }} *</label>
                <select [ngModel]="formData.dayOfWeek" (ngModelChange)="onDayChange(+$event)">
                  @for (d of [0,1,2,3,4]; track d) {
                    <option [value]="d">{{ getDayName(d) }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>{{ ts.currentLang() === 'ar' ? 'الغرفة' : 'Room' }} *</label>
                <input type="text" [(ngModel)]="formData.roomName"
                  [placeholder]="ts.currentLang() === 'ar' ? 'مثال: غرفة 1' : 'e.g. Room 1'" />
              </div>
            </div>

            <div class="slots-section">
              <div class="slots-header">
                <span class="slots-title">{{ ts.currentLang() === 'ar' ? 'الأوقات المتاحة (45 دقيقة)' : 'Available slots (45 min)' }}</span>
                @if (loadingSlots()) {
                  <span class="slots-hint">{{ ts.currentLang() === 'ar' ? 'جاري التحميل…' : 'Loading…' }}</span>
                } @else if (!formData.therapistId) {
                  <span class="slots-hint">{{ ts.currentLang() === 'ar' ? 'اختر الأخصائية أولاً' : 'Select a therapist first' }}</span>
                }
              </div>

              @if (slots().length > 0) {
                <div class="slots-grid">
                  @for (slot of slots(); track slot.startTime) {
                    <button
                      type="button"
                      class="slot-btn"
                      [class.selected]="formData.startTime === slot.startTime"
                      [class.unavailable]="!slot.isAvailable"
                      [disabled]="!slot.isAvailable"
                      [title]="slotTooltip(slot)"
                      (click)="selectSlot(slot)">
                      <span class="slot-time">{{ formatTime(slot.startTime) }}</span>
                      <span class="slot-arrow">→</span>
                      <span class="slot-time">{{ formatTime(slot.endTime) }}</span>
                      @if (!slot.isAvailable) {
                        <span class="slot-badge">{{ slot.occupiedBy === 'therapist' ? (ts.currentLang() === 'ar' ? 'مشغول' : 'Busy') : (ts.currentLang() === 'ar' ? 'الطالب مشغول' : 'Student busy') }}</span>
                      }
                    </button>
                  }
                </div>
              }
            </div>

            @if (errorMsg()) {
              <div class="error-banner">{{ errorMsg() }}</div>
            }
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeAddModal()">{{ 'cancel' | translate }}</button>
            <button class="btn-primary" (click)="saveSchedule()"
              [disabled]="!canSave() || saving()">
              @if (saving()) { <span class="spinner-inline"></span> }
              {{ ts.currentLang() === 'ar' ? 'حفظ' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .page { max-width: 1400px; margin: 0 auto; }
    .page-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 24px; gap: 16px; flex-wrap: wrap;
    }
    .page-title { font-size: 1.4rem; font-weight: 700; color: var(--heading-color); }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--primary); color: #fff;
      padding: 10px 18px; border: none; border-radius: var(--radius-sm);
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .filters {
      display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
    }
    .filter-select {
      padding: 10px 14px; border: 1px solid var(--border-color, #e0e0e0);
      border-radius: var(--radius-sm); background: var(--white);
      font-size: 0.88rem; min-width: 180px;
    }

    .loading-state, .empty-state {
      text-align: center; padding: 64px 24px;
      background: var(--white); border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm); color: var(--text-muted);
    }

    .spinner {
      width: 28px; height: 28px;
      border: 3px solid var(--off-white, #eee);
      border-top-color: var(--primary);
      border-radius: 50%; margin: 0 auto;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .schedule-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .day-column {
      background: var(--white); border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm); overflow: hidden;
    }
    .day-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: #fff;
    }
    .day-name { font-weight: 700; font-size: 0.95rem; }
    .day-count {
      background: rgba(255,255,255,0.25); padding: 2px 10px;
      border-radius: 12px; font-size: 0.8rem; font-weight: 600;
    }
    .day-items {
      padding: 14px; display: flex; flex-direction: column; gap: 10px;
    }
    .schedule-card {
      background: var(--off-white, #fafafa);
      border-radius: var(--radius-sm); padding: 12px 14px;
      border-inline-start: 3px solid var(--primary);
      position: relative;
    }
    .card-time {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.95rem; color: var(--heading-color); margin-bottom: 8px;
    }
    .time-sep { color: var(--primary); font-weight: 700; }
    .card-row { display: flex; gap: 6px; font-size: 0.82rem; margin-bottom: 4px; }
    .card-label { color: var(--text-muted); min-width: 50px; }
    .card-value { color: var(--heading-color); font-weight: 500; }
    .card-actions {
      position: absolute; top: 8px; inset-inline-end: 8px;
    }
    .btn-icon {
      background: transparent; border: none; cursor: pointer;
      padding: 6px; color: var(--text-muted); border-radius: 4px;
      transition: all 0.2s;
    }
    .btn-icon.delete:hover { color: #e53935; background: rgba(229,57,53,0.1); }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px;
    }
    .modal {
      background: var(--white); border-radius: var(--radius-md);
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 100%; max-width: 720px; max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid var(--off-white, #f0f0f0);
    }
    .modal-header h2 { font-size: 1.1rem; font-weight: 700; color: var(--heading-color); }
    .close-btn {
      background: transparent; border: none; font-size: 1.6rem;
      cursor: pointer; color: var(--text-muted); width: 32px; height: 32px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
    }
    .close-btn:hover { background: var(--off-white, #f5f5f5); }

    .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.82rem; font-weight: 600; color: var(--heading-color); }
    .form-group input, .form-group select {
      padding: 10px 12px; border: 1px solid var(--border-color, #e0e0e0);
      border-radius: var(--radius-sm); font-size: 0.9rem;
      background: var(--white);
    }

    .slots-section { display: flex; flex-direction: column; gap: 12px; }
    .slots-header {
      display: flex; align-items: center; justify-content: space-between;
    }
    .slots-title { font-weight: 600; font-size: 0.88rem; color: var(--heading-color); }
    .slots-hint { font-size: 0.78rem; color: var(--text-muted); font-style: italic; }
    .slots-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 8px;
    }
    .slot-btn {
      display: flex; align-items: center; justify-content: center;
      gap: 6px; padding: 10px 8px;
      border: 2px solid var(--border-color, #e0e0e0);
      background: var(--white); cursor: pointer;
      border-radius: var(--radius-sm); font-size: 0.85rem;
      transition: all 0.2s; position: relative;
    }
    .slot-btn:hover:not(:disabled) {
      border-color: var(--primary); background: var(--off-white, #fafafa);
    }
    .slot-btn.selected {
      border-color: var(--primary); background: var(--primary); color: #fff;
    }
    .slot-btn.unavailable {
      background: #fef0f0; border-color: #f5c2c2; color: #b71c1c;
      opacity: 0.7; cursor: not-allowed;
    }
    .slot-time { font-weight: 600; }
    .slot-arrow { color: var(--text-muted); font-size: 0.75rem; }
    .slot-btn.selected .slot-arrow { color: rgba(255,255,255,0.8); }
    .slot-badge {
      position: absolute; bottom: -8px; left: 50%;
      transform: translateX(-50%);
      background: #e53935; color: #fff; font-size: 0.65rem;
      padding: 1px 8px; border-radius: 8px; font-weight: 600;
    }

    .error-banner {
      background: #ffebee; border: 1px solid #ef5350; color: #b71c1c;
      padding: 12px 16px; border-radius: var(--radius-sm);
      font-size: 0.85rem;
    }

    .modal-footer {
      display: flex; justify-content: flex-end; gap: 10px;
      padding: 16px 24px; border-top: 1px solid var(--off-white, #f0f0f0);
    }
    .btn-secondary {
      padding: 10px 18px; border: 1px solid var(--border-color, #d0d0d0);
      background: var(--white); cursor: pointer;
      border-radius: var(--radius-sm); font-weight: 600; font-size: 0.88rem;
    }
    .btn-secondary:hover { background: var(--off-white, #f5f5f5); }
    .spinner-inline {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
      border-radius: 50%; animation: spin 0.8s linear infinite;
      margin-inline-end: 6px; vertical-align: middle;
    }

    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
      .slots-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
    }
  `,
})
export class SchedulesComponent implements OnInit {
  private readonly schedulesService = inject(SchedulesService);
  private readonly adminService = inject(AdminService);
  readonly ts = inject(TranslationService);

  readonly loading = signal(true);
  readonly schedules = signal<SessionSchedule[]>([]);
  readonly therapists = signal<Staff[]>([]);
  readonly students = signal<Student[]>([]);

  readonly filterTherapist = signal('');
  readonly filterDay = signal('-1');

  readonly showAddModal = signal(false);
  readonly saving = signal(false);
  readonly errorMsg = signal('');
  readonly slots = signal<AvailableSlot[]>([]);
  readonly loadingSlots = signal(false);

  formData: FormData = { ...EMPTY_FORM };

  readonly filteredSchedules = computed(() => {
    let items = this.schedules();
    const t = this.filterTherapist();
    const d = +this.filterDay();
    if (t) items = items.filter(s => s.therapistId === t);
    if (d >= 0) items = items.filter(s => s.dayOfWeek === d);
    return items;
  });

  readonly groupedByDay = computed(() => {
    const map = new Map<number, SessionSchedule[]>();
    for (const s of this.filteredSchedules()) {
      const arr = map.get(s.dayOfWeek) ?? [];
      arr.push(s);
      map.set(s.dayOfWeek, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return [0, 1, 2, 3, 4]
      .filter(d => map.has(d))
      .map(d => ({ day: d, items: map.get(d)! }));
  });

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.schedulesService.getAll().subscribe({
      next: (s) => {
        this.schedules.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.adminService.getStaff().subscribe(s => this.therapists.set(s));
    this.adminService.getStudents().subscribe(s => this.students.set(s));
  }

  getDayName(d: number): string {
    return this.ts.currentLang() === 'ar' ? DAYS_AR[d] : DAYS_EN[d];
  }

  formatTime(t: string): string {
    if (!t) return '';
    const parts = t.split(':');
    return `${parts[0]}:${parts[1] ?? '00'}`;
  }

  openAddModal(): void {
    this.formData = { ...EMPTY_FORM };
    this.slots.set([]);
    this.errorMsg.set('');
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  onTherapistChange(id: string): void {
    this.formData.therapistId = id;
    this.formData.startTime = '';
    this.formData.endTime = '';
    this.errorMsg.set('');
    this.refreshSlots();
  }

  onStudentChange(id: string): void {
    this.formData.studentId = id;
    this.formData.startTime = '';
    this.formData.endTime = '';
    this.errorMsg.set('');
    this.refreshSlots();
  }

  onDayChange(d: number): void {
    this.formData.dayOfWeek = d;
    this.formData.startTime = '';
    this.formData.endTime = '';
    this.errorMsg.set('');
    this.refreshSlots();
  }

  refreshSlots(): void {
    if (!this.formData.therapistId) {
      this.slots.set([]);
      return;
    }
    this.loadingSlots.set(true);
    this.schedulesService.getAvailableSlots(
      this.formData.therapistId,
      this.formData.dayOfWeek,
      this.formData.studentId || undefined,
    ).subscribe({
      next: (slots) => {
        this.slots.set(slots);
        this.loadingSlots.set(false);
      },
      error: () => {
        this.slots.set([]);
        this.loadingSlots.set(false);
      },
    });
  }

  selectSlot(slot: AvailableSlot): void {
    if (!slot.isAvailable) return;
    this.formData.startTime = slot.startTime;
    this.formData.endTime = slot.endTime;
  }

  slotTooltip(slot: AvailableSlot): string {
    if (slot.isAvailable) return '';
    if (slot.occupiedBy === 'therapist') {
      return this.ts.currentLang() === 'ar' ? 'الأخصائية مشغولة في هذا الوقت' : 'Therapist is busy';
    }
    return this.ts.currentLang() === 'ar' ? 'الطالب مشغول في هذا الوقت' : 'Student is busy';
  }

  canSave(): boolean {
    return !!(
      this.formData.therapistId &&
      this.formData.studentId &&
      this.formData.startTime &&
      this.formData.endTime &&
      this.formData.roomName.trim()
    );
  }

  saveSchedule(): void {
    if (!this.canSave()) return;
    this.saving.set(true);
    this.errorMsg.set('');

    const dto = {
      therapistId: this.formData.therapistId,
      studentId: this.formData.studentId,
      dayOfWeek: +this.formData.dayOfWeek,
      startTime: this.formData.startTime,
      endTime: this.formData.endTime,
      roomName: this.formData.roomName.trim(),
    };

    this.schedulesService.create(dto).subscribe({
      next: (created) => {
        this.schedules.update(arr => [...arr, created]);
        this.saving.set(false);
        this.closeAddModal();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        const body = err.error;
        const msg = body?.message || body?.errors?.[0] || (this.ts.currentLang() === 'ar' ? 'تعذر حفظ الجلسة' : 'Failed to save schedule');
        this.errorMsg.set(msg);
        this.refreshSlots();
      },
    });
  }

  deleteSchedule(s: SessionSchedule): void {
    const confirmText = this.ts.currentLang() === 'ar'
      ? `هل تريد حذف جلسة "${s.studentName}" مع "${s.therapistName}"؟`
      : `Delete session for ${s.studentName} with ${s.therapistName}?`;
    if (!confirm(confirmText)) return;

    this.schedulesService.delete(s.id).subscribe({
      next: () => {
        this.schedules.update(arr => arr.filter(x => x.id !== s.id));
      },
    });
  }
}
