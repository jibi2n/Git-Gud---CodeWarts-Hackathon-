import type { RiskTier } from './types';

export const TOTAL_FAMILIES = 247;

export const SOCIAL_WORKER = {
  name: 'Marivic Santos',
  role: 'Municipal Link',
  cluster: 'San Pedro, Laguna',
  totalFamilies: TOTAL_FAMILIES,
};

export const DEMO_CHILD_IDS = ['child_demo_001', 'child_demo_002', 'child_demo_003'];

export function getRiskTier(probability: number): RiskTier {
  if (probability >= 0.65) return 'critical';
  if (probability >= 0.50) return 'high';
  if (probability >= 0.30) return 'moderate';
  return 'low';
}

export const RISK_TIER_COLORS: Record<RiskTier, string> = {
  low: 'gray',
  moderate: 'yellow',
  high: 'orange',
  critical: 'red',
};

export const FEATURE_LABELS: Record<string, string> = {
  attendanceRate30d_dropping: 'Attendance has dropped sharply in the last month',
  attendanceRate30d_low: 'Attendance has dropped below expected levels',
  attendanceRate90d_low: 'Attendance has been below average over the last three months',
  attendanceTrend_negative: 'Attendance is on a declining trajectory',
  attendanceTrend_positive: 'Attendance is recovering',
  averageGrade_low: 'Overall academic performance is below grade-level expectations',
  gradeTrend_negative: 'Academic performance is declining over the last quarter',
  gradeTrend_positive: 'Academic performance is improving',
  failingSubjects: 'Multiple failing subjects this quarter',
  failingSubjects_high: 'Multiple failing subjects this quarter',
  householdIncomeShock: 'The household reported a recent income loss',
  parentEmploymentChange: 'A parent recently lost or changed employment',
  householdSize_high: 'Large household size indicating possible resource strain',
  hasOlderSiblingDropout: 'An older sibling has previously left school',
  ageGradeMismatch: 'The child is older than typical for their grade level',
  ageGradeMismatch_high: 'The child is older than typical for their grade level',
  distanceToSchoolKm_high: 'Significant distance to school adds daily friction',
  recentRelocation: 'The family relocated recently, disrupting school continuity',
  recentComplianceWarnings: 'Recent 4Ps compliance warnings documented',
  recentComplianceWarnings_high: 'Recent 4Ps compliance warnings documented',
};

export const INTERVENTION_TYPE_LABELS: Record<string, string> = {
  home_visit: 'Home Visit',
  cash_assistance: 'Emergency Assistance',
  academic_support: 'Academic Support',
  health_referral: 'Health Referral',
  family_counseling: 'Family Counseling',
  school_coordination: 'School Coordination',
};
