import type { Child, Prediction } from './types';

export const CASE_NOTE_SYSTEM_PROMPT = `You are writing a case note for a Filipino DSWD social worker (Municipal Link) who manages 4Ps families. The note describes one child's current dropout risk situation.

Tone requirements:
- Dignified, never patronizing
- Factual, never alarmist
- Action-oriented, never fatalistic
- Written in English with natural Filipino case-work conventions
- 3 to 5 sentences, no longer

Content requirements:
- Lead with what's happening with this specific child (concrete, not statistical)
- Reference the data driving the concern, in plain language
- End with what the social worker should consider
- Never mention the model, AI, or "the system"
- Never use the words "verified" or "certified" — use "documented" or "observed"
- Never refer to the child's risk as a "label" or "flag" — use "current situation"

Output: A single paragraph. No headers. No markdown.`;

export function buildCaseNotePrompt(child: Child, prediction: Prediction): string {
  const probability = (prediction.dropoutProbability90d * 100).toFixed(0);
  const drivers = prediction.topRiskDrivers
    .map(d => `- ${d.humanLabel}`)
    .join('\n');

  return `Write a case note for this child:

Name: ${child.firstName}
Age: ${child.age}
Grade: ${child.gradeLevel}
Barangay: ${child.barangay}

Current dropout probability over 90 days: ${probability}%

Top reasons:
${drivers}

Write the case note now.`.trim();
}

export function buildFallbackCaseNote(child: Child, prediction: Prediction): string {
  const tier = prediction.riskTier;
  const prob = (prediction.dropoutProbability90d * 100).toFixed(0);
  const topDriver = prediction.topRiskDrivers[0]?.humanLabel ?? 'attendance patterns';

  const urgencyMap: Record<string, string> = {
    critical: 'requires immediate attention',
    high: 'warrants prompt follow-up',
    moderate: 'should be monitored closely',
    low: 'is currently stable',
  };

  return `${child.firstName}, age ${child.age}, has a current situation that ${urgencyMap[tier]} based on observed patterns. ${topDriver} is the primary concern documented in recent records. A follow-up within the next two to three weeks is recommended to assess the household's current circumstances and determine whether additional support is needed to keep ${child.firstName} enrolled through the end of the quarter.`;
}
