import { readFileSync } from 'fs';
import { join } from 'path';
import type { Intervention, Prediction, RiskDriver } from '../types';

interface InterventionRule {
  type: Intervention['type'];
  urgencyDays: number;
  description: string;
  rationale: string;
  dswdProgramReference?: string;
}

let rulesCache: Record<string, InterventionRule> | null = null;

function loadRules(): Record<string, InterventionRule> {
  if (rulesCache) return rulesCache;
  const filePath = join(process.cwd(), 'data', 'intervention_rules.json');
  const raw = readFileSync(filePath, 'utf-8');
  rulesCache = JSON.parse(raw) as Record<string, InterventionRule>;
  return rulesCache;
}

function mapDriverToRuleKey(driver: RiskDriver): string {
  const featureRuleMap: Record<string, string> = {
    attendanceRate30d: 'attendanceRate30d_dropping',
    attendanceRate30d_dropping: 'attendanceRate30d_dropping',
    householdIncomeShock: 'householdIncomeShock',
    hasOlderSiblingDropout: 'hasOlderSiblingDropout',
    gradeTrend_negative: 'gradeTrend_negative',
    recentRelocation: 'recentRelocation',
    ageGradeMismatch: 'ageGradeMismatch',
    ageGradeMismatch_high: 'ageGradeMismatch',
    failingSubjects: 'failingSubjects',
    failingSubjects_high: 'failingSubjects',
    recentComplianceWarnings: 'recentComplianceWarnings',
    recentComplianceWarnings_high: 'recentComplianceWarnings',
    attendanceTrend_negative: 'attendanceTrend_negative',
    distanceToSchoolKm_high: 'distanceToSchoolKm_high',
    parentEmploymentChange: 'householdIncomeShock',
  };
  return featureRuleMap[driver.feature] ?? driver.feature;
}

export class InterventionService {
  recommend(prediction: Prediction): Intervention[] {
    const rules = loadRules();
    const seen = new Set<string>();
    const interventions: Intervention[] = [];

    for (const driver of prediction.topRiskDrivers) {
      if (interventions.length >= 3) break;
      const ruleKey = mapDriverToRuleKey(driver);
      const rule = rules[ruleKey];
      if (rule && !seen.has(rule.type)) {
        seen.add(rule.type);
        interventions.push({
          type: rule.type,
          urgencyDays: rule.urgencyDays,
          description: rule.description,
          rationale: rule.rationale,
          dswdProgramReference: rule.dswdProgramReference,
        });
      }
    }

    interventions.sort((a, b) => a.urgencyDays - b.urgencyDays);
    return interventions;
  }
}

export const interventionService = new InterventionService();
