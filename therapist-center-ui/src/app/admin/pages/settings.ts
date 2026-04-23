import { Component } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="page">
      <h1 class="page-title">{{ 'settings' | translate }}</h1>

      <div class="settings-grid">
        <!-- Center Info -->
        <section class="card">
          <div class="card-header">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h2 class="card-title">{{ 'center_info' | translate }}</h2>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">{{ 'center_name_label' | translate }}</span>
              <span class="info-value">{{ 'center_name_value' | translate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ 'email' | translate }}</span>
              <span class="info-value ltr">center.hemmhr&#64;gmail.com</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ 'phone' | translate }}</span>
              <span class="info-value ltr">+966 50 123 4567</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ 'address' | translate }}</span>
              <span class="info-value">{{ 'address_value' | translate }}</span>
            </div>
          </div>
        </section>

        <!-- Working Hours -->
        <section class="card">
          <div class="card-header">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h2 class="card-title">{{ 'working_hours' | translate }}</h2>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">{{ 'working_hours_days' | translate }}</span>
              <span class="info-value ltr">8:00 AM - 4:00 PM</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ 'friday_saturday' | translate }}</span>
              <span class="info-value closed">{{ 'closed_label' | translate }}</span>
            </div>
          </div>
        </section>

        <!-- System Info -->
        <section class="card">
          <div class="card-header">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <h2 class="card-title">{{ 'system_info' | translate }}</h2>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">{{ 'system_version' | translate }}</span>
              <span class="info-value ltr">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ 'last_update' | translate }}</span>
              <span class="info-value">{{ 'last_update_value' | translate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ 'language' | translate }}</span>
              <span class="info-value">{{ 'language_value' | translate }}</span>
            </div>
          </div>
        </section>

        <!-- Notifications -->
        <section class="card">
          <div class="card-header">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <h2 class="card-title">{{ 'notifications' | translate }}</h2>
          </div>
          <div class="info-list">
            <div class="toggle-item">
              <span class="info-label">{{ 'email_notifications' | translate }}</span>
              <div class="toggle active">
                <div class="toggle-knob"></div>
              </div>
            </div>
            <div class="toggle-item">
              <span class="info-label">{{ 'message_notifications' | translate }}</span>
              <div class="toggle active">
                <div class="toggle-knob"></div>
              </div>
            </div>
            <div class="toggle-item">
              <span class="info-label">{{ 'session_notifications' | translate }}</span>
              <div class="toggle">
                <div class="toggle-knob"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: `
    .page { max-width: 1000px; margin: 0 auto; }

    .page-title {
      font-size: 28px; font-weight: 700; color: var(--heading-color); margin-bottom: 28px;
    }

    .settings-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
    }

    .card {
      background: var(--bg-card); border-radius: var(--radius-lg); padding: 24px;
      box-shadow: var(--shadow-sm); animation: slideUp 0.3s ease both;
    }

    .card:nth-child(1) { animation-delay: 0s; }
    .card:nth-child(2) { animation-delay: 0.05s; }
    .card:nth-child(3) { animation-delay: 0.1s; }
    .card:nth-child(4) { animation-delay: 0.15s; }

    .card-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
      padding-bottom: 16px; border-bottom: 1px solid var(--off-white);
    }

    .card-icon {
      width: 44px; height: 44px; border-radius: var(--radius-md);
      background: color-mix(in srgb, var(--primary) 10%, transparent); color: var(--primary);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .card-title { font-size: 17px; font-weight: 700; color: var(--heading-color); }

    .info-list { display: flex; flex-direction: column; gap: 14px; }

    .info-item { display: flex; justify-content: space-between; align-items: center; gap: 12px; }

    .info-label { font-size: 14px; color: var(--text-muted); }
    .info-value { font-size: 14px; font-weight: 600; color: var(--text-dark); }
    .info-value.ltr { direction: ltr; unicode-bidi: isolate; }
    .info-value.closed { color: var(--error); }

    .toggle-item {
      display: flex; justify-content: space-between; align-items: center;
    }

    .toggle {
      width: 44px; height: 24px; border-radius: 12px; background: #d1d5db;
      position: relative; cursor: pointer; transition: var(--transition);
    }
    .toggle.active { background: var(--primary); }

    .toggle-knob {
      width: 20px; height: 20px; border-radius: 50%; background: var(--bg-card);
      position: absolute; top: 2px; right: 2px; transition: var(--transition);
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .toggle.active .toggle-knob { right: 22px; }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .page-title { font-size: 22px; }
      .settings-grid { grid-template-columns: 1fr; }
    }
  `,
})
export class SettingsComponent {}
