import Link from 'next/link';
import type { CaseloadResponse } from '@/lib/types';
import CaseloadTable from '@/components/CaseloadTable';
import EthicsBanner from '@/components/EthicsBanner';

async function getCaseload(): Promise<CaseloadResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/caseload`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load caseload');
  return res.json();
}

export default async function DashboardPage() {
  const data = await getCaseload();
  const { socialWorker, children, summary } = data;

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="text-lg font-bold text-slate-800 hover:text-blue-700">
              PantawidAral
            </Link>
            <p className="text-xs text-slate-500 mt-0.5">
              {socialWorker.name} · {socialWorker.role} · {socialWorker.cluster}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/impact" className="text-sm text-blue-600 hover:underline">Impact</Link>
            <Link href="/access" className="text-sm text-blue-600 hover:underline">Access Policy</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Caseload Overview</h1>
          <p className="text-slate-500 mt-1">
            {socialWorker.totalFamilies} 4Ps families · {summary.totalFlagged} requiring attention
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{summary.totalFlagged}</div>
            <div className="text-xs text-slate-500 mt-1">Total flagged</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{summary.criticalRisk}</div>
            <div className="text-xs text-red-600 mt-1">Critical</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">{summary.highRisk}</div>
            <div className="text-xs text-orange-600 mt-1">High</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{summary.moderateRisk}</div>
            <div className="text-xs text-yellow-600 mt-1">Moderate</div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Children Requiring Follow-Up — sorted by current situation severity
          </h2>
          <CaseloadTable entries={children} />
        </div>
      </main>

      <EthicsBanner />
    </div>
  );
}
