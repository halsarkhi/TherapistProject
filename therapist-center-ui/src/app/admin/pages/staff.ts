import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { Staff } from '../../core/models/staff.model';
import { Specialization, Gender } from '../../core/models/enums';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">{{ 'manage_staff' | translate }}</h1>
        <button class="btn-primary" (click)="openAddModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ 'add_staff' | translate }}
        </button>
      </div>

      <div class="filters">
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" [placeholder]="ts.t('search_by_name')" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
        </div>
        <select class="filter-select" [ngModel]="filterSpec()" (ngModelChange)="filterSpec.set($event)">
          <option value="">{{ 'all_specializations' | translate }}</option>
          <option value="OccupationalTherapy">{{ 'occupational_therapy' | translate }}</option>
          <option value="PhysicalTherapy">{{ 'physical_therapy_spec' | translate }}</option>
          <option value="SpeechTherapy">{{ 'speech_therapy_spec' | translate }}</option>
          <option value="Psychology">{{ 'psychology_spec' | translate }}</option>
          <option value="BehavioralTherapy">{{ 'behavioral_therapy' | translate }}</option>
          <option value="SpecialEducation">{{ 'special_education' | translate }}</option>
        </select>
        <select class="filter-select" [ngModel]="filterStatus()" (ngModelChange)="filterStatus.set($event)">
          <option value="">{{ 'all_statuses' | translate }}</option>
          <option value="active">{{ 'active' | translate }}</option>
          <option value="inactive">{{ 'inactive' | translate }}</option>
        </select>
      </div>

      @if (loading()) {
        <div class="table-skeleton">
          @for (i of [1,2,3,4,5]; track i) { <div class="row-skeleton"></div> }
        </div>
      } @else {
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th class="photo-col">{{ 'photo' | translate }}</th><th>{{ 'name' | translate }}</th><th>{{ 'specialization' | translate }}</th><th>{{ 'email' | translate }}</th><th>{{ 'phone' | translate }}</th><th>{{ 'status' | translate }}</th><th>{{ 'actions' | translate }}</th></tr></thead>
            <tbody>
              @for (member of filteredStaff(); track member.id) {
                <tr class="table-row">
                  <td class="photo-cell">
                    @if (member.photoUrl) {
                      <img class="avatar" [src]="member.photoUrl" [alt]="member.fullName" />
                    } @else {
                      <div class="avatar avatar-fallback">{{ getInitials(member.fullName) }}</div>
                    }
                  </td>
                  <td class="name-cell">{{ member.fullName }}</td>
                  <td>{{ getSpecLabel(member.specialization) }}</td>
                  <td class="ltr-cell">{{ member.email }}</td>
                  <td class="ltr-cell">{{ member.phone }}</td>
                  <td><span class="badge" [class]="member.isActive ? 'badge-active' : 'badge-inactive'">{{ member.isActive ? ts.t('active') : ts.t('inactive') }}</span></td>
                  <td>
                    <div class="actions">
                      <button class="action-btn view" (click)="openViewModal(member)" [title]="ts.t('view')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                      <button class="action-btn edit" (click)="openEditModal(member)" [title]="ts.t('edit')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                      <button class="action-btn delete" (click)="openDeleteConfirm(member)" [title]="ts.t('delete')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                    </div>
                  </td>
                </tr>
              } @empty { <tr><td colspan="7" class="empty-cell">{{ 'no_matching_staff' | translate }}</td></tr> }
            </tbody>
          </table>
        </div>
        <div class="mobile-cards">
          @for (member of filteredStaff(); track member.id) {
            <div class="staff-card">
              <div class="card-header-row"><span class="card-name">{{ member.fullName }}</span><span class="badge" [class]="member.isActive ? 'badge-active' : 'badge-inactive'">{{ member.isActive ? ts.t('active') : ts.t('inactive') }}</span></div>
              <div class="card-info"><span>{{ getSpecLabel(member.specialization) }}</span><span class="ltr-text">{{ member.email }}</span><span class="ltr-text">{{ member.phone }}</span></div>
              <div class="card-actions"><button class="action-btn view" (click)="openViewModal(member)">{{ 'view' | translate }}</button><button class="action-btn edit" (click)="openEditModal(member)">{{ 'edit' | translate }}</button><button class="action-btn delete" (click)="openDeleteConfirm(member)">{{ 'delete' | translate }}</button></div>
            </div>
          } @empty { <p class="empty-state">{{ 'no_matching_staff' | translate }}</p> }
        </div>
      }
    </div>

    @if (showFormModal()) {
      <div class="modal-overlay" (click)="closeFormModal()"><div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header"><h2>{{ editingMember() ? ('edit_staff_data' | translate) : ('add_new_staff' | translate) }}</h2><button class="close-btn" (click)="closeFormModal()">&times;</button></div>
        <div class="modal-body">
          <div class="form-group"><label>{{ 'full_name' | translate }}</label><input type="text" [(ngModel)]="formData.fullName" [placeholder]="ts.t('enter_staff_name')" /></div>
          <div class="form-row"><div class="form-group"><label>{{ 'specialization' | translate }}</label><select [(ngModel)]="formData.specialization"><option value="OccupationalTherapy">{{ 'occupational_therapy' | translate }}</option><option value="PhysicalTherapy">{{ 'physical_therapy_spec' | translate }}</option><option value="SpeechTherapy">{{ 'speech_therapy_spec' | translate }}</option><option value="Psychology">{{ 'psychology_spec' | translate }}</option><option value="BehavioralTherapy">{{ 'behavioral_therapy' | translate }}</option><option value="SpecialEducation">{{ 'special_education' | translate }}</option></select></div><div class="form-group"><label>{{ 'gender' | translate }}</label><select [(ngModel)]="formData.gender"><option value="Male">{{ 'male' | translate }}</option><option value="Female">{{ 'female' | translate }}</option></select></div></div>
          <div class="form-row"><div class="form-group"><label>{{ 'email' | translate }}</label><input type="email" [(ngModel)]="formData.email" [placeholder]="ts.t('email_placeholder')" dir="ltr" /></div><div class="form-group"><label>{{ 'phone_label' | translate }}</label><input type="tel" [(ngModel)]="formData.phone" [placeholder]="ts.t('phone_placeholder')" dir="ltr" /></div></div>
          <div class="form-row"><div class="form-group"><label>{{ 'years_of_experience' | translate }}</label><input type="number" [(ngModel)]="formData.yearsOfExperience" min="0" /></div><div class="form-group"><label>{{ 'qualifications' | translate }}</label><input type="text" [(ngModel)]="formData.qualifications" [placeholder]="ts.t('qualifications_placeholder')" /></div></div>
          <div class="form-row"><div class="form-group"><label>رقم الموظف</label><input type="text" [(ngModel)]="formData.employeeNumber" placeholder="EMP-001" /></div><div class="form-group"><label>رقم الموبايل</label><input type="tel" [(ngModel)]="formData.mobilePhone" placeholder="05XXXXXXXX" dir="ltr" /></div></div>
          <div class="form-group"><label>صورة الموظف</label>
            <input type="file" accept="image/*" (change)="onPhotoSelected($event)" />
            @if (formData.photoUrl) { <div class="photo-preview"><img [src]="formData.photoUrl" alt="preview" /></div> }
          </div>
          @if (!editingMember()) { <div class="form-group"><label>{{ 'password_field' | translate }}</label><input type="password" [(ngModel)]="formData.password" [placeholder]="ts.t('password_placeholder')" /></div> }
        </div>
        <div class="modal-footer"><button class="btn-secondary" (click)="closeFormModal()">{{ 'cancel' | translate }}</button><button class="btn-primary" (click)="saveMember()" [disabled]="saving()">@if (saving()) { <span class="spinner"></span> } {{ editingMember() ? ('save_changes' | translate) : ('add_staff_btn' | translate) }}</button></div>
      </div></div>
    }

    @if (showViewModal()) {
      <div class="modal-overlay" (click)="showViewModal.set(false)"><div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header"><h2>{{ 'staff_data' | translate }}</h2><button class="close-btn" (click)="showViewModal.set(false)">&times;</button></div>
        <div class="modal-body">
          @if (viewingMember(); as member) {
            @if (member.photoUrl) { <div class="view-photo"><img [src]="member.photoUrl" alt="photo" /></div> }
            <div class="view-grid">
              <div class="view-item"><span class="view-label">{{ 'name' | translate }}</span><span class="view-value">{{ member.fullName }}</span></div>
              <div class="view-item"><span class="view-label">رقم الموظف</span><span class="view-value">{{ member.employeeNumber || '-' }}</span></div>
              <div class="view-item"><span class="view-label">{{ 'specialization' | translate }}</span><span class="view-value">{{ getSpecLabel(member.specialization) }}</span></div>
              <div class="view-item"><span class="view-label">{{ 'email' | translate }}</span><span class="view-value ltr-text">{{ member.email }}</span></div>
              <div class="view-item"><span class="view-label">{{ 'phone_label' | translate }}</span><span class="view-value ltr-text">{{ member.phone }}</span></div>
              <div class="view-item"><span class="view-label">رقم الموبايل</span><span class="view-value ltr-text">{{ member.mobilePhone || '-' }}</span></div>
              <div class="view-item"><span class="view-label">{{ 'years_of_experience' | translate }}</span><span class="view-value">{{ member.yearsOfExperience }}</span></div>
              <div class="view-item"><span class="view-label">{{ 'status' | translate }}</span><span class="badge" [class]="member.isActive ? 'badge-active' : 'badge-inactive'">{{ member.isActive ? ts.t('active') : ts.t('inactive') }}</span></div>
            </div>
          }
        </div>
        <div class="modal-footer"><button class="btn-secondary" (click)="showViewModal.set(false)">{{ 'close' | translate }}</button></div>
      </div></div>
    }

    <!-- Credentials Modal -->
    @if (showCredentialsModal()) {
      <div class="modal-overlay" (click)="showCredentialsModal.set(false)"><div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header"><h2>{{ 'staff_created' | translate }}</h2><button class="close-btn" (click)="showCredentialsModal.set(false)">&times;</button></div>
        <div class="modal-body">
          <div class="credentials-card">
            <div class="cred-item"><span class="cred-label">{{ 'name' | translate }}</span><span class="cred-value">{{ createdCredentials().fullName }}</span></div>
            <div class="cred-item"><span class="cred-label">{{ 'email' | translate }}</span><span class="cred-value ltr-text">{{ createdCredentials().email }}</span></div>
            <div class="cred-item"><span class="cred-label">{{ 'password' | translate }}</span><span class="cred-value ltr-text">{{ createdCredentials().password }}</span></div>
            <p class="cred-warning">{{ 'save_credentials_warning' | translate }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" (click)="copyCredentials()">{{ copied() ? ('copied' | translate) : ('copy_credentials' | translate) }}</button>
          <button class="btn-secondary" (click)="printCredentials()">{{ 'print' | translate }}</button>
        </div>
      </div></div>
    }

    @if (showDeleteModal()) {
      <div class="modal-overlay" (click)="showDeleteModal.set(false)"><div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header"><h2>{{ 'confirm_delete_title' | translate }}</h2><button class="close-btn" (click)="showDeleteModal.set(false)">&times;</button></div>
        <div class="modal-body"><p class="confirm-text">{{ 'confirm_delete_staff' | translate }} <strong>{{ deletingMember()?.fullName }}</strong>؟</p><p class="confirm-warning">{{ 'cannot_undo' | translate }}</p></div>
        <div class="modal-footer"><button class="btn-secondary" (click)="showDeleteModal.set(false)">{{ 'cancel' | translate }}</button><button class="btn-danger" (click)="confirmDelete()" [disabled]="saving()">@if (saving()) { <span class="spinner"></span> } {{ 'delete' | translate }}</button></div>
      </div></div>
    }
  `,
  styles: `
    .page { max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-title { font-size: 28px; font-weight: 700; color: var(--heading-color); }
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--primary); color: var(--bg-card); border-radius: var(--radius-md); font-size: 14px; font-weight: 600; transition: var(--transition); }
    .btn-primary:hover { background: var(--primary-dark); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { padding: 10px 20px; background: var(--off-white); color: var(--text-dark); border-radius: var(--radius-md); font-size: 14px; font-weight: 600; transition: var(--transition); }
    .btn-secondary:hover { background: var(--border-light); }
    .btn-danger { padding: 10px 20px; background: var(--error); color: var(--bg-card); border-radius: var(--radius-md); font-size: 14px; font-weight: 600; transition: var(--transition); }
    .btn-danger:hover { background: #a93226; }
    .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
    .filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-box { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px; padding: 0 16px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border); transition: var(--transition); }
    .search-box:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent); }
    .search-box svg { color: var(--text-muted); flex-shrink: 0; }
    .search-box input { flex: 1; border: none; padding: 12px 0; font-size: 14px; background: transparent; }
    .filter-select { padding: 12px 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 14px; color: var(--text-dark); cursor: pointer; transition: var(--transition); }
    .filter-select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent); }
    .table-wrap { background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 16px 20px; text-align: right; font-size: 13px; font-weight: 600; color: var(--text-muted); background: var(--off-white); border-bottom: 1px solid var(--border); white-space: nowrap; }
    .data-table td { padding: 16px 20px; font-size: 14px; border-bottom: 1px solid var(--off-white); }
    .table-row { transition: var(--transition); animation: fadeIn 0.3s ease both; }
    .table-row:hover { background: color-mix(in srgb, var(--primary) 4%, transparent); }
    .name-cell { font-weight: 600; }
    .photo-col { width: 72px; }
    .photo-cell { padding: 12px 20px !important; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); font-weight: 700; font-size: 14px; border: 2px solid var(--off-white); }
    .avatar-fallback { text-transform: uppercase; }
    .ltr-cell { direction: ltr; text-align: right; }
    .ltr-text { direction: ltr; unicode-bidi: isolate; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-active { background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); }
    .badge-inactive { background: rgba(156,163,175,0.15); color: #6B7280; }
    .actions { display: flex; gap: 8px; }
    .action-btn { width: 34px; height: 34px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; transition: var(--transition); background: transparent; }
    .action-btn.view { color: #3B82F6; } .action-btn.view:hover { background: rgba(59,130,246,0.1); }
    .action-btn.edit { color: #F59E0B; } .action-btn.edit:hover { background: rgba(245,158,11,0.1); }
    .action-btn.delete { color: #EF4444; } .action-btn.delete:hover { background: rgba(239,68,68,0.1); }
    .empty-cell { text-align: center; padding: 48px 20px !important; color: var(--text-muted); }
    .mobile-cards { display: none; }
    .staff-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 12px; box-shadow: var(--shadow-sm); animation: fadeIn 0.3s ease both; }
    .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .card-name { font-size: 16px; font-weight: 700; color: var(--text-dark); }
    .card-info { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; font-size: 13px; color: var(--text-muted); }
    .card-actions { display: flex; gap: 8px; border-top: 1px solid var(--off-white); padding-top: 12px; }
    .card-actions .action-btn { width: auto; height: auto; padding: 6px 14px; font-size: 13px; font-weight: 500; border-radius: var(--radius-sm); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; animation: fadeIn 0.2s ease; }
    .modal { background: var(--bg-card); border-radius: var(--radius-lg); width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; animation: modalSlide 0.3s cubic-bezier(0.4,0,0.2,1); }
    .modal-sm { max-width: 440px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--off-white); }
    .modal-header h2 { font-size: 18px; font-weight: 700; color: var(--heading-color); }
    .close-btn { width: 32px; height: 32px; font-size: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--off-white); color: var(--text-muted); transition: var(--transition); }
    .close-btn:hover { background: var(--border-light); }
    .modal-body { padding: 24px; }
    .modal-footer { display: flex; justify-content: flex-start; gap: 12px; padding: 16px 24px; border-top: 1px solid var(--off-white); }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 6px; }
    .form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; transition: var(--transition); background: var(--bg-card); }
    .form-group input:focus, .form-group select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .view-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .view-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
    .view-value { font-size: 15px; font-weight: 600; color: var(--text-dark); }
    .confirm-text { font-size: 15px; color: var(--text-dark); margin-bottom: 8px; }
    .confirm-warning { font-size: 13px; color: var(--error); }
    .table-skeleton { background: var(--bg-card); border-radius: var(--radius-lg); padding: 20px; }
    .row-skeleton { height: 56px; margin-bottom: 8px; border-radius: var(--radius-sm); background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
    .empty-state { text-align: center; padding: 48px 20px; color: var(--text-muted); }
    .view-photo { display: flex; justify-content: center; margin-bottom: 20px; }
    .view-photo img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); }
    .photo-preview { margin-top: 10px; }
    .photo-preview img { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border); }
    .credentials-card { background: var(--off-white); border-radius: var(--radius-md); padding: 20px; }
    .cred-item { margin-bottom: 12px; }
    .cred-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 2px; }
    .cred-value { font-size: 15px; font-weight: 600; color: var(--text-dark); }
    .cred-warning { margin-top: 16px; padding: 10px; background: rgba(239,68,68,0.08); border-radius: var(--radius-sm); color: var(--error); font-size: 13px; font-weight: 600; text-align: center; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalSlide { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) { .page-title { font-size: 22px; } .table-wrap { display: none; } .mobile-cards { display: block; } .form-row { grid-template-columns: 1fr; } .view-grid { grid-template-columns: 1fr; } .modal { max-width: 100%; } }
  `,
})
export class StaffComponent implements OnInit {
  readonly staff = signal<Staff[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly searchQuery = signal('');
  readonly filterSpec = signal('');
  readonly filterStatus = signal('');

  readonly showFormModal = signal(false);
  readonly showViewModal = signal(false);
  readonly showDeleteModal = signal(false);
  readonly showCredentialsModal = signal(false);
  readonly editingMember = signal<Staff | null>(null);
  readonly viewingMember = signal<Staff | null>(null);
  readonly deletingMember = signal<Staff | null>(null);
  readonly createdCredentials = signal<{fullName: string, email: string, password: string}>({fullName: '', email: '', password: ''});
  readonly copied = signal(false);

  formData = this.getEmptyForm();

  readonly filteredStaff = computed(() => {
    let result = this.staff();
    const query = this.searchQuery().trim();
    const spec = this.filterSpec();
    const status = this.filterStatus();
    if (query) result = result.filter(s => s.fullName.includes(query));
    if (spec) result = result.filter(s => s.specialization === spec);
    if (status === 'active') result = result.filter(s => s.isActive);
    if (status === 'inactive') result = result.filter(s => !s.isActive);
    return result;
  });

  constructor(
    private readonly adminService: AdminService,
    public readonly ts: TranslationService,
  ) {}

  ngOnInit(): void { this.loadStaff(); }

  loadStaff(): void {
    this.loading.set(true);
    this.adminService.getStaff().subscribe({
      next: (data) => { this.staff.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/).filter(p => p && p !== 'د.' && p !== 'د');
    const letters = parts.slice(0, 2).map(p => p.charAt(0));
    return letters.join('');
  }

  getSpecLabel(spec: string): string {
    const map: Record<string, string> = {
      OccupationalTherapy: this.ts.t('occupational_therapy'),
      PhysicalTherapy: this.ts.t('physical_therapy_spec'),
      SpeechTherapy: this.ts.t('speech_therapy_spec'),
      Psychology: this.ts.t('psychology_spec'),
      BehavioralTherapy: this.ts.t('behavioral_therapy'),
      SpecialEducation: this.ts.t('special_education'),
      SocialWork: this.ts.t('social_work'),
    };
    return map[spec] ?? spec;
  }

  getEmptyForm() {
    return { fullName: '', specialization: Specialization.OccupationalTherapy as string, gender: Gender.Male as string, email: '', phone: '', yearsOfExperience: 0, qualifications: '', password: '', employeeNumber: '', mobilePhone: '', photoUrl: '' };
  }

  openAddModal(): void { this.editingMember.set(null); this.formData = this.getEmptyForm(); this.showFormModal.set(true); }

  openEditModal(member: Staff): void {
    this.editingMember.set(member);
    this.formData = { fullName: member.fullName, specialization: member.specialization, gender: member.gender, email: member.email, phone: member.phone, yearsOfExperience: member.yearsOfExperience, qualifications: member.qualifications ?? '', password: '', employeeNumber: member.employeeNumber ?? '', mobilePhone: member.mobilePhone ?? '', photoUrl: member.photoUrl ?? '' };
    this.showFormModal.set(true);
  }

  closeFormModal(): void { this.showFormModal.set(false); }
  openViewModal(member: Staff): void { this.viewingMember.set(member); this.showViewModal.set(true); }
  openDeleteConfirm(member: Staff): void { this.deletingMember.set(member); this.showDeleteModal.set(true); }

  saveMember(): void {
    if (!this.formData.fullName.trim()) return;
    this.saving.set(true);
    const editing = this.editingMember();
    if (editing) {
      this.adminService.updateStaff(editing.id, { fullName: this.formData.fullName, phone: this.formData.phone, specialization: this.formData.specialization as Specialization, qualifications: this.formData.qualifications || undefined, yearsOfExperience: this.formData.yearsOfExperience, employeeNumber: this.formData.employeeNumber || undefined, mobilePhone: this.formData.mobilePhone || undefined, photoUrl: this.formData.photoUrl || undefined }).subscribe({
        next: () => { this.saving.set(false); this.closeFormModal(); this.loadStaff(); },
        error: () => this.saving.set(false),
      });
    } else {
      const savedName = this.formData.fullName;
      const savedEmail = this.formData.email;
      const savedPassword = this.formData.password;
      this.adminService.createStaff({ fullName: this.formData.fullName, email: this.formData.email, password: this.formData.password, phone: this.formData.phone, gender: this.formData.gender as Gender, specialization: this.formData.specialization as Specialization, qualifications: this.formData.qualifications || undefined, yearsOfExperience: this.formData.yearsOfExperience, employeeNumber: this.formData.employeeNumber || undefined, mobilePhone: this.formData.mobilePhone || undefined, photoUrl: this.formData.photoUrl || undefined }).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeFormModal();
          this.loadStaff();
          this.createdCredentials.set({ fullName: savedName, email: savedEmail, password: savedPassword });
          this.showCredentialsModal.set(true);
        },
        error: () => this.saving.set(false),
      });
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('الحد الأقصى لحجم الصورة 2 ميجابايت'); return; }
    const reader = new FileReader();
    reader.onload = () => { this.formData = { ...this.formData, photoUrl: reader.result as string }; };
    reader.readAsDataURL(file);
  }

  copyCredentials(): void {
    const creds = this.createdCredentials();
    const text = `${this.ts.t('name')}: ${creds.fullName}\n${this.ts.t('email')}: ${creds.email}\n${this.ts.t('password')}: ${creds.password}`;
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  printCredentials(): void {
    const creds = this.createdCredentials();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    let html = `<html dir="rtl"><head><meta charset="utf-8"><title>${this.ts.t('credentials')}</title><style>body{font-family:Arial,sans-serif;padding:40px;direction:rtl}.title{font-size:22px;font-weight:bold;margin-bottom:20px;color:#333}.item{margin-bottom:12px}.label{font-size:13px;color:#888}.value{font-size:16px;font-weight:600}.warning{margin-top:24px;padding:12px;background:#fff3f3;color:#c0392b;border-radius:6px;font-size:13px;text-align:center}</style></head><body>`;
    html += `<div class="title">${this.ts.t('staff_created')}</div>`;
    html += `<div class="item"><div class="label">${this.ts.t('name')}</div><div class="value">${creds.fullName}</div></div>`;
    html += `<div class="item"><div class="label">${this.ts.t('email')}</div><div class="value">${creds.email}</div></div>`;
    html += `<div class="item"><div class="label">${this.ts.t('password')}</div><div class="value">${creds.password}</div></div>`;
    html += `<div class="warning">${this.ts.t('save_credentials_warning')}</div>`;
    html += `</body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }

  confirmDelete(): void {
    const member = this.deletingMember();
    if (!member) return;
    this.saving.set(true);
    this.adminService.deleteStaff(member.id).subscribe({
      next: () => { this.saving.set(false); this.showDeleteModal.set(false); this.loadStaff(); },
      error: () => this.saving.set(false),
    });
  }
}
