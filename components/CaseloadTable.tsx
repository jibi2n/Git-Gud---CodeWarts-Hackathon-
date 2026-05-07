'use client';

import { useRouter } from 'next/navigation';
import type { CaseloadEntry } from '@/lib/types';
import RiskBadge from './RiskBadge';

export default function CaseloadTable({ entries }: { entries: CaseloadEntry[] }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Age</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Grade</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Risk</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Probability</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Top Concern</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map(({ child, prediction }) => (
            <tr
              key={child.id}
              onClick={() => router.push(`/child/${child.id}`)}
              className="hover:bg-blue-50 cursor-pointer transition-colors duration-100"
            >
              <td className="px-4 py-3 font-medium text-slate-800">
                {child.firstName} {child.lastName}
              </td>
              <td className="px-4 py-3 text-slate-600">{child.age}</td>
              <td className="px-4 py-3 text-slate-600">{child.gradeLevel}</td>
              <td className="px-4 py-3">
                <RiskBadge tier={prediction.riskTier} />
              </td>
              <td className="px-4 py-3 font-semibold text-slate-700">
                {(prediction.dropoutProbability90d * 100).toFixed(0)}%
              </td>
              <td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-xs">
                <span className="truncate block">
                  {prediction.topRiskDrivers[0]?.humanLabel ?? '—'}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/child/${child.id}`);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium text-xs underline underline-offset-2"
                >
                  View →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
