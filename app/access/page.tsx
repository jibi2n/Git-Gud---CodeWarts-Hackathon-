import Link from 'next/link';
import type { AccessScopeResponse } from '@/lib/types';
import AccessScopeMatrix from '@/components/AccessScopeMatrix';
import EthicsBanner from '@/components/EthicsBanner';

async function getAccessScope(): Promise<AccessScopeResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/access-scope`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Failed to load access scope');
  return res.json();
}

export default async function AccessPage() {
  const data = await getAccessScope();

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 text-sm">
            ← Back to dashboard
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/" className="text-sm font-bold text-slate-700">PantawidAral</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-slate-900">Who Can See This Information</h1>
          <blockquote className="mt-6 text-lg font-medium text-slate-700 border-l-4 border-blue-500 pl-5 leading-relaxed">
            &ldquo;Built to be useful only to those who can help, and useless to those who could harm.&rdquo;
          </blockquote>
          <p className="mt-4 text-slate-600 text-sm leading-relaxed">
            PantawidAral enforces access boundaries at the data layer. Dropout risk assessments are
            never routed to schools, teachers, or administrators — by design.
          </p>
        </div>

        <AccessScopeMatrix matrix={data.matrix} />

        <div className="max-w-2xl bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
          <h3 className="font-semibold text-amber-900">Why schools cannot see this</h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            Research in educational psychology documents a consistent labeling effect: when teachers
            are told a student is at risk, they often invest less effort and hold lower expectations —
            even when the label is probabilistic. This creates a self-fulfilling harm.
          </p>
          <p className="text-sm text-amber-800 leading-relaxed">
            The social worker is the right person. She can intervene at the household level, connect
            the family to resources, and support re-engagement — without triggering stigma inside
            the school.
          </p>
          <p className="text-xs text-amber-600 italic mt-2">
            Reference: Rosenthal & Jacobson (1968). Pygmalion in the classroom.
            Teacher expectation and pupils&apos; intellectual development. Holt, Rinehart and Winston.
          </p>
        </div>

        <div className="text-sm text-slate-500">
          <p className="font-semibold text-slate-700 mb-1">Principle</p>
          <p className="italic">{data.principle}</p>
        </div>
      </main>

      <EthicsBanner />
    </div>
  );
}
