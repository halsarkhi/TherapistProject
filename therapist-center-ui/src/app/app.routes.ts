import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/enums';

export const routes: Routes = [
  // Landing / Public routes (wrapped in landing layout with header/footer)
  {
    path: '',
    loadComponent: () =>
      import('./landing/landing-layout').then((m) => m.LandingLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./landing/pages/home').then((m) => m.HomeComponent),
      },
      {
        path: 'vision',
        loadComponent: () =>
          import('./landing/pages/vision').then((m) => m.VisionComponent),
      },
      {
        path: 'programs',
        loadComponent: () =>
          import('./landing/pages/programs').then((m) => m.ProgramsComponent),
      },
      {
        path: 'admissions',
        loadComponent: () =>
          import('./landing/pages/admissions').then((m) => m.AdmissionsComponent),
      },
      {
        path: 'facilities',
        loadComponent: () =>
          import('./landing/pages/facilities').then((m) => m.FacilitiesComponent),
      },
      {
        path: 'gallery',
        loadComponent: () =>
          import('./landing/pages/gallery').then((m) => m.GalleryComponent),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./landing/pages/contact').then((m) => m.ContactComponent),
      },
    ],
  },

  // Auth
  {
    path: 'login',
    loadComponent: () => import('./auth/login').then((m) => m.LoginComponent),
  },

  // Therapist portal
  {
    path: 'therapist',
    loadComponent: () =>
      import('./therapist/components/layout/therapist-layout').then((m) => m.TherapistLayout),
    canActivate: [authGuard, roleGuard],
    data: { role: UserRole.Therapist },
    children: [
      { path: '', redirectTo: 'sessions', pathMatch: 'full' },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./therapist/pages/sessions/therapist-sessions-page').then(
            (m) => m.TherapistSessionsPage,
          ),
      },
      {
        path: 'broadcast',
        loadComponent: () =>
          import('./therapist/pages/broadcast/broadcast-page').then((m) => m.BroadcastPage),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./therapist/pages/messages/therapist-messages-page').then((m) => m.TherapistMessagesPage),
      },
      {
        path: 'assessments',
        loadComponent: () =>
          import('./therapist/pages/assessments/assessments-hub/assessments-hub').then(
            (m) => m.AssessmentsHubPage,
          ),
      },
      {
        path: 'assessments/speech',
        loadComponent: () =>
          import('./therapist/pages/assessments/speech/speech-assessment').then(
            (m) => m.SpeechAssessmentPage,
          ),
      },
      {
        path: 'assessments/physiotherapy',
        loadComponent: () =>
          import('./therapist/pages/assessments/physiotherapy/physio-assessment').then(
            (m) => m.PhysioAssessmentPage,
          ),
      },
      {
        path: 'assessments/occupational',
        loadComponent: () =>
          import('./therapist/pages/assessments/occupational/ot-assessment').then(
            (m) => m.OTAssessmentPage,
          ),
      },
      {
        path: 'assessments/psychological',
        loadComponent: () =>
          import('./therapist/pages/assessments/psychological/psych-assessment').then(
            (m) => m.PsychAssessmentPage,
          ),
      },
      {
        path: 'assessments/social',
        loadComponent: () =>
          import('./therapist/pages/assessments/social/social-assessment').then(
            (m) => m.SocialAssessmentPage,
          ),
      },
      {
        path: 'assessments/nurse-log',
        loadComponent: () =>
          import('./therapist/pages/assessments/nurse-log/nurse-log-page').then(
            (m) => m.NurseLogPage,
          ),
      },
      {
        path: 'assessments/monthly',
        loadComponent: () =>
          import('./therapist/pages/assessments/monthly/monthly-report-page').then(
            (m) => m.MonthlyReportPage,
          ),
      },
    ],
  },

  // Parent portal
  {
    path: 'parent',
    loadComponent: () =>
      import('./parent/components/layout/parent-layout').then((m) => m.ParentLayout),
    canActivate: [authGuard, roleGuard],
    data: { role: UserRole.Parent },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./parent/pages/dashboard/parent-dashboard-page').then(
            (m) => m.ParentDashboardPage,
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./parent/pages/messages/parent-messages-page').then((m) => m.ParentMessagesPage),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./parent/pages/schedule/schedule-page').then((m) => m.SchedulePage),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./parent/pages/reports/reports-page').then((m) => m.ReportsPage),
      },
    ],
  },

  // Admin portal
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin-layout').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: UserRole.Admin },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/pages/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./admin/pages/students').then((m) => m.StudentsComponent),
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./admin/pages/staff').then((m) => m.StaffComponent),
      },
      {
        path: 'schedules',
        loadComponent: () =>
          import('./admin/pages/schedules').then((m) => m.SchedulesComponent),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./admin/pages/messages').then((m) => m.MessagesComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./admin/pages/settings').then((m) => m.SettingsComponent),
      },
    ],
  },

  // Wildcard
  { path: '**', redirectTo: '' },
];
