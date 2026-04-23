import { Gender, Specialization } from './enums';

export interface Staff {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  specialization: Specialization;
  qualifications?: string;
  yearsOfExperience: number;
  isActive: boolean;
  avatarUrl?: string;
  employeeNumber?: string;
  mobilePhone?: string;
  photoUrl?: string;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffDto {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  gender: Gender;
  specialization: Specialization;
  qualifications?: string;
  yearsOfExperience: number;
  employeeNumber?: string;
  mobilePhone?: string;
  photoUrl?: string;
}

export interface UpdateStaffDto {
  fullName?: string;
  phone?: string;
  specialization?: Specialization;
  qualifications?: string;
  yearsOfExperience?: number;
  isActive?: boolean;
  employeeNumber?: string;
  mobilePhone?: string;
  photoUrl?: string;
}
