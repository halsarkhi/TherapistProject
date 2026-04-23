import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { Student } from '../../core/models/student.model';
import { DisabilityType, Gender } from '../../core/models/enums';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { AvatarComponent } from '../../shared/components/avatar';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [FormsModule, TranslatePipe, AvatarComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">{{ 'manage_students' | translate }}</h1>
        <button class="btn-primary" (click)="openAddModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ 'add_student' | translate }}
        </button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" [placeholder]="ts.t('search_by_name')" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
        </div>
        <select class="filter-select" [ngModel]="filterDisability()" (ngModelChange)="filterDisability.set($event)">
          <option value="">{{ 'all_disabilities' | translate }}</option>
          <option [value]="DisabilityType.Autism">{{ 'autism' | translate }}</option>
          <option [value]="DisabilityType.DownSyndrome">{{ 'down_syndrome' | translate }}</option>
          <option [value]="DisabilityType.CerebralPalsy">{{ 'cerebral_palsy' | translate }}</option>
          <option [value]="DisabilityType.Other">{{ 'other' | translate }}</option>
        </select>
        <select class="filter-select" [ngModel]="filterStatus()" (ngModelChange)="filterStatus.set($event)">
          <option value="">{{ 'all_statuses' | translate }}</option>
          <option value="active">{{ 'active' | translate }}</option>
          <option value="inactive">{{ 'inactive' | translate }}</option>
        </select>
      </div>

      @if (loading()) {
        <div class="table-skeleton">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <div class="row-skeleton"></div>
          }
        </div>
      } @else {
        <!-- Desktop Table -->
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'name' | translate }}</th>
                <th>{{ 'date_of_birth' | translate }}</th>
                <th>{{ 'gender' | translate }}</th>
                <th>{{ 'disability_type' | translate }}</th>
                <th>{{ 'status' | translate }}</th>
                <th>{{ 'actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (student of filteredStudents(); track student.id) {
                <tr class="table-row">
                  <td class="name-cell">
                    <div class="name-with-avatar">
                      <app-avatar [name]="student.fullName" [imageUrl]="student.avatarUrl ?? ''" size="32px" />
                      <span>{{ student.fullName }}</span>
                    </div>
                  </td>
                  <td>{{ student.dateOfBirth }}</td>
                  <td>{{ getGenderLabel(student.gender) }}</td>
                  <td>{{ getDisabilityLabel(student.disabilityType) }}</td>
                  <td>
                    <span class="badge" [class]="student.isActive ? 'badge-active' : 'badge-inactive'">
                      {{ student.isActive ? ts.t('active') : ts.t('inactive') }}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <button class="action-btn view" (click)="openViewModal(student)" [title]="ts.t('view')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button class="action-btn edit" (click)="openEditModal(student)" [title]="ts.t('edit')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button class="action-btn delete" (click)="openDeleteConfirm(student)" [title]="ts.t('delete')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty-cell">{{ 'no_matching_students' | translate }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="mobile-cards">
          @for (student of filteredStudents(); track student.id) {
            <div class="student-card">
              <div class="card-header-row">
                <div class="name-with-avatar">
                  <app-avatar [name]="student.fullName" [imageUrl]="student.avatarUrl ?? ''" size="36px" />
                  <span class="card-name">{{ student.fullName }}</span>
                </div>
                <span class="badge" [class]="student.isActive ? 'badge-active' : 'badge-inactive'">
                  {{ student.isActive ? ts.t('active') : ts.t('inactive') }}
                </span>
              </div>
              <div class="card-info">
                <span>{{ getGenderLabel(student.gender) }}</span>
                <span>{{ getDisabilityLabel(student.disabilityType) }}</span>
                <span>{{ student.dateOfBirth }}</span>
              </div>
              <div class="card-actions">
                <button class="action-btn view" (click)="openViewModal(student)">{{ 'view' | translate }}</button>
                <button class="action-btn edit" (click)="openEditModal(student)">{{ 'edit' | translate }}</button>
                <button class="action-btn delete" (click)="openDeleteConfirm(student)">{{ 'delete' | translate }}</button>
              </div>
            </div>
          } @empty {
            <p class="empty-state">{{ 'no_matching_students' | translate }}</p>
          }
        </div>
      }
    </div>

    <!-- Add/Edit Modal -->
    @if (showFormModal()) {
      <div class="modal-overlay" (click)="closeFormModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingStudent() ? ('edit_student_data' | translate) : ('add_new_student' | translate) }}</h2>
            <button class="close-btn" (click)="closeFormModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="photo-upload">
              <div class="photo-preview">
                @if (formData.avatarUrl) {
                  <img [src]="formData.avatarUrl" alt="" />
                } @else {
                  <app-avatar [name]="formData.fullName || '?'" imageUrl="" size="96px" />
                }
              </div>
              <div class="photo-actions">
                <label class="btn-secondary photo-btn">
                  {{ (formData.avatarUrl ? 'change_photo' : 'upload_photo') | translate }}
                  <input type="file" accept="image/*" (change)="onPhotoSelected($event)" hidden />
                </label>
                @if (formData.avatarUrl) {
                  <button type="button" class="btn-secondary photo-btn" (click)="removePhoto()">
                    {{ 'remove_photo' | translate }}
                  </button>
                }
                @if (photoError()) {
                  <span class="photo-error">{{ photoError() }}</span>
                }
              </div>
            </div>

            <div class="form-group">
              <label>{{ 'full_name' | translate }}</label>
              <input type="text" [(ngModel)]="formData.fullName" [placeholder]="ts.t('enter_student_name')" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ 'date_of_birth' | translate }}</label>
                <input type="date" [(ngModel)]="formData.dateOfBirth" />
              </div>
              <div class="form-group">
                <label>{{ 'gender' | translate }}</label>
                <select [(ngModel)]="formData.gender">
                  <option [value]="Gender.Male">{{ 'male' | translate }}</option>
                  <option [value]="Gender.Female">{{ 'female' | translate }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ 'disability_type' | translate }}</label>
                <select [(ngModel)]="formData.disabilityType">
                  <option [value]="DisabilityType.Autism">{{ 'autism' | translate }}</option>
                  <option [value]="DisabilityType.DownSyndrome">{{ 'down_syndrome' | translate }}</option>
                  <option [value]="DisabilityType.CerebralPalsy">{{ 'cerebral_palsy' | translate }}</option>
                  <option [value]="DisabilityType.ADHD">{{ 'adhd' | translate }}</option>
                  <option [value]="DisabilityType.SpeechDelay">{{ 'speech_delay' | translate }}</option>
                  <option [value]="DisabilityType.Other">{{ 'other' | translate }}</option>
                </select>
              </div>
              @if (editingStudent()) {
                <div class="form-group">
                  <label>{{ 'parent_guardian' | translate }}</label>
                  <input type="text" [(ngModel)]="formData.parentId" [placeholder]="ts.t('parent_id_label')" />
                </div>
              }
            </div>

            @if (!editingStudent()) {
              <!-- Parent mode toggle -->
              <div class="parent-toggle">
                <label class="toggle-option" [class.active]="parentMode() === 'new'" (click)="parentMode.set('new')">
                  <input type="radio" name="parentMode" value="new" [checked]="parentMode() === 'new'" />
                  {{ 'new_parent' | translate }}
                </label>
                <label class="toggle-option" [class.active]="parentMode() === 'existing'" (click)="parentMode.set('existing')">
                  <input type="radio" name="parentMode" value="existing" [checked]="parentMode() === 'existing'" />
                  {{ 'existing_parent' | translate }}
                </label>
              </div>

              @if (parentMode() === 'new') {
                <div class="section-header">{{ 'parent_info' | translate }}</div>
                <div class="form-group">
                  <label>{{ 'parent_name' | translate }}</label>
                  <input type="text" [(ngModel)]="formData.parentName" />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>{{ 'parent_email' | translate }}</label>
                    <input type="email" [(ngModel)]="formData.parentEmail" dir="ltr" />
                  </div>
                  <div class="form-group">
                    <label>{{ 'parent_phone' | translate }}</label>
                    <input type="tel" [(ngModel)]="formData.parentPhone" dir="ltr" />
                  </div>
                </div>
                <div class="form-group">
                  <label>{{ 'parent_password' | translate }}</label>
                  <div class="password-row">
                    <input type="text" [(ngModel)]="formData.parentPassword" dir="ltr" />
                    <button type="button" class="btn-generate" (click)="generatePassword()">{{ 'generate_password' | translate }}</button>
                  </div>
                </div>
              } @else {
                <div class="form-group">
                  <label>{{ 'select_parent' | translate }}</label>
                  <select [(ngModel)]="formData.parentId">
                    <option value="">-- {{ ts.t('select_parent') }} --</option>
                    @for (parent of parentsList(); track parent.userId) {
                      <option [value]="parent.userId">{{ parent.fullName }} ({{ parent.email }})</option>
                    }
                  </select>
                </div>
              }
            }

            <div class="form-group">
              <label>{{ 'notes' | translate }}</label>
              <textarea [(ngModel)]="formData.notes" rows="3" [placeholder]="ts.t('additional_notes')"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeFormModal()">{{ 'cancel' | translate }}</button>
            <button class="btn-primary" (click)="saveStudent()" [disabled]="saving()">
              @if (saving()) {
                <span class="spinner"></span>
              }
              {{ editingStudent() ? ('save_changes' | translate) : ('add_student_btn' | translate) }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Credentials Modal -->
    @if (showCredentialsModal()) {
      <div class="modal-overlay" (click)="showCredentialsModal.set(false)">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ 'student_created' | translate }}</h2>
            <button class="close-btn" (click)="showCredentialsModal.set(false)">&times;</button>
          </div>
          <div class="modal-body">
            <div class="credentials-card">
              <div class="cred-item">
                <span class="cred-label">{{ 'name' | translate }}</span>
                <span class="cred-value">{{ createdCredentials().studentName }}</span>
              </div>
              @if (createdCredentials().parentName) {
                <div class="cred-item">
                  <span class="cred-label">{{ 'parent_name' | translate }}</span>
                  <span class="cred-value">{{ createdCredentials().parentName }}</span>
                </div>
                <div class="cred-item">
                  <span class="cred-label">{{ 'parent_email' | translate }}</span>
                  <span class="cred-value ltr-text">{{ createdCredentials().parentEmail }}</span>
                </div>
                <div class="cred-item">
                  <span class="cred-label">{{ 'password' | translate }}</span>
                  <span class="cred-value ltr-text">{{ createdCredentials().parentPassword }}</span>
                </div>
              }
              <p class="cred-warning">{{ 'save_credentials_warning' | translate }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-primary" (click)="copyCredentials()">
              {{ copied() ? ('copied' | translate) : ('copy_credentials' | translate) }}
            </button>
            <button class="btn-secondary" (click)="printCredentials()">{{ 'print' | translate }}</button>
          </div>
        </div>
      </div>
    }

    <!-- View Modal -->
    @if (showViewModal()) {
      <div class="modal-overlay" (click)="showViewModal.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ 'student_data' | translate }}</h2>
            <button class="close-btn" (click)="showViewModal.set(false)">&times;</button>
          </div>
          <div class="modal-body">
            @if (viewingStudent(); as student) {
              <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
                <app-avatar [name]="student.fullName" [imageUrl]="student.avatarUrl ?? ''" size="56px" />
                <div>
                  <div style="font-size:18px;font-weight:700;color:var(--heading-color)">{{ student.fullName }}</div>
                  <div style="font-size:13px;color:var(--text-muted)">{{ getDisabilityLabel(student.disabilityType) }}</div>
                </div>
              </div>
              <div class="view-grid">
                <div class="view-item">
                  <span class="view-label">{{ 'name' | translate }}</span>
                  <span class="view-value">{{ student.fullName }}</span>
                </div>
                <div class="view-item">
                  <span class="view-label">{{ 'date_of_birth' | translate }}</span>
                  <span class="view-value">{{ student.dateOfBirth }}</span>
                </div>
                <div class="view-item">
                  <span class="view-label">{{ 'gender' | translate }}</span>
                  <span class="view-value">{{ getGenderLabel(student.gender) }}</span>
                </div>
                <div class="view-item">
                  <span class="view-label">{{ 'disability_type' | translate }}</span>
                  <span class="view-value">{{ getDisabilityLabel(student.disabilityType) }}</span>
                </div>
                <div class="view-item">
                  <span class="view-label">{{ 'parent_guardian' | translate }}</span>
                  <span class="view-value">{{ student.parentName }}</span>
                </div>
                <div class="view-item">
                  <span class="view-label">{{ 'status' | translate }}</span>
                  <span class="badge" [class]="student.isActive ? 'badge-active' : 'badge-inactive'">
                    {{ student.isActive ? ts.t('active') : ts.t('inactive') }}
                  </span>
                </div>
                @if (student.notes) {
                  <div class="view-item full-width">
                    <span class="view-label">{{ 'notes' | translate }}</span>
                    <span class="view-value">{{ student.notes }}</span>
                  </div>
                }
              </div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showViewModal.set(false)">{{ 'close' | translate }}</button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation -->
    @if (showDeleteModal()) {
      <div class="modal-overlay" (click)="showDeleteModal.set(false)">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ 'confirm_delete_title' | translate }}</h2>
            <button class="close-btn" (click)="showDeleteModal.set(false)">&times;</button>
          </div>
          <div class="modal-body">
            <p class="confirm-text">{{ 'confirm_delete_student' | translate }} <strong>{{ deletingStudent()?.fullName }}</strong>؟</p>
            <p class="confirm-warning">{{ 'cannot_undo' | translate }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showDeleteModal.set(false)">{{ 'cancel' | translate }}</button>
            <button class="btn-danger" (click)="confirmDelete()" [disabled]="saving()">
              @if (saving()) {
                <span class="spinner"></span>
              }
              {{ 'delete' | translate }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .page { max-width: 1200px; margin: 0 auto; }

    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
    }

    .page-title { font-size: 28px; font-weight: 700; color: var(--heading-color); }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
      background: var(--primary); color: var(--bg-card); border-radius: var(--radius-md);
      font-size: 14px; font-weight: 600; transition: var(--transition);
    }
    .btn-primary:hover { background: var(--primary-dark); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-secondary {
      padding: 10px 20px; background: var(--off-white); color: var(--text-dark);
      border-radius: var(--radius-md); font-size: 14px; font-weight: 600; transition: var(--transition);
    }
    .btn-secondary:hover { background: var(--border-light); }

    .btn-danger {
      padding: 10px 20px; background: var(--danger); color: var(--bg-card);
      border-radius: var(--radius-md); font-size: 14px; font-weight: 600; transition: var(--transition);
    }
    .btn-danger:hover { background: #a93226; }
    .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

    .filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }

    .search-box {
      display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px;
      padding: 0 16px; background: var(--bg-card); border-radius: var(--radius-md);
      border: 1px solid var(--border); transition: var(--transition);
    }
    .search-box:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent); }
    .search-box svg { color: var(--text-muted); flex-shrink: 0; }
    .search-box input { flex: 1; border: none; padding: 12px 0; font-size: 14px; background: transparent; }

    .filter-select {
      padding: 12px 16px; background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-md); font-size: 14px; color: var(--text-dark);
      cursor: pointer; transition: var(--transition);
    }
    .filter-select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent); }

    .table-wrap {
      background: var(--bg-card); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm); overflow-x: auto;
    }

    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      padding: 16px 20px; text-align: right; font-size: 13px; font-weight: 600;
      color: var(--text-muted); background: var(--off-white); border-bottom: 1px solid var(--border); white-space: nowrap;
    }
    .data-table td { padding: 16px 20px; font-size: 14px; border-bottom: 1px solid var(--off-white); }

    .table-row { transition: var(--transition); animation: fadeIn 0.3s ease both; }
    .table-row:hover { background: color-mix(in srgb, var(--primary) 4%, transparent); }

    .name-cell { font-weight: 600; }
    .name-with-avatar { display: flex; align-items: center; gap: 10px; }

    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-active { background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); }
    .badge-inactive { background: rgba(156,163,175,0.15); color: #6B7280; }

    .actions { display: flex; gap: 8px; }
    .action-btn {
      width: 34px; height: 34px; border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      transition: var(--transition); background: transparent;
    }
    .action-btn.view { color: #3B82F6; }
    .action-btn.view:hover { background: rgba(59,130,246,0.1); }
    .action-btn.edit { color: #F59E0B; }
    .action-btn.edit:hover { background: rgba(245,158,11,0.1); }
    .action-btn.delete { color: #EF4444; }
    .action-btn.delete:hover { background: rgba(239,68,68,0.1); }

    .empty-cell { text-align: center; padding: 48px 20px !important; color: var(--text-muted); }

    .mobile-cards { display: none; }
    .student-card {
      background: var(--bg-card); border-radius: var(--radius-lg); padding: 16px;
      margin-bottom: 12px; box-shadow: var(--shadow-sm); animation: fadeIn 0.3s ease both;
    }
    .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .card-name { font-size: 16px; font-weight: 700; color: var(--text-dark); }
    .card-info { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; font-size: 13px; color: var(--text-muted); }
    .card-actions { display: flex; gap: 8px; border-top: 1px solid var(--off-white); padding-top: 12px; }
    .card-actions .action-btn {
      width: auto; height: auto; padding: 6px 14px; font-size: 13px;
      font-weight: 500; border-radius: var(--radius-sm);
    }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 20px; animation: fadeIn 0.2s ease;
    }
    .modal {
      background: var(--bg-card); border-radius: var(--radius-lg); width: 100%;
      max-width: 600px; max-height: 90vh; overflow-y: auto;
      animation: modalSlide 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .modal-sm { max-width: 440px; }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid var(--off-white);
    }
    .modal-header h2 { font-size: 18px; font-weight: 700; color: var(--heading-color); }
    .close-btn {
      width: 32px; height: 32px; font-size: 20px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%; background: var(--off-white); color: var(--text-muted); transition: var(--transition);
    }
    .close-btn:hover { background: var(--border-light); }
    .modal-body { padding: 24px; }
    .modal-footer {
      display: flex; justify-content: flex-start; gap: 12px;
      padding: 16px 24px; border-top: 1px solid var(--off-white);
    }

    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 6px; }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%; padding: 10px 14px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); font-size: 14px; transition: var(--transition); background: var(--bg-card);
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent);
    }
    .form-group textarea { resize: vertical; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .view-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .view-item.full-width { grid-column: 1 / -1; }
    .view-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
    .view-value { font-size: 15px; font-weight: 600; color: var(--text-dark); }

    .confirm-text { font-size: 15px; color: var(--text-dark); margin-bottom: 8px; }
    .confirm-warning { font-size: 13px; color: var(--danger); }

    .table-skeleton { background: var(--bg-card); border-radius: var(--radius-lg); padding: 20px; }
    .row-skeleton {
      height: 56px; margin-bottom: 8px; border-radius: var(--radius-sm);
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%; animation: shimmer 1.5s infinite;
    }

    .spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
    }
    .empty-state { text-align: center; padding: 48px 20px; color: var(--text-muted); }

    .ltr-text { direction: ltr; unicode-bidi: isolate; }

    .parent-toggle {
      display: flex; gap: 12px; margin: 16px 0; padding: 4px;
      background: var(--off-white); border-radius: var(--radius-md);
    }
    .toggle-option {
      flex: 1; padding: 10px; text-align: center; border-radius: var(--radius-sm);
      font-size: 14px; font-weight: 600; cursor: pointer; transition: var(--transition);
      color: var(--text-muted);
    }
    .toggle-option.active { background: var(--bg-card); color: var(--heading-color); box-shadow: var(--shadow-sm); }
    .toggle-option input { display: none; }

    .section-header {
      font-size: 15px; font-weight: 700; color: var(--heading-color);
      margin: 20px 0 12px; padding-bottom: 8px; border-bottom: 2px solid var(--primary);
    }

    .password-row { display: flex; gap: 8px; }
    .password-row input { flex: 1; }
    .btn-generate {
      padding: 10px 16px; background: var(--primary); color: var(--bg-card);
      border-radius: var(--radius-sm); font-size: 13px; font-weight: 600;
      white-space: nowrap; transition: var(--transition);
    }
    .btn-generate:hover { background: var(--primary-dark); }

    .photo-upload {
      display: flex; align-items: center; gap: 20px; padding: 16px;
      margin-bottom: 20px; background: var(--off-white); border-radius: var(--radius-md);
    }
    .photo-preview {
      width: 96px; height: 96px; border-radius: 50%; overflow: hidden;
      flex-shrink: 0; background: var(--bg-card); border: 2px solid var(--border-light);
      display: flex; align-items: center; justify-content: center;
    }
    .photo-preview img { width: 100%; height: 100%; object-fit: cover; }
    .photo-actions { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
    .photo-btn { cursor: pointer; display: inline-block; }
    .photo-error { font-size: 12px; color: var(--danger); font-weight: 600; }

    .credentials-card {
      background: var(--off-white); border-radius: var(--radius-md); padding: 20px;
    }
    .cred-item { margin-bottom: 12px; }
    .cred-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 2px; }
    .cred-value { font-size: 15px; font-weight: 600; color: var(--text-dark); }
    .cred-warning {
      margin-top: 16px; padding: 10px; background: rgba(239,68,68,0.08);
      border-radius: var(--radius-sm); color: var(--danger); font-size: 13px;
      font-weight: 600; text-align: center;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalSlide {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .page-title { font-size: 22px; }
      .table-wrap { display: none; }
      .mobile-cards { display: block; }
      .form-row { grid-template-columns: 1fr; }
      .view-grid { grid-template-columns: 1fr; }
      .modal { max-width: 100%; }
    }
  `,
})
export class StudentsComponent implements OnInit {
  readonly DisabilityType = DisabilityType;
  readonly Gender = Gender;

  readonly students = signal<Student[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly searchQuery = signal('');
  readonly filterDisability = signal('');
  readonly filterStatus = signal('');

  readonly showFormModal = signal(false);
  readonly showViewModal = signal(false);
  readonly showDeleteModal = signal(false);
  readonly showCredentialsModal = signal(false);
  readonly editingStudent = signal<Student | null>(null);
  readonly viewingStudent = signal<Student | null>(null);
  readonly deletingStudent = signal<Student | null>(null);

  readonly photoError = signal('');
  readonly parentMode = signal<'new' | 'existing'>('new');
  readonly parentsList = signal<{userId: string, fullName: string, email: string}[]>([]);
  readonly createdCredentials = signal<{studentName: string, parentName: string, parentEmail: string, parentPassword: string}>({studentName: '', parentName: '', parentEmail: '', parentPassword: ''});
  readonly copied = signal(false);

  formData = this.getEmptyForm();

  readonly filteredStudents = computed(() => {
    let result = this.students();
    const query = this.searchQuery().trim();
    const disability = this.filterDisability();
    const status = this.filterStatus();

    if (query) result = result.filter(s => s.fullName.includes(query));
    if (disability) result = result.filter(s => s.disabilityType === disability);
    if (status === 'active') result = result.filter(s => s.isActive);
    if (status === 'inactive') result = result.filter(s => !s.isActive);
    return result;
  });

  constructor(
    private readonly adminService: AdminService,
    public readonly ts: TranslationService,
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading.set(true);
    this.adminService.getStudents().subscribe({
      next: (data) => { this.students.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getGenderLabel(gender: Gender): string {
    return gender === Gender.Male ? this.ts.t('male') : this.ts.t('female');
  }

  getDisabilityLabel(type: DisabilityType): string {
    const map: Record<string, string> = {
      [DisabilityType.Autism]: this.ts.t('autism'),
      [DisabilityType.DownSyndrome]: this.ts.t('down_syndrome'),
      [DisabilityType.CerebralPalsy]: this.ts.t('cerebral_palsy'),
      [DisabilityType.IntellectualDisability]: this.ts.t('intellectual_disability'),
      [DisabilityType.ADHD]: this.ts.t('adhd'),
      [DisabilityType.SpeechDelay]: this.ts.t('speech_delay'),
      [DisabilityType.HearingImpairment]: this.ts.t('hearing_impairment'),
      [DisabilityType.VisualImpairment]: this.ts.t('visual_impairment'),
      [DisabilityType.MultipleDisabilities]: this.ts.t('multiple_disabilities'),
      [DisabilityType.Other]: this.ts.t('other'),
    };
    return map[type] ?? type;
  }

  getEmptyForm() {
    return {
      fullName: '',
      dateOfBirth: '',
      gender: Gender.Male as Gender,
      disabilityType: DisabilityType.Autism as DisabilityType,
      parentId: '',
      notes: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      parentPassword: '',
      avatarUrl: '' as string,
    };
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.photoError.set(this.ts.t('invalid_image'));
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.photoError.set(this.ts.t('image_too_large'));
      input.value = '';
      return;
    }

    this.photoError.set('');
    const reader = new FileReader();
    reader.onload = () => {
      this.formData = { ...this.formData, avatarUrl: reader.result as string };
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removePhoto(): void {
    this.formData = { ...this.formData, avatarUrl: '' };
    this.photoError.set('');
  }

  openAddModal(): void {
    this.editingStudent.set(null);
    this.formData = this.getEmptyForm();
    this.parentMode.set('new');
    this.photoError.set('');
    this.loadParents();
    this.showFormModal.set(true);
  }

  loadParents(): void {
    this.adminService.getParents().subscribe({
      next: (data) => this.parentsList.set(data),
      error: () => this.parentsList.set([]),
    });
  }

  generatePassword(): void {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const all = upper + lower + digits;
    const pick = (s: string) => s.charAt(Math.floor(Math.random() * s.length));
    let password = pick(upper) + pick(lower) + pick(digits);
    for (let i = 0; i < 5; i++) {
      password += pick(all);
    }
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    this.formData.parentPassword = password;
  }

  copyCredentials(): void {
    const creds = this.createdCredentials();
    let text = `${this.ts.t('name')}: ${creds.studentName}`;
    if (creds.parentName) {
      text += `\n${this.ts.t('parent_name')}: ${creds.parentName}`;
      text += `\n${this.ts.t('parent_email')}: ${creds.parentEmail}`;
      text += `\n${this.ts.t('password')}: ${creds.parentPassword}`;
    }
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
    html += `<div class="title">${this.ts.t('student_created')}</div>`;
    html += `<div class="item"><div class="label">${this.ts.t('name')}</div><div class="value">${creds.studentName}</div></div>`;
    if (creds.parentName) {
      html += `<div class="item"><div class="label">${this.ts.t('parent_name')}</div><div class="value">${creds.parentName}</div></div>`;
      html += `<div class="item"><div class="label">${this.ts.t('parent_email')}</div><div class="value">${creds.parentEmail}</div></div>`;
      html += `<div class="item"><div class="label">${this.ts.t('password')}</div><div class="value">${creds.parentPassword}</div></div>`;
    }
    html += `<div class="warning">${this.ts.t('save_credentials_warning')}</div>`;
    html += `</body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }

  openEditModal(student: Student): void {
    this.editingStudent.set(student);
    this.formData = {
      fullName: student.fullName,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      disabilityType: student.disabilityType,
      parentId: student.parentId,
      notes: student.notes ?? '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      parentPassword: '',
      avatarUrl: student.avatarUrl ?? '',
    };
    this.photoError.set('');
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
  }

  openViewModal(student: Student): void {
    this.viewingStudent.set(student);
    this.showViewModal.set(true);
  }

  openDeleteConfirm(student: Student): void {
    this.deletingStudent.set(student);
    this.showDeleteModal.set(true);
  }

  saveStudent(): void {
    if (!this.formData.fullName.trim()) return;
    this.saving.set(true);

    const editing = this.editingStudent();
    if (editing) {
      this.adminService.updateStudent(editing.id, {
        fullName: this.formData.fullName,
        dateOfBirth: this.formData.dateOfBirth,
        gender: this.formData.gender,
        disabilityType: this.formData.disabilityType,
        notes: this.formData.notes,
        avatarUrl: this.formData.avatarUrl || undefined,
      } as any).subscribe({
        next: () => { this.saving.set(false); this.closeFormModal(); this.loadStudents(); },
        error: () => this.saving.set(false),
      });
    } else {
      const dto: any = {
        fullName: this.formData.fullName,
        dateOfBirth: this.formData.dateOfBirth,
        gender: this.formData.gender,
        disabilityType: this.formData.disabilityType,
        notes: this.formData.notes,
        avatarUrl: this.formData.avatarUrl || undefined,
      };
      if (this.parentMode() === 'new') {
        dto.parentName = this.formData.parentName;
        dto.parentEmail = this.formData.parentEmail;
        dto.parentPhone = this.formData.parentPhone;
        dto.parentPassword = this.formData.parentPassword;
      } else {
        dto.parentId = this.formData.parentId;
      }
      const isNewParent = this.parentMode() === 'new';
      const savedParentName = this.formData.parentName;
      const savedParentEmail = this.formData.parentEmail;
      const savedParentPassword = this.formData.parentPassword;
      const savedStudentName = this.formData.fullName;

      this.adminService.createStudent(dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeFormModal();
          this.loadStudents();
          this.createdCredentials.set({
            studentName: savedStudentName,
            parentName: isNewParent ? savedParentName : '',
            parentEmail: isNewParent ? savedParentEmail : '',
            parentPassword: isNewParent ? savedParentPassword : '',
          });
          this.showCredentialsModal.set(true);
        },
        error: () => this.saving.set(false),
      });
    }
  }

  confirmDelete(): void {
    const student = this.deletingStudent();
    if (!student) return;
    this.saving.set(true);

    this.adminService.deleteStudent(student.id).subscribe({
      next: () => { this.saving.set(false); this.showDeleteModal.set(false); this.loadStudents(); },
      error: () => this.saving.set(false),
    });
  }
}
