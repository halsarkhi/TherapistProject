import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { AuthResponse, LoginDto, RegisterDto } from '../models/auth.model';
import { UserRole } from '../models/enums';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

interface JwtPayload {
  sub: string;
  fullName?: string;
  name?: string;
  email: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  role?: string;
  exp: number;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/auth`;
  private readonly tokenKey = 'auth_token';

  private readonly _isLoggedIn = signal<boolean>(this.checkLoggedIn());
  readonly isAuthenticated = this._isLoggedIn.asReadonly();
  readonly user = computed(() => {
    if (!this._isLoggedIn()) return null;
    const payload = this.getPayload();
    if (!payload) return null;
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload.role ?? '';
    const name = payload.fullName ?? payload.name ?? '';
    return { id: payload.sub, name, email: payload.email, role: role as UserRole };
  });

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, dto).pipe(
      map((response) => response.data),
      tap((data) => {
        this.setToken(data.token);
        this._isLoggedIn.set(true);
      }),
    );
  }

  register(dto: RegisterDto): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/register`, dto).pipe(
      map((response) => response.data),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this._isLoggedIn();
  }

  getUserRole(): UserRole | null {
    const payload = this.getPayload();
    if (!payload) return null;
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload.role ?? null;
    return role as UserRole | null;
  }

  getUserName(): string | null {
    const payload = this.getPayload();
    return payload?.fullName ?? payload?.name ?? null;
  }

  getUserId(): string | null {
    const payload = this.getPayload();
    return payload?.sub ?? null;
  }

  getUserEmail(): string | null {
    const payload = this.getPayload();
    return payload?.email ?? null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === UserRole.Admin;
  }

  isTherapist(): boolean {
    return this.getUserRole() === UserRole.Therapist;
  }

  isParent(): boolean {
    return this.getUserRole() === UserRole.Parent;
  }

  getRedirectUrl(role: UserRole | null): string {
    switch (role) {
      case UserRole.Admin:
        return '/admin/dashboard';
      case UserRole.Therapist:
        return '/therapist/sessions';
      case UserRole.Parent:
        return '/parent/dashboard';
      default:
        return '/home';
    }
  }

  private checkLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = this.decodeToken(token);
    if (!payload) return false;
    return payload.exp * 1000 > Date.now();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private getPayload(): JwtPayload | null {
    const token = this.getToken();
    return token ? this.decodeToken(token) : null;
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      const payload = new TextDecoder('utf-8').decode(bytes);
      return JSON.parse(payload) as JwtPayload;
    } catch {
      return null;
    }
  }
}
