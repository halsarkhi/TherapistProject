import { UserRole } from './enums';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  expiresAt: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}
