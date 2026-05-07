'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ImpactData {
  projection: {
    clusterSize: number;
    flaggedThisWeek: number;
    projectedDropoutsWithoutIntervention: number;
    projectedDropoutsWithIntervention: number;
    preventionRate: number;
    intervalLow: number;
    intervalHigh: number;
  };
  nationalProjection: {
    totalMunicipalLinks: number;
    estimatedAnnualPreventedDropouts: { low: number; high: number; central: number };
  };
  citations: Array<{ label: string; type: string }>;
  methodology: string;
}

const nationalData = [
  { scenario: 'Without PantawidAral', dropouts: 144000 },
  { scenario: 'With PantawidAral (low)', dropouts: 136000 },
  { scenario: 'With PantawidAral (central)', dropouts: 133000 },
  { scenario: 'With PantawidAral (high)', dropouts: 130000 },
];

export default function ImpactProjection({ data }: { data: ImpactData }) {
  const { projection, nationalProjection, citations, methodology } = data;
  const prevented = projection.projectedDropoutsWithoutIntervention - projection.projectedDropoutsWithIntervention;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-slate-800">{projection.flaggedThisWeek}</div>
          <div className="text-sm text-slate-500 mt-1">Children flagged this week</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-red-700">{projection.projectedDropoutsWithoutIntervention}</div>
          <div className="text-sm text-red-600 mt-1">Projected dropouts without action</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-green-700">{prevented}</div>
          <div className="text-sm text-green-600 mt-1">Dropouts prevented with intervention</div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <p className="text-base text-slate-800 leading-relaxed">
          If interventions are scheduled within 14 days for the {projection.flaggedThisWeek} flagged children,
          the modeled outcome is{' '}
          <strong>{prevented} prevented dropouts</strong> in San Pedro this year.
          Prevention rate: {(projection.preventionRate * 100).toFixed(0)}%
          (range: {(projection.intervalLow * 100).toFixed(0)}%–{(projection.intervalHigh * 100).toFixed(0)}%).
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-slate-700 mb-4">National Scale Projection</h3>
        <p className="text-sm text-slate-600 mb-4">
          Scaled across all {nationalProjection.totalMunicipalLinks.toLocaleString()} Municipal Links in the Philippines:
          an estimated{' '}
          <strong>{nationalProjection.estimatedAnnualPreventedDropouts.low.toLocaleString()}–{nationalProjection.estimatedAnnualPreventedDropouts.high.toLocaleString()}</strong>{' '}
          dropouts prevented annually.
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nationalData} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="scenario"
                tick={{ fontSize: 11, fill: '#64748b' }}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), 'Projected dropouts']}
              />
              <ReferenceLine y={144000} stroke="#ef4444" strokeDasharray="4 4" />
              <Bar dataKey="dropouts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-700 mb-3">Citations</h3>
        <ul className="space-y-2">
          {citations.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-blue-500 font-bold mt-0.5">[{i + 1}]</span>
              <span>{c.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <p className="text-xs text-slate-500 italic">{methodology}</p>
      </div>
    </div>
  );
}
