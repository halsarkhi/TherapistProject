export enum DisabilityType {
  Autism = 'Autism',
  DownSyndrome = 'DownSyndrome',
  CerebralPalsy = 'CerebralPalsy',
  IntellectualDisability = 'IntellectualDisability',
  ADHD = 'ADHD',
  SpeechDelay = 'SpeechDelay',
  HearingImpairment = 'HearingImpairment',
  VisualImpairment = 'VisualImpairment',
  MultipleDisabilities = 'MultipleDisabilities',
  Other = 'Other',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export enum Specialization {
  SpeechTherapy = 'SpeechTherapy',
  OccupationalTherapy = 'OccupationalTherapy',
  PhysicalTherapy = 'PhysicalTherapy',
  BehavioralTherapy = 'BehavioralTherapy',
  SpecialEducation = 'SpecialEducation',
  Psychology = 'Psychology',
  SocialWork = 'SocialWork',
}

export enum SessionType {
  Individual = 'Individual',
  Group = 'Group',
  Assessment = 'Assessment',
  Consultation = 'Consultation',
}

export enum SessionStatus {
  Scheduled = 'Scheduled',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  NoShow = 'NoShow',
}

export enum MessageType {
  General = 'General',
  Report = 'Report',
  Alert = 'Alert',
  Broadcast = 'Broadcast',
}

export enum UserRole {
  Admin = 'Admin',
  Therapist = 'Therapist',
  Parent = 'Parent',
}
