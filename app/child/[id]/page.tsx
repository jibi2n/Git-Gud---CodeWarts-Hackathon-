import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ChildDetailResponse } from '@/lib/types';
import CaseNoteCard from '@/components/CaseNote';
import InterventionList from '@/components/InterventionList';
import RiskBadge from '@/components/RiskBadge';
import EthicsBanner from '@/components/EthicsBanner';

async function getChildDetail(id: string): Promise<ChildDetailResponse | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/child/${id}`,
    { cache: 'no-store' }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load child detail');
  return res.json();
}

export default async function ChildDetailPage({ params }: { params: { id: string } }) {
  const data = await getChildDetail(params.id);
  if (!data) notFound();

  const { child, prediction, caseNote, interventions, accessAuditLog } = data;
  const probability = (prediction.dropoutProbability90d * 100).toFixed(0);
  const confidence = (prediction.confidence * 100).toFixed(0);
  const maxShap = Math.max(...prediction.topRiskDrivers.map(d => d.shapValue), 0.01);

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 text-sm">
            ← Back to caseload
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-medium text-slate-700">
            {child.firstName} {child.lastName}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{child.firstName} {child.lastName}</h1>
            <p className="text-slate-500 mt-1">
              Age {child.age} · {child.gradeLevel} · {child.barangay}
            </p>
            <p className="text-slate-400 text-xs mt-1">{child.schoolName}</p>
          </div>
          <RiskBadge tier={prediction.riskTier} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Dropout Risk — 90-Day Outlook
            </h2>
            <span className="text-xs text-slate-400">
              Observed confidence: {confidence}%
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  prediction.riskTier === 'critical' ? 'bg-red-500' :
                  prediction.riskTier === 'high' ? 'bg-orange-500' :
                  prediction.riskTier === 'moderate' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}
                style={{ width: `${probability}%` }}
              />
            </div>
            <span className="text-2xl font-bold text-slate-800 w-16 text-right">{probability}%</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            This is a modeled estimate based on documented patterns. It informs — it does not decide.
          </p>
        </div>

        <CaseNoteCard caseNote={caseNote} />

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Why This Child — Top Risk Drivers
          </h2>
          <div className="space-y-3">
            {prediction.topRiskDrivers.map((driver, i) => {
              const width = Math.round((driver.shapValue / maxShap) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">{driver.humanLabel}</span>
                    <span className="text-xs text-slate-400 ml-2">+{driver.shapValue.toFixed(2)}</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <InterventionList interventions={interventions} />

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-slate-400 text-xs">ACCESS LOG</span>
          </div>
          {accessAuditLog.map((entry, i) => (
            <p key={i} className="text-xs text-slate-500">
              Accessed by: {entry.accessedBy} · {entry.role} ·{' '}
              {new Date(entry.timestamp).toLocaleString('en-PH')} · Logged
            </p>
          ))}
          <p className="mt-2 text-xs text-slate-400">
            Household ID: {child.fpsHouseholdId} · Guardian: {child.guardianName}
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition-colors text-sm">
            Mark Intervention as Scheduled
          </button>
          <Link
            href="/dashboard"
            className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm text-center"
          >
            Back to Caseload
          </Link>
        </div>
      </main>

      <EthicsBanner />
    </div>
  );
}
