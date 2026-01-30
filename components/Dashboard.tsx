'use client';

import type { ForecastWeek } from '@/data/forecastSamples';
import type { SetupState } from '@/components/SetupPanel';
import type { SimulationResult } from '@/lib/sim';
import MoistureChart from '@/components/MoistureChart';
import RiskCards from '@/components/RiskCards';

type Props = {
  setup: SetupState;
  forecast: ForecastWeek;
  result: SimulationResult | null;
  isRunning: boolean;
};

export default function Dashboard({ setup, forecast, result, isRunning }: Props) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Simulation Dashboard</h2>
          <p className="text-sm text-slate-600">Results for the selected forecast week and uncertainty settings.</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <div><span className="font-semibold text-slate-700">Today decision:</span> irrigate Day 1 only</div>
          <div><span className="font-semibold text-slate-700">Risk definition:</span> moisture &lt; threshold on ANY day</div>
        </div>
      </div>

      {isRunning && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-medium">Running simulation…</div>
          <div className="mt-1 text-xs text-slate-600">Computing risk and uncertainty band across scenarios.</div>
        </div>
      )}

      {!result && !isRunning && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-medium">No results yet</div>
          <p className="mt-1 text-sm text-slate-600">
            Click <span className="font-semibold">Run Simulation</span> to generate the 7-day soil moisture forecast, uncertainty band,
            and a risk-aware irrigation recommendation.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-3 shadow-soft">
              <div className="text-xs text-slate-500">Selected forecast</div>
              <div className="text-sm font-semibold">{forecast.name}</div>
              <div className="mt-2 grid grid-cols-7 gap-2 text-center text-[11px] text-slate-600">
                {forecast.rainMm.map((v, i) => (
                  <div key={i} className="rounded-lg bg-slate-50 px-2 py-1">
                    <div className="text-slate-500">D{i + 1}</div>
                    <div><span className="font-semibold">{v}</span> mm</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-slate-500">Rain (mm/day)</div>
            </div>

            <div className="rounded-xl bg-white p-3 shadow-soft">
              <div className="text-xs text-slate-500">Current setup</div>
              <div className="mt-1 text-sm">
                <div><span className="font-semibold">Soil:</span> {setup.soilType}</div>
                <div><span className="font-semibold">Kc:</span> {setup.kcStage}</div>
                <div><span className="font-semibold">Initial moisture:</span> {setup.initialMoisturePct}%</div>
                <div><span className="font-semibold">Stress threshold:</span> {setup.stressThresholdPct}%</div>
                <div><span className="font-semibold">Risk limit:</span> {setup.riskLimitPct}%</div>
                <div><span className="font-semibold">Scenarios:</span> {setup.scenarios}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <MoistureChart
            series={result.series}
            irrigationDay1Mm={result.recommendedAmountMm}
          />

          <RiskCards
            riskNoIrrigationPct={result.riskNoIrrigationPct}
            riskWithRecommendedPct={result.riskWithRecommendedPct}
            recommendedAmountMm={result.recommendedAmountMm}
            riskLimitPct={result.riskLimitPct}
          />

          <div className="rounded-2xl bg-slate-50 p-4">
            <h3 className="text-sm font-semibold">Explanation</h3>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
              We tested irrigation amounts for <span className="font-semibold">Day 1</span> (today):{' '}
              <span className="font-semibold">0, 5, 10, 15 mm</span>. For each option, we ran{' '}
              <span className="font-semibold">{result.scenarios}</span> uncertainty scenarios by scaling rain and ET0 within plausible
              ranges, and lightly jittering soil parameters. A scenario is counted as “stressed” if soil moisture drops below{' '}
              <span className="font-semibold">{result.stressThresholdPct}%</span> on <span className="font-semibold">any</span> day.
            </p>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
              The recommended action is the <span className="font-semibold">minimum</span> irrigation amount that keeps the computed
              stress risk at or below your selected risk limit (<span className="font-semibold">{result.riskLimitPct}%</span>). In this run,
              <span className="font-semibold"> {result.recommendedAmountMm} mm</span> meets the target, reducing stress risk from{' '}
              <span className="font-semibold">{result.riskNoIrrigationPct}%</span> (no irrigation) to{' '}
              <span className="font-semibold">{result.riskWithRecommendedPct}%</span>.
            </p>

            <div className="mt-3 rounded-xl bg-white p-3 shadow-soft">
              <div className="text-xs text-slate-500">Uncertainty band</div>
              <div className="text-sm text-slate-700">
                The shaded band on the chart shows the <span className="font-semibold">P10–P90</span> range across scenarios. The line shows
                the <span className="font-semibold">mean</span> soil moisture trajectory for the recommended plan.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
