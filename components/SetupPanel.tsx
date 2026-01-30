'use client';

import { forecastSamples } from '@/data/forecastSamples';

export type SoilType = 'Sandy' | 'Loamy' | 'Clay';
export type KcStage = 'Low' | 'Medium' | 'High';

export type SetupState = {
  soilType: SoilType;
  initialMoisturePct: number;
  kcStage: KcStage;
  stressThresholdPct: 15 | 20 | 25;
  riskLimitPct: 5 | 10 | 20;
  forecastId: 'sampleA' | 'sampleB' | 'sampleC';
  scenarios: number;
};

type Props = {
  value: SetupState;
  onChange: (next: SetupState) => void;
  onRun: () => void | Promise<void>;
  onReset: () => void;
  isRunning: boolean;
};

export default function SetupPanel({ value, onChange, onRun, onReset, isRunning }: Props) {
  const update = <K extends keyof SetupState>(key: K, val: SetupState[K]) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft">
      <h2 className="text-lg font-semibold">Inputs</h2>
      <p className="mt-1 text-sm text-slate-600">
        Choose soil and crop settings, then click <span className="font-semibold">Get Recommendation</span>. We suggest
        the minimum water to apply today so that stress risk stays below your chosen limit.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium">Soil (type)</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            value={value.soilType}
            onChange={(e) => update('soilType', e.target.value as SetupState['soilType'])}
            disabled={isRunning}
          >
            <option value="Sandy">Sandy (dries fast)</option>
            <option value="Loamy">Loamy (balanced)</option>
            <option value="Clay">Clay (holds water)</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Starting soil moisture</label>
            <span className="text-sm text-slate-700">{value.initialMoisturePct}%</span>
          </div>
          <input
            type="range"
            min={20}
            max={80}
            step={1}
            value={value.initialMoisturePct}
            onChange={(e) => update('initialMoisturePct', Number(e.target.value))}
            disabled={isRunning}
            className="mt-2 w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>20%</span>
            <span>80%</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Crop water need</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            value={value.kcStage}
            onChange={(e) => update('kcStage', e.target.value as SetupState['kcStage'])}
            disabled={isRunning}
          >
            <option value="Low">Low (small crop)</option>
            <option value="Medium">Medium</option>
            <option value="High">High (thirsty crop)</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">Higher need = soil dries faster.</p>
        </div>

        <div>
          <label className="text-sm font-medium">Danger level (stress)</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            value={value.stressThresholdPct}
            onChange={(e) => update('stressThresholdPct', Number(e.target.value) as SetupState['stressThresholdPct'])}
            disabled={isRunning}
          >
            <option value={15}>15% (very low)</option>
            <option value={20}>20% (default)</option>
            <option value={25}>25% (more strict)</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">Stress happens if soil moisture goes below this on any day.</p>
        </div>

        <div>
          <label className="text-sm font-medium">Max stress risk allowed</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            value={value.riskLimitPct}
            onChange={(e) => update('riskLimitPct', Number(e.target.value) as SetupState['riskLimitPct'])}
            disabled={isRunning}
          >
            <option value={5}>5% (very safe)</option>
            <option value={10}>10% (safe)</option>
            <option value={20}>20% (ok)</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">
            We will pick the smallest irrigation that keeps risk under this limit.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Weather sample (7 days)</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            value={value.forecastId}
            onChange={(e) => update('forecastId', e.target.value as SetupState['forecastId'])}
            disabled={isRunning}
          >
            {forecastSamples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Risk scenarios (uncertainty)</label>
            <span className="text-sm text-slate-700">{value.scenarios}</span>
          </div>
          <input
            type="range"
            min={50}
            max={300}
            step={10}
            value={value.scenarios}
            onChange={(e) => update('scenarios', Number(e.target.value))}
            disabled={isRunning}
            className="mt-2 w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>50</span>
            <span>300</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">More scenarios = more stable risk % (but slightly slower).</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-soft disabled:opacity-60"
          >
            {isRunning ? 'Calculating…' : 'Get Recommendation'}
          </button>
          <button
            onClick={onReset}
            disabled={isRunning}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-soft disabled:opacity-60"
          >
            Reset inputs
          </button>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <div className="font-semibold text-slate-700">How it works (simple)</div>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            <li>We simulate soil moisture for the next 7 days in your browser.</li>
            <li>We try 0, 5, 10, 15 mm water for today and pick the smallest that meets your risk limit.</li>
            <li>Risk % comes from many “what if the forecast is wrong?” scenarios.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
  