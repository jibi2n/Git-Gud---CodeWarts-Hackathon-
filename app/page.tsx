import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="max-w-xl w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            PantawidAral
          </h1>
          <p className="mt-3 text-lg text-slate-600 font-normal italic">
            &ldquo;Foresight for the families who can&apos;t afford to be invisible.&rdquo;
          </p>
        </div>

        <div className="border-t border-b border-slate-100 py-8 space-y-4">
          <p className="text-slate-700 text-base leading-relaxed">
            A dropout risk prediction and intervention support tool for DSWD Municipal Links
            managing 4Ps families. Built to route the right information to the right person —
            and only to them.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['SDG 4: Quality Education', 'SDG 1: No Poverty', 'SDG 16: Strong Institutions'].map(sdg => (
              <span key={sdg} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 font-medium">
                {sdg}
              </span>
            ))}
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center w-full bg-blue-700 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-blue-800 transition-colors duration-150"
        >
          Login as Ate Marivic Santos
        </Link>

        <p className="text-xs text-slate-400">
          Hackathon prototype — synthetic data only. No real DSWD records are used.
        </p>
      </div>
    </div>
  );
}
