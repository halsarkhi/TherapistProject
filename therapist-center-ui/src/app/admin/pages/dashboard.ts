import { Component, OnInit, signal } from '@angular/core';
import { AdminService, AdminDashboardStats, RecentActivityItem } from '../services/admin.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="dashboard">
      <h1 class="page-title">{{ 'dashboard' | translate }}</h1>

      <!-- Stat Cards -->
      <div class="stats-grid">
        @if (loading()) {
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="stat-card skeleton">
              <div class="skeleton-icon"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-number"></div>
            </div>
          }
        } @else {
          <div class="stat-card">
            <div class="stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span class="stat-label">{{ 'total_students' | translate }}</span>
            <span class="stat-value">{{ stats()?.totalStudents ?? 0 }}</span>
          </div>

          <div class="stat-card">
            <div class="stat-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <span class="stat-label">{{ 'total_staff' | translate }}</span>
            <span class="stat-value">{{ stats()?.totalStaff ?? 0 }}</span>
          </div>

          <div class="stat-card">
            <div class="stat-icon orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span class="stat-label">{{ 'active_sessions' | translate }}</span>
            <span class="stat-value">{{ stats()?.activeSessions ?? 0 }}</span>
          </div>

          <div class="stat-card">
            <div class="stat-icon red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span class="stat-label">{{ 'unread_messages' | translate }}</span>
            <span class="stat-value">{{ stats()?.unreadMessages ?? 0 }}</span>
          </div>
        }
      </div>

      <div class="dashboard-grid">
        <!-- Disability Distribution -->
        <section class="card distribution-card">
          <h2 class="card-title">{{ 'disability_distribution' | translate }}</h2>
          @if (loading()) {
            <div class="chart-skeleton">
              @for (i of [1, 2, 3, 4]; track i) {
                <div class="bar-skeleton"></div>
              }
            </div>
          } @else {
            <div class="chart">
              @for (item of stats()?.disabilityDistribution ?? []; track item.type) {
                <div class="chart-row">
                  <span class="chart-label">{{ item.label }}</span>
                  <div class="chart-bar-wrap">
                    <div
                      class="chart-bar"
                      [style.width.%]="getBarWidth(item.count)"
                      [style.animation-delay]="getBarDelay($index)"
                    ></div>
                  </div>
                  <span class="chart-count">{{ item.count }} {{ 'student_count' | translate }}</span>
                </div>
              }
            </div>
          }
        </section>

        <!-- Recent Activity -->
        <section class="card activity-card">
          <h2 class="card-title">{{ 'recent_activity' | translate }}</h2>
          @if (activitiesLoading()) {
            <div class="activity-skeleton">
              @for (i of [1, 2, 3, 4]; track i) {
                <div class="activity-skeleton-item"></div>
              }
            </div>
          } @else if (error()) {
            <div class="error-state">
              <p>{{ 'error_loading_data' | translate }}</p>
              <button class="retry-btn" (click)="loadData()">{{ 'retry' | translate }}</button>
            </div>
          } @else {
            <div class="activity-list">
              @for (activity of activities(); track activity.id) {
                <div class="activity-item">
                  <div class="activity-icon type-default">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div class="activity-content">
                    <p class="activity-desc">{{ activity.description }}</p>
                    <span class="activity-person">{{ activity.personName }}</span>
                  </div>
                  <span class="activity-time">{{ activity.timeAgo }}</span>
                </div>
              }
              @empty {
                <p class="empty-state">{{ 'no_recent_activity' | translate }}</p>
              }
            </div>
          }
        </section>
      </div>
    </div>
  `,
  styles: `
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--heading-color);
      margin-bottom: 28px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--bg-card);
      transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: var(--transition);
      animation: slideUp 0.4s ease both;
    }

    .stat-card:nth-child(1) { animation-delay: 0s; }
    .stat-card:nth-child(2) { animation-delay: 0.05s; }
    .stat-card:nth-child(3) { animation-delay: 0.1s; }
    .stat-card:nth-child(4) { animation-delay: 0.15s; }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
    }

    .stat-icon svg { width: 24px; height: 24px; }

    .stat-icon.green { background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); }
    .stat-icon.blue { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
    .stat-icon.orange { background: rgba(245, 158, 11, 0.12); color: #F59E0B; }
    .stat-icon.red { background: rgba(239, 68, 68, 0.12); color: #EF4444; }

    .stat-label {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-dark);
      line-height: 1;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }

    .card-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--heading-color);
      margin-bottom: 20px;
    }

    .chart {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .chart-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .chart-label {
      width: 110px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-dark);
      flex-shrink: 0;
      text-align: start;
    }

    .chart-bar-wrap {
      flex: 1;
      height: 28px;
      background: var(--off-white);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .chart-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--primary-light));
      border-radius: var(--radius-sm);
      animation: growBar 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
      min-width: 4px;
    }

    .chart-count {
      font-size: 13px;
      color: var(--text-muted);
      white-space: nowrap;
      min-width: 60px;
      text-align: end;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid var(--off-white);
      animation: slideUp 0.3s ease both;
    }

    .activity-item:last-child { border-bottom: none; }

    .activity-item:nth-child(1) { animation-delay: 0.1s; }
    .activity-item:nth-child(2) { animation-delay: 0.15s; }
    .activity-item:nth-child(3) { animation-delay: 0.2s; }
    .activity-item:nth-child(4) { animation-delay: 0.25s; }
    .activity-item:nth-child(5) { animation-delay: 0.3s; }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-icon svg { width: 18px; height: 18px; }

    .activity-icon.type-default { background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-desc {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-dark);
      margin-bottom: 2px;
    }

    .activity-person {
      font-size: 13px;
      color: var(--text-muted);
    }

    .activity-time {
      font-size: 12px;
      color: var(--text-muted);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .skeleton { pointer-events: none; }

    .skeleton-icon, .skeleton-text, .skeleton-number {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-sm);
    }
    .skeleton-icon { width: 48px; height: 48px; }
    .skeleton-text { width: 100px; height: 16px; }
    .skeleton-number { width: 60px; height: 32px; }

    .chart-skeleton, .activity-skeleton {
      display: flex; flex-direction: column; gap: 16px;
    }

    .bar-skeleton, .activity-skeleton-item {
      height: 28px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-sm);
    }
    .activity-skeleton-item { height: 56px; }

    .error-state { text-align: center; padding: 32px; color: var(--text-muted); }

    .retry-btn {
      margin-top: 12px; padding: 8px 20px; background: var(--primary);
      color: var(--bg-card); border-radius: var(--radius-sm); font-size: 14px;
      font-weight: 600; transition: var(--transition);
    }
    .retry-btn:hover { background: var(--primary-dark); }

    .empty-state { text-align: center; padding: 32px; color: var(--text-muted); font-size: 14px; }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes growBar { from { width: 0 !important; } }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 768px) {
      .page-title { font-size: 22px; }
      .stats-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
      .stat-card { padding: 16px; }
      .stat-value { font-size: 24px; }
      .dashboard-grid { grid-template-columns: 1fr; }
      .chart-row { flex-wrap: wrap; }
      .chart-label { width: 100%; }
    }

    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: 1fr; }
    }
  `,
})
export class DashboardComponent implements OnInit {
  readonly stats = signal<AdminDashboardStats | null>(null);
  readonly activities = signal<RecentActivityItem[]>([]);
  readonly loading = signal(true);
  readonly activitiesLoading = signal(true);
  readonly error = signal(false);

  constructor(
    private readonly adminService: AdminService,
    private readonly ts: TranslationService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.activitiesLoading.set(true);
    this.error.set(false);

    this.adminService.getDashboardStats().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set(true); },
    });

    this.adminService.getRecentActivity().subscribe({
      next: (data) => { this.activities.set(data); this.activitiesLoading.set(false); },
      error: () => { this.activitiesLoading.set(false); this.error.set(true); },
    });
  }

  getBarWidth(count: number): number {
    const max = Math.max(...(this.stats()?.disabilityDistribution?.map(d => d.count) ?? [1]));
    return (count / max) * 100;
  }

  getBarDelay(index: number): string {
    return `${index * 0.1}s`;
  }

}
