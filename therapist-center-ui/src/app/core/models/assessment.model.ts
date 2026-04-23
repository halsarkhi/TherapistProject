/**
 * Assessment domain models.
 *
 * The assessment module covers seven specialized evaluation/report types used by
 * the day care center: speech, physiotherapy, occupational therapy, psychology,
 * social work, daily nurse log, and the unified monthly report.
 *
 * Each report shares a common header (student, evaluator, date) plus a typed
 * payload specific to the discipline.
 */

export enum AssessmentType {
  Speech = 'Speech',
  Physiotherapy = 'Physiotherapy',
  Occupational = 'Occupational',
  Psychological = 'Psychological',
  Social = 'Social',
  NurseDaily = 'NurseDaily',
  Monthly = 'Monthly',
}

export enum AssessmentStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Reviewed = 'Reviewed',
}

export enum AchievementLevel {
  Mastered = 'Mastered',
  Partial = 'Partial',
  NotMastered = 'NotMastered',
}

/** ------------- Speech Therapy ------------- */

export enum ArticulationError {
  None = 'None',
  Substitution = 'Substitution',
  Omission = 'Omission',
  Distortion = 'Distortion',
  Addition = 'Addition',
}

export interface ArticulationLetter {
  letter: string;
  beginning: ArticulationError;
  middle: ArticulationError;
  end: ArticulationError;
  notes?: string;
}

export interface SpeechOrgansCheck {
  lipsNormal: boolean;
  lipsNotes?: string;
  tongueNormal: boolean;
  tongueNotes?: string;
  teethNormal: boolean;
  teethNotes?: string;
  palateNormal: boolean;
  palateNotes?: string;
  breathingExercises?: string;
}

/** New detailed organs check item used by the verbatim speech form. */
export interface SpeechOrganItem {
  group: string;
  key: string;
  label: string;
  normal: boolean | null;
  notes?: string;
}

export interface ReceptiveExpressiveItem {
  category: string;
  receptive: boolean;
  expressive: boolean;
  notes?: string;
}

/** Vocabulary word-level item (receptive + expressive). */
export interface VocabularyItem {
  group: string;
  word: string;
  receptive: boolean;
  expressive: boolean;
  notes?: string;
}

/** Generic yes/no + notes item used for cognitive/perception sections. */
export interface YesNoItem {
  group: string;
  key: string;
  label: string;
  known: boolean | null;
  notes?: string;
}

/** Grammar item with receptive + expressive assessment. */
export interface GrammarItem {
  group: string;
  key: string;
  label: string;
  receptive: boolean;
  expressive: boolean;
  notes?: string;
}

/** Dialogue question + free-text response. */
export interface DialogueItem {
  question: string;
  response?: string;
  notes?: string;
}

export interface SpeechAssessmentData {
  articulation: ArticulationLetter[];
  organs: SpeechOrgansCheck;
  receptiveExpressive: ReceptiveExpressiveItem[];
  generalNotes?: string;
  recommendations?: string;
  // New optional fields for verbatim PDF form:
  organItems?: SpeechOrganItem[];
  vocabulary?: VocabularyItem[];
  cognitive?: YesNoItem[];
  grammar?: GrammarItem[];
  dialogue?: DialogueItem[];
  perception?: YesNoItem[];
}

/** ------------- Physiotherapy ------------- */

/** Legacy simple ROM row (kept for backwards compatibility with older records) */
export interface RangeOfMotion {
  joint: string;
  side: 'Right' | 'Left' | 'Both';
  active: number;
  passive: number;
  notes?: string;
}

/** Legacy simple MMT row (kept for backwards compatibility with older records) */
export interface ManualMuscleTest {
  muscle: string;
  side: 'Right' | 'Left';
  /** 0-5 MRC scale */
  grade: number;
  notes?: string;
}

/** Legacy simple gait summary (kept for backwards compatibility with older records) */
export interface GaitAnalysis {
  posture: string;
  gaitPattern: string;
  balanceStanding: 'Good' | 'Fair' | 'Poor';
  balanceWalking: 'Good' | 'Fair' | 'Poor';
  assistiveDevice?: string;
  notes?: string;
}

export interface PhysioHeader {
  name: string;
  date: string;
  age: string;
  gender: 'M' | 'F' | '';
  ipOp: 'IP' | 'OP' | '';
  occupation: string;
  referredBy: string;
  address: string;
  phone: string;
  registrationNumber: string;
  civilStatus: string;
  diagnosis: string;
}

export interface PhysioSubjective {
  chiefComplaints: string;
  pastMedicalHistory: string;
  personalHistory: string;
  familyHistory: string;
  socioeconomicHistory: string;
  symptomsHistory: string;
  symptoms: {
    side: string;
    site: string;
    onset: string;
    duration: string;
    type: string;
    severity: string;
  };
  aggravatingFactors: string;
  relievingFactors: string;
}

export interface PhysioVitalSigns {
  temperature: string;
  heartRate: string;
  bloodPressure: string;
  respiratoryRate: string;
}

export interface PhysioObservation {
  built: string;
  wasting: string;
  oedema: string;
  bandagesScars: string;
  attitudeOfLimbs: string;
  typeOfGait: string;
  bonyContours: string;
  deformities: string;
  painScore: number;
  vitals: PhysioVitalSigns;
  bodyChartNotes: string;
}

export interface PhysioPalpation {
  tenderness: string;
  tissueTension: string;
  spasm: string;
  typeOfSkin: string;
  scar: string;
  swelling: string;
  crepitus: string;
}

export interface PhysioRomBilateralRow {
  joint: string;
  movement: string;
  activeRt: string;
  activeLt: string;
  passiveRt: string;
  passiveLt: string;
  endFeel: string;
  limitation: string;
}

export interface PhysioRomSpineRow {
  joint: string;
  movement: string;
  active: string;
  passive: string;
  endFeel: string;
  limitation: string;
}

export interface PhysioMmtRow {
  group: string;
  muscle: string;
  rt: string;
  lt: string;
}

export interface PhysioRiRow {
  muscles: string;
  findings: string;
}

export interface PhysioReflexRow {
  group: 'Superficial' | 'Deep';
  reflex: string;
  left: string;
  right: string;
}

export interface PhysioMeasureRow {
  area: string;
  rt: string;
  lt: string;
}

export interface PhysioLimbLengthRow {
  side: string;
  rt: string;
  lt: string;
}

export interface PhysioSensoryRow {
  group: 'Superficial' | 'Deep' | 'Cortical';
  location: string;
  upperExtRt: string;
  upperExtLt: string;
  lowerExtRt: string;
  lowerExtLt: string;
  trunkRt: string;
  trunkLt: string;
  comments: string;
}

export interface PhysioFimRow {
  index: number;
  item: string;
  score: string;
  comment: string;
}

export interface PhysioGait {
  stancePhase: string;
  baseWidth: string;
  swingPhase: string;
  cadence: string;
  stepLength: string;
  strideLength: string;
  other: string;
}

export interface PhysioBalanceStatic {
  sittingEyesOpen: string;
  sittingEyesClosed: string;
  standingEyesOpen: string;
  standingEyesClosed: string;
  tandemEyesOpen: string;
  tandemEyesClosed: string;
}

export interface PhysioBalanceDynamic {
  reachingActivities: string;
  perturbation: string;
}

export interface PhysioHandFunction {
  reaching: string;
  grasping: string;
  releasing: string;
  assistiveDevices: string;
}

export interface PhysioCoordNonEquilRow {
  test: string;
  rt: string;
  lt: string;
}

export interface PhysioCoordEquilRow {
  test: string;
  grade: string;
}

export interface PhysioSpecialTestRow {
  name: string;
  positive: boolean;
  negative: boolean;
}

export interface PhysioProblemRow {
  impairment: string;
  functionalLimitation: string;
  disability: string;
}

export interface PhysioFooter {
  date: string;
  physiotherapistName: string;
  signature: string;
}

export interface PhysioAssessmentData {
  header: PhysioHeader;
  subjective: PhysioSubjective;
  observation: PhysioObservation;
  palpation: PhysioPalpation;
  romUpper: PhysioRomBilateralRow[];
  romLower: PhysioRomBilateralRow[];
  romSpine: PhysioRomSpineRow[];
  mmtUpper: PhysioMmtRow[];
  mmtLower: PhysioMmtRow[];
  mmtTrunk: PhysioMmtRow[];
  ri: PhysioRiRow[];
  reflexes: PhysioReflexRow[];
  muscleGirth: PhysioMeasureRow[];
  limbLength: PhysioLimbLengthRow[];
  sensory: PhysioSensoryRow[];
  dermatomes: string;
  myotomes: string;
  fim: PhysioFimRow[];
  gait: PhysioGait;
  balanceStatic: PhysioBalanceStatic;
  balanceDynamic: PhysioBalanceDynamic;
  handFunction: PhysioHandFunction;
  coordNonEquil: PhysioCoordNonEquilRow[];
  coordEquil: PhysioCoordEquilRow[];
  specialTests: PhysioSpecialTestRow[];
  investigations: string;
  problemList: PhysioProblemRow[];
  functionalDiagnosis: string;
  shortTermGoals: string;
  longTermGoals: string;
  treatmentPlan: string;
  homeProgramme: string;
  footer: PhysioFooter;
  rom?: RangeOfMotion[];
  mmt?: ManualMuscleTest[];
  generalNotes?: string;
  recommendations?: string;
}

/** ------------- Occupational Therapy ------------- */

export interface MotorSkill {
  skill: string;
  level: AchievementLevel;
  notes?: string;
}

export enum SensoryResponseLevel {
  Hypo = 'Hypo',
  Hyper = 'Hyper',
  Normal = 'Normal',
}

export interface SensoryProcessingItem {
  sense: string;
  level: SensoryResponseLevel;
  notes?: string;
}

export type DominantHand = 'Right' | 'Left';
export type CoordinationLevel = 'Excellent' | 'Good' | 'Weak';

export interface OccupationalAssessmentData {
  dominantHand?: DominantHand;
  nonDominantAssist?: CoordinationLevel;
  visualMotorCoordination?: CoordinationLevel;
  cognitive: MotorSkill[];
  fineMotor: MotorSkill[];
  grossMotor: MotorSkill[];
  sensoryProcessing?: SensoryProcessingItem[];
  sensoryIntegration?: MotorSkill[];
  /** Retained for backwards compatibility; not used by the new form. */
  selfCare?: MotorSkill[];
  behavioralNotes?: string;
  generalNotes?: string;
  recommendations?: string;
}

/** ------------- Psychological (ABC analysis) ------------- */

export enum BehaviorFunction {
  Attention = 'Attention',
  Escape = 'Escape',
  SensoryStimulation = 'SensoryStimulation',
  AccessToTangible = 'AccessToTangible',
  Unknown = 'Unknown',
}

export interface ABCEntry {
  date: string;
  antecedent: string;
  behavior: string;
  consequence: string;
  frequency: number;
  intensity: 'Low' | 'Medium' | 'High';
  function: BehaviorFunction;
}

export interface PsychAssessmentData {
  abcEntries: ABCEntry[];
  reinforcers: string[];
  reductionGoals: string[];
  generalNotes?: string;
}

/** ------------- Social Worker Report ------------- */

export type VaccinationStatus = 'Complete' | 'Incomplete' | 'Unknown';
export type ParentEducation = 'Primary' | 'Middle' | 'Secondary' | 'University' | 'Higher';
export type LivesWith = 'BothParents' | 'Mother' | 'Father' | 'Other';
export type EconomicStatus = 'Affluent' | 'Middle' | 'Limited';

export interface SocialAssessmentData {
  diagnosisHistory: string;
  diagnosisSource: string;
  iqScore?: number;
  vaccinations: string;
  hearingIssues?: string;
  visionIssues?: string;
  seizures?: string;
  familyBackground: string;
  recommendations?: string;

  // --- New optional fields for the extended Social Worker form ---
  // Section 1: Diagnosis & history
  diagnosisDate?: string;
  iqTest?: string;
  diagnosisNotes?: string;

  // Section 2: Medical baseline
  vaccinationStatus?: VaccinationStatus;
  vaccinationDetails?: string;
  hasHearingIssues?: boolean;
  hasVisionIssues?: boolean;
  hasSeizures?: boolean;
  lastSeizureDate?: string;
  seizureMedication?: string;
  hasFoodAllergies?: boolean;
  foodAllergiesDetails?: string;
  previousSurgeries?: string;

  // Section 3: Family background
  siblingOrder?: number;
  siblingCount?: number;
  parentEducation?: ParentEducation;
  livesWith?: LivesWith;
  livesWithOther?: string;
  parentRelation?: string;
  economicStatus?: EconomicStatus;
}

/** ------------- Nurse Daily Log ------------- */

export interface NurseLogEntry {
  id?: string;
  date: string;
  studentId: string;
  studentName?: string;
  /** General current health state notes */
  healthCondition?: string;
  /** Allergies (Y/N + optional details combined) */
  allergies?: string;
  /** Epilepsy (Y/N + optional details combined) */
  epilepsy?: string;
  /** Medical diagnosis (if any) */
  diagnosis?: string;
  medication?: string;
  dose?: string;
  temperature?: number;
  notes?: string;
  /** Set when a follow-up is required (e.g. dose tomorrow) */
  reminderAt?: string;
}

/** ------------- Monthly Unified Report ------------- */

export interface MonthlyGoal {
  /** Free-text domain name defined by the therapist (was constrained enum). */
  domain: string;
  goal: string;
  status: AchievementLevel;
  notes?: string;
}

/** A named domain grouping multiple goals in the monthly report. */
export interface MonthlyDomain {
  name: string;
  goals: MonthlyGoal[];
}

export interface MonthlyReportData {
  month: string;
  year: number;
  /** Specialty/track this monthly report covers (e.g. تنمية مهارات / علاج طبيعي / تخاطب). */
  specialty?: string;
  /** Period start (ISO yyyy-mm-dd). */
  periodStart?: string;
  /** Period end (ISO yyyy-mm-dd). */
  periodEnd?: string;
  /** Named domains with their goals. */
  domains?: MonthlyDomain[];
  /** Flat list retained for backward compatibility. */
  goals: MonthlyGoal[];
  summary?: string;
  parentNotes?: string;
}

/** ------------- Top-level wrapper ------------- */

export type AssessmentPayload =
  | SpeechAssessmentData
  | PhysioAssessmentData
  | OccupationalAssessmentData
  | PsychAssessmentData
  | SocialAssessmentData
  | NurseLogEntry
  | MonthlyReportData;

export interface Assessment {
  id: string;
  type: AssessmentType;
  studentId: string;
  studentName?: string;
  evaluatorId: string;
  evaluatorName?: string;
  date: string;
  status: AssessmentStatus;
  payload: AssessmentPayload;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSummary {
  id: string;
  type: AssessmentType;
  studentId: string;
  studentName: string;
  evaluatorName: string;
  date: string;
  status: AssessmentStatus;
}
