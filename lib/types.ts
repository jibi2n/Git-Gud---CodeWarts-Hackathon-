export type RiskTier = 'low' | 'moderate' | 'high' | 'critical';

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gradeLevel: string;
  schoolName: string;
  fpsHouseholdId: string;
  features: ChildFeatures;
  guardianName: string;
  barangay: string;
}

export interface ChildFeatures {
  attendanceRate30d: number;
  attendanceRate90d: number;
  attendanceTrend: number;
  averageGrade: number;
  gradeTrend: number;
  failingSubjects: number;
  householdIncomeShock: boolean;
  parentEmploymentChange: boolean;
  householdSize: number;
  numberOfSiblings: number;
  hasOlderSiblingDropout: boolean;
  ageGradeMismatch: number;
  distanceToSchoolKm: number;
  recentRelocation: boolean;
  monthsIn4Ps: number;
  recentComplianceWarnings: number;
}

export interface Prediction {
  childId: string;
  dropoutProbability90d: number;
  riskTier: RiskTier;
  topRiskDrivers: RiskDriver[];
  confidence: number;
  generatedAt: string;
}

export interface RiskDriver {
  feature: string;
  humanLabel: string;
  shapValue: number;
  contributionDirection: 'increases' | 'decreases';
}

export interface CaseNote {
  childId: string;
  narrativeText: string;
  generatedAt: string;
  source: 'live' | 'cached';
}

export interface Intervention {
  type: 'home_visit' | 'cash_assistance' | 'academic_support'
      | 'health_referral' | 'family_counseling' | 'school_coordination';
  urgencyDays: number;
  description: string;
  rationale: string;
  dswdProgramReference?: string;
}

export interface AccessScope {
  role: string;
  canSee: string[];
  cannotSee: string[];
  rationale: string;
}

export interface ImpactProjection {
  clusterSize: number;
  flaggedThisWeek: number;
  projectedDropoutsWithoutIntervention: number;
  projectedDropoutsWithIntervention: number;
  preventionRate: number;
  citationSources: string[];
}

export interface CaseloadEntry {
  child: Child;
  prediction: Prediction;
  interventionScheduled: boolean;
}

export interface CaseloadResponse {
  socialWorker: {
    name: string;
    role: string;
    cluster: string;
    totalFamilies: number;
  };
  children: CaseloadEntry[];
  summary: {
    totalFlagged: number;
    criticalRisk: number;
    highRisk: number;
    moderateRisk: number;
  };
}

export interface ChildDetailResponse {
  child: Child;
  prediction: Prediction;
  caseNote: CaseNote;
  interventions: Intervention[];
  accessAuditLog: AccessAuditEntry[];
}

export interface AccessAuditEntry {
  accessedBy: string;
  role: string;
  timestamp: string;
}

export interface AccessScopeResponse {
  matrix: AccessScope[];
  principle: string;
}
