import type { Intervention } from '@/lib/types';
import { INTERVENTION_TYPE_LABELS } from '@/lib/constants';

const typeIcons: Record<Intervention['type'], string> = {
  home_visit: '🏠',
  cash_assistance: '💰',
  academic_support: '📚',
  health_referral: '🏥',
  family_counseling: '👨‍👩‍👧',
  school_coordination: '🏫',
};

const urgencyColor = (days: number) => {
  if (days <= 7) return 'bg-red-50 border-red-200 text-red-700';
  if (days <= 14) return 'bg-orange-50 border-orange-200 text-orange-700';
  return 'bg-yellow-50 border-yellow-200 text-yellow-700';
};

export default function InterventionList({ interventions }: { interventions: Intervention[] }) {
  if (interventions.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Recommended Interventions
      </h2>
      <div className="space-y-3">
        {interventions.map((intervention, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{typeIcons[intervention.type]}</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {INTERVENTION_TYPE_LABELS[intervention.type]}
                </span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border whitespace-nowrap ${urgencyColor(intervention.urgencyDays)}`}>
                Within {intervention.urgencyDays} days
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{intervention.description}</p>
            <p className="mt-1 text-xs text-slate-500 italic">{intervention.rationale}</p>
            {intervention.dswdProgramReference && (
              <p className="mt-2 text-xs text-blue-700 font-medium">
                Program: {intervention.dswdProgramReference}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
