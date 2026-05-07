import type { CaseNote } from '@/lib/types';

export default function CaseNoteCard({ caseNote }: { caseNote: CaseNote }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-blue-500 rounded-full" />
        <h2 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
          Case Note
        </h2>
        {caseNote.source === 'cached' && (
          <span className="ml-auto text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">
            Pre-generated
          </span>
        )}
      </div>
      <blockquote className="text-slate-800 leading-relaxed text-base font-normal">
        {caseNote.narrativeText}
      </blockquote>
      <p className="mt-4 text-xs text-slate-500">
        Generated {new Date(caseNote.generatedAt).toLocaleDateString('en-PH', {
          year: 'numeric', month: 'long', day: 'numeric'
        })} · Documented for social worker use only
      </p>
    </div>
  );
}
