import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { UserRole } from '../core/models/enums';
import { TranslatePipe } from '../shared/pipes/translate.pipe';
import { LangSwitcherComponent } from '../shared/components/lang-switcher';
import { TranslationService } from '../core/services/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, LangSwitcherComponent, RouterLink],
  template: `
    <div class="login-page">
      <!-- Language switcher -->
      <div class="lang-switcher-wrapper">
        <app-lang-switcher />
      </div>

      <!-- Back to home -->
      <a routerLink="/" class="back-home-btn">
        <svg class="back-home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        <span>{{ 'back_to_home' | translate }}</span>
      </a>

      <!-- Background decorative elements -->
      <div class="bg-decoration">
        <div class="bg-circle bg-circle--1"></div>
        <div class="bg-circle bg-circle--2"></div>
        <div class="bg-circle bg-circle--3"></div>
        <div class="bg-leaf bg-leaf--1">
          <svg viewBox="0 0 80 80" fill="none">
            <path d="M40 5C40 5 65 20 65 45C65 70 40 75 40 75C40 75 15 70 15 45C15 20 40 5 40 5Z" fill="currentColor" opacity="0.06"/>
          </svg>
        </div>
        <div class="bg-leaf bg-leaf--2">
          <svg viewBox="0 0 80 80" fill="none">
            <path d="M40 5C40 5 65 20 65 45C65 70 40 75 40 75C40 75 15 70 15 45C15 20 40 5 40 5Z" fill="currentColor" opacity="0.04"/>
          </svg>
        </div>
      </div>

      <div class="login-card" [class.login-card--shake]="shakeError()">
        <!-- Logo -->
        <div class="logo-area">
          <div class="logo-icon">
            <img src="logo.png" alt="logo" />
          </div>
        </div>

        <!-- Title -->
        <h1 class="title">{{ 'app_name' | translate }} {{ 'app_subtitle' | translate }}</h1>
        <p class="subtitle">{{ 'login_title' | translate }}</p>

        <!-- Error message -->
        @if (errorMessage()) {
          <div class="error-banner">
            <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <!-- Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form" novalidate>
          <!-- Email field -->
          <div class="form-field" [class.form-field--error]="isFieldInvalid('email')">
            <label for="email" class="form-label">{{ 'email_label' | translate }}</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/>
                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/>
              </svg>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-input"
                placeholder="example@domain.com"
                autocomplete="email"
                dir="ltr"
              />
            </div>
            @if (isFieldInvalid('email')) {
              <span class="field-error">{{ 'email_error' | translate }}</span>
            }
          </div>

          <!-- Password field -->
          <div class="form-field" [class.form-field--error]="isFieldInvalid('password')">
            <label for="password" class="form-label">{{ 'password_label' | translate }}</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd"/>
              </svg>
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                class="form-input"
                placeholder="••••••••"
                autocomplete="current-password"
                dir="ltr"
              />
              <button
                type="button"
                class="toggle-password"
                (click)="showPassword.set(!showPassword())"
                [attr.aria-label]="showPassword() ? ts.t('hide_password') : ts.t('show_password')"
              >
                @if (showPassword()) {
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.092 1.092a4 4 0 00-5.558-5.558z" clip-rule="evenodd"/>
                    <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z"/>
                  </svg>
                } @else {
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>
                    <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                  </svg>
                }
              </button>
            </div>
            @if (isFieldInvalid('password')) {
              <span class="field-error">{{ 'password_error' | translate }}</span>
            }
          </div>

          <!-- Role selector -->
          <div class="form-field">
            <label for="role" class="form-label">{{ 'account_type' | translate }}</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"/>
              </svg>
              <select
                id="role"
                formControlName="role"
                class="form-input form-select"
              >
                <option value="admin">{{ 'admin_role' | translate }}</option>
                <option value="therapist">{{ 'therapist_role' | translate }}</option>
                <option value="parent">{{ 'parent_role' | translate }}</option>
              </select>
              <svg class="select-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            class="submit-btn"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              <span>{{ 'login_loading' | translate }}</span>
            } @else {
              <span>{{ 'login' | translate }}</span>
            }
          </button>
        </form>

        <!-- Footer -->
        <div class="card-footer">
          <p class="footer-text">{{ 'app_name' | translate }} {{ 'app_subtitle' | translate }} &copy; {{ currentYear }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Animations ===== */
    @keyframes cardEntrance {
      from {
        opacity: 0;
        transform: translateY(32px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 50%, 90% { transform: translateX(-6px); }
      30%, 70% { transform: translateX(6px); }
    }

    @keyframes fadeSlideIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(15px, -20px) scale(1.02); }
      66% { transform: translate(-10px, 10px) scale(0.98); }
    }

    @keyframes floatSlow {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(-20px, -15px) rotate(5deg); }
    }

    /* ===== Language Switcher ===== */
    .lang-switcher-wrapper {
      position: absolute;
      top: 20px;
      inset-inline-end: 24px;
      z-index: 2;
    }

    /* ===== Back to home ===== */
    .back-home-btn {
      position: absolute;
      top: 20px;
      inset-inline-start: 24px;
      z-index: 2;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      color: var(--heading-color);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
    }
    .back-home-btn:hover {
      background: var(--primary);
      color: var(--bg-card);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .back-home-btn .back-home-icon { flex-shrink: 0; }

    /* ===== Page Layout ===== */
    .login-page {
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(160deg, var(--off-white) 0%, var(--light-green) 40%, var(--border) 100%);
      transition: background-color 0.3s ease;
    }

    /* ===== Background Decorations ===== */
    .bg-decoration {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    .bg-circle {
      position: absolute;
      border-radius: 50%;
      background: var(--primary);
    }

    .bg-circle--1 {
      width: 400px;
      height: 400px;
      top: -120px;
      left: -80px;
      opacity: 0.04;
      animation: float 20s ease-in-out infinite;
    }

    .bg-circle--2 {
      width: 300px;
      height: 300px;
      bottom: -80px;
      right: -60px;
      opacity: 0.05;
      animation: float 25s ease-in-out infinite reverse;
    }

    .bg-circle--3 {
      width: 180px;
      height: 180px;
      top: 50%;
      left: 70%;
      opacity: 0.03;
      animation: float 18s ease-in-out infinite 5s;
    }

    .bg-leaf {
      position: absolute;
      color: var(--heading-color);
    }

    .bg-leaf--1 {
      width: 200px;
      height: 200px;
      top: 10%;
      right: 5%;
      animation: floatSlow 30s ease-in-out infinite;
    }

    .bg-leaf--2 {
      width: 160px;
      height: 160px;
      bottom: 10%;
      left: 8%;
      animation: floatSlow 25s ease-in-out infinite reverse;
    }

    /* ===== Login Card ===== */
    .login-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      background: var(--white);
      border-radius: var(--radius-xl);
      padding: 40px 36px 32px;
      box-shadow: var(--shadow-lg), 0 0 0 1px color-mix(in srgb, var(--primary) 6%, transparent);
      animation: cardEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .login-card--shake {
      animation: shake 0.5s ease-in-out;
    }

    /* ===== Logo ===== */
    .logo-area {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .logo-icon {
      width: 96px;
      height: 96px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* ===== Typography ===== */
    .title {
      font-family: var(--font-family);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--heading-color);
      text-align: center;
      line-height: 1.6;
      margin-bottom: 4px;
    }

    .subtitle {
      font-family: var(--font-family);
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 28px;
    }

    /* ===== Error Banner ===== */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--error-light);
      border: 1px solid rgba(192, 57, 43, 0.15);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      margin-bottom: 20px;
      color: var(--error);
      font-size: 0.85rem;
      font-weight: 500;
      animation: fadeSlideIn 0.3s ease-out;
    }

    .error-icon {
      flex-shrink: 0;
    }

    /* ===== Form ===== */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-dark);
      padding-inline-start: 2px;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      inset-inline-start: 14px;
      color: var(--text-muted);
      flex-shrink: 0;
      pointer-events: none;
      transition: color 0.2s ease;
      z-index: 1;
    }

    .form-input {
      width: 100%;
      height: 48px;
      padding: 0 14px 0 14px;
      padding-inline-start: 42px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      font-family: var(--font-family);
      font-size: 0.9rem;
      color: var(--text-dark);
      background: var(--off-white);
      outline: none;
      transition: all 0.25s ease;
      -webkit-appearance: none;
      appearance: none;
    }

    .form-input::placeholder {
      color: var(--text-muted);
      font-family: var(--font-family);
    }

    .form-input:hover {
      border-color: var(--primary-light);
    }

    .form-input:focus {
      border-color: var(--primary);
      background: var(--white);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent);
    }

    .form-input:focus ~ .input-icon,
    .input-wrapper:focus-within .input-icon {
      color: var(--primary);
    }

    /* Select specific */
    .form-select {
      cursor: pointer;
      padding-inline-end: 40px;
    }

    .select-arrow {
      position: absolute;
      inset-inline-end: 14px;
      color: var(--text-muted);
      pointer-events: none;
      transition: color 0.2s ease;
    }

    /* Password toggle */
    .toggle-password {
      position: absolute;
      inset-inline-end: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toggle-password:hover {
      background: color-mix(in srgb, var(--primary) 8%, transparent);
      color: var(--primary);
    }

    /* Field error state */
    .form-field--error .form-input {
      border-color: var(--error);
      background: var(--error-light);
    }

    .form-field--error .form-input:focus {
      box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.1);
    }

    .form-field--error .input-icon {
      color: var(--error);
    }

    .field-error {
      font-size: 0.78rem;
      color: var(--error);
      font-weight: 500;
      padding-inline-start: 2px;
      animation: fadeSlideIn 0.2s ease-out;
    }

    /* ===== Submit Button ===== */
    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: 50px;
      margin-top: 6px;
      border: none;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: var(--white);
      font-family: var(--font-family);
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-dark) 20%, transparent);
      position: relative;
      overflow: hidden;
    }

    .submit-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px color-mix(in srgb, var(--primary-dark) 28%, transparent);
    }

    .submit-btn:hover:not(:disabled)::before {
      opacity: 1;
    }

    .submit-btn:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px color-mix(in srgb, var(--primary-dark) 20%, transparent);
    }

    .submit-btn:disabled {
      opacity: 0.75;
      cursor: not-allowed;
    }

    /* Spinner */
    .spinner {
      width: 20px;
      height: 20px;
      border: 2.5px solid rgba(255, 255, 255, 0.3);
      border-top-color: var(--white);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* ===== Footer ===== */
    .card-footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--border-light);
    }

    .footer-text {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: center;
      font-weight: 400;
    }

    /* ===== Responsive ===== */
    @media (max-width: 480px) {
      .login-page {
        padding: 16px;
        align-items: flex-start;
        padding-top: 40px;
      }

      .login-card {
        padding: 28px 20px 24px;
        border-radius: var(--radius-lg);
      }

      .logo-icon {
        width: 76px;
        height: 76px;
      }

      .title {
        font-size: 1.1rem;
      }

      .form-input {
        height: 44px;
        font-size: 0.85rem;
      }

      .submit-btn {
        height: 46px;
        font-size: 0.95rem;
      }

      .lang-switcher-wrapper {
        top: 12px;
        inset-inline-end: 16px;
      }
    }

    @media (max-width: 360px) {
      .login-card {
        padding: 24px 16px 20px;
      }
    }
  `]
})
export class LoginComponent {
  readonly ts = inject(TranslationService);
  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly shakeError = signal(false);
  readonly currentYear = new Date().getFullYear();

  readonly loginForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      role: ['therapist' as UserRole],
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    // Mark all fields as touched for validation display
    Object.values(this.loginForm.controls).forEach(c => c.markAsTouched());

    if (this.loginForm.invalid) {
      this.triggerShake();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;
    this.authService.login({ email, password }).subscribe({
      next: () => {
        const userRole = this.authService.getUserRole();
        const redirectUrl = this.authService.getRedirectUrl(userRole);
        this.router.navigateByUrl(redirectUrl);
      },
      error: (err) => {
        const message = err?.error?.message || this.ts.t('login_error');
        this.errorMessage.set(message);
        this.triggerShake();
        this.isLoading.set(false);
      },
    });
  }

  private triggerShake(): void {
    this.shakeError.set(true);
    setTimeout(() => this.shakeError.set(false), 500);
  }
}
