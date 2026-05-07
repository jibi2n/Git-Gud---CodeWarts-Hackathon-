import type { RiskTier } from '@/lib/types';

const tierConfig: Record<RiskTier, { label: string; classes: string }> = {
  low: { label: 'Low', classes: 'bg-gray-100 text-gray-700 border-gray-300' },
  moderate: { label: 'Moderate', classes: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  high: { label: 'High', classes: 'bg-orange-100 text-orange-800 border-orange-300' },
  critical: { label: 'Critical', classes: 'bg-red-100 text-red-800 border-red-300' },
};

export default function RiskBadge({ tier }: { tier: RiskTier }) {
  const config = tierConfig[tier];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}>
      {config.label}
    </span>
  );
}
