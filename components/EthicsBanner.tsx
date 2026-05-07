'use client';

import Link from 'next/link';

export default function EthicsBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-slate-200 px-6 py-3 flex items-center justify-between text-sm z-50">
      <span>
        <span className="mr-2">🔒</span>
        <span className="font-medium">Visible only to authorized DSWD staff.</span>
        <span className="hidden sm:inline text-slate-400 ml-2">
          These assessments are protected and role-scoped.
        </span>
      </span>
      <Link
        href="/access"
        className="text-blue-400 hover:text-blue-300 underline underline-offset-2 whitespace-nowrap ml-4 font-medium"
      >
        See Who Can See This →
      </Link>
    </div>
  );
}
