import type { AccessScope } from '@/lib/types';

export default function AccessScopeMatrix({ matrix }: { matrix: AccessScope[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 font-semibold text-slate-600 w-48">Role</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Can See</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Cannot See</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">Why</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {matrix.map((entry, i) => {
            const hasAccess = entry.canSee.length > 0;
            return (
              <tr key={i} className={hasAccess ? 'bg-white' : 'bg-red-50'}>
                <td className="px-4 py-3 font-medium text-slate-800 align-top">
                  {entry.role}
                </td>
                <td className="px-4 py-3 align-top">
                  {entry.canSee.length > 0 ? (
                    <ul className="space-y-1">
                      {entry.canSee.map((item, j) => (
                        <li key={j} className="flex items-center gap-1.5 text-green-700">
                          <span className="text-green-500 font-bold">✓</span>
                          <span className="text-xs">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Nothing</span>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  {entry.cannotSee.length > 0 ? (
                    <ul className="space-y-1">
                      {entry.cannotSee.map((item, j) => (
                        <li key={j} className="flex items-center gap-1.5 text-red-700">
                          <span className="text-red-500 font-bold">✗</span>
                          <span className="text-xs">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No restrictions</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 align-top max-w-xs">
                  {entry.rationale}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
