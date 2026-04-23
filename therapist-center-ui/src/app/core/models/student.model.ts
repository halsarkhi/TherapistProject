import { DisabilityType, Gender } from './enums';

export interface Student {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  disabilityType: DisabilityType;
  disabilityDetails?: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  enrollmentDate: string;
  isActive: boolean;
  notes?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDto {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  disabilityType: DisabilityType;
  disabilityDetails?: string;
  parentId?: string;
  notes?: string;
  avatarUrl?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  parentPassword?: string;
}

export interface UpdateStudentDto {
  fullName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  disabilityType?: DisabilityType;
  disabilityDetails?: string;
  isActive?: boolean;
  notes?: string;
  avatarUrl?: string;
}
