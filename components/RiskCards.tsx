'use client';

type Props = {
  riskNoIrrigationPct: number;
  riskWithRecommendedPct: number;
  recommendedAmountMm: number;
  riskLimitPct: number;
};

function pct(n: number) {
  const v = Math.max(0, Math.min(100, n));
  return `${v.toFixed(0)}%`;
}

export default function RiskCards({ riskNoIrrigationPct, riskWithRecommendedPct, recommendedAmountMm, riskLimitPct }: Props) {
  const meetsTarget = riskWithRecommendedPct <= riskLimitPct;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="text-xs text-slate-500">Risk if No Irrigation</div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">{pct(riskNoIrrigationPct)}</div>
        <div className="mt-1 text-xs text-slate-600">Probability of any stress day over 7 days.</div>
      </div>

      <div className={`rounded-2xl border p-4 shadow-soft ${meetsTarget ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
        <div className="text-xs text-slate-600">Risk with Recommended</div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">{pct(riskWithRecommendedPct)}</div>
        <div className="mt-1 text-xs text-slate-700">
          Target: <span className="font-semibold">≤ {pct(riskLimitPct)}</span> {meetsTarget ? '✓' : '(not met)'}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="text-xs text-slate-500">Recommended</div>
        <div className="mt-1 text-xl font-semibold text-slate-900">Irrigate Today</div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">{recommendedAmountMm} mm</div>
        <div className="mt-1 text-xs text-slate-600">Minimum amount meeting the risk limit (if possible).</div>
      </div>
    </div>
  );
}
