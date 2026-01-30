'use client';

import { useMemo, useState } from 'react';
import SetupPanel, { SetupState } from '@/components/SetupPanel';
import Dashboard from '@/components/Dashboard';
import { forecastSamples } from '@/data/forecastSamples';
import { runMvpSimulation, SimulationResult } from '@/lib/sim';

const defaultState: SetupState = {
  soilType: 'Loamy',
  initialMoisturePct: 40,
  kcStage: 'Medium',
  stressThresholdPct: 20,
  riskLimitPct: 10,
  forecastId: 'sampleA',
  scenarios: 150
};

export default function Page() {
  const [setup, setSetup] = useState<SetupState>(defaultState);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const selectedForecast = useMemo(() => {
    return forecastSamples.find(s => s.id === setup.forecastId) ?? forecastSamples[0];
  }, [setup.forecastId]);

  const onRun = async () => {
    setIsRunning(true);
    // allow the UI to render the loading state before heavy work
    await new Promise((r) => setTimeout(r, 20));

    try {
      const res = runMvpSimulation({
        soilType: setup.soilType,
        initialMoisturePct: setup.initialMoisturePct,
        kcStage: setup.kcStage,
        stressThresholdPct: setup.stressThresholdPct,
        riskLimitPct: setup.riskLimitPct,
        forecast: selectedForecast,
        scenarios: setup.scenarios
      });
      setResult(res);
    } finally {
      setIsRunning(false);
    }
  };

  const onReset = () => {
    setSetup(defaultState);
    setResult(null);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Risk-Aware Irrigation Lab</h1>
            <p className="text-sm text-slate-600">
              Virtual lab MVP: 7-day root-zone soil moisture simulation + risk-aware irrigation recommendation under forecast uncertainty.
            </p>
          </div>
          <div className="rounded-xl bg-white px-4 py-2 shadow-soft">
            <div className="text-xs text-slate-500">Model</div>
            <div className="text-sm font-medium">Bucket storage (mm) · Uncertainty simulation · Risk of stress (%)</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-4">
          <SetupPanel
            value={setup}
            onChange={setSetup}
            onRun={onRun}
            onReset={onReset}
            isRunning={isRunning}
          />
        </section>

        <section className="lg:col-span-8">
          <Dashboard
            setup={setup}
            forecast={selectedForecast}
            result={result}
            isRunning={isRunning}
          />
        </section>
      </div>

      <footer className="mt-8 text-xs text-slate-500">
        Built for MVP demonstration. Edit datasets in <code className="rounded bg-slate-100 px-1">/data/forecastSamples.ts</code> and model logic in{' '}
        <code className="rounded bg-slate-100 px-1">/lib/sim.ts</code>.
      </footer>
    </main>
  );
}
