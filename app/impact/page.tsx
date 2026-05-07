import Link from 'next/link';
import ImpactProjection from '@/components/ImpactProjection';
import EthicsBanner from '@/components/EthicsBanner';

async function getImpactData() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/impact`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Failed to load impact data');
  return res.json();
}

export default async function ImpactPage() {
  const data = await getImpactData();

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 text-sm">
            ← Back to dashboard
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/" className="text-sm font-bold text-slate-700">PantawidAral</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Impact Projection</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Modeled estimates for San Pedro, Laguna — and the national picture.
          </p>
        </div>

        <ImpactProjection data={data} />

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3">
          <h3 className="font-semibold text-slate-800">Pilot Path</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            Pilot path: 90-day evaluation with one DSWD field office, co-designed with DSWD
            National Advisory Committee. Evaluation framework measures: intervention scheduling
            rate, dropout outcome at 90 days, social worker time-to-action, and false positive rate.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Phase 1', desc: '90-day pilot, 1 field office, ~250 families' },
              { label: 'Phase 2', desc: 'Regional rollout, 10 field offices, co-evaluation' },
              { label: 'Phase 3', desc: 'National deployment via DSWD PPIS integration' },
            ].map(phase => (
              <div key={phase.label} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="font-semibold text-slate-700 text-sm">{phase.label}</div>
                <div className="text-xs text-slate-500 mt-1">{phase.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <EthicsBanner />
    </div>
  );
}
