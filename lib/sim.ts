import type { ForecastWeek } from '@/data/forecastSamples';
import type { SoilType, KcStage } from '@/components/SetupPanel';

export type SoilParams = {
  fieldCapacityMm: number;
  wiltingPointMm: number;
};

export type ChartPoint = {
  day: number; // 1..7
  mean: number;
  p10: number;
  p90: number;
  rain: number;
};

export type SimulationResult = {
  recommendedAmountMm: number;
  riskNoIrrigationPct: number;
  riskWithRecommendedPct: number;
  riskLimitPct: number;
  stressThresholdPct: number;
  scenarios: number;
  series: ChartPoint[];
  candidateRisks: Array<{ amountMm: number; riskPct: number }>;
};

export type SimulationInput = {
  soilType: SoilType;
  initialMoisturePct: number; // 0..100 display moisture%
  kcStage: KcStage;
  stressThresholdPct: number;
  riskLimitPct: number;
  scenarios: number;
  forecast: ForecastWeek;
};

const SOILS: Record<SoilType, SoilParams> = {
  Sandy: { fieldCapacityMm: 45, wiltingPointMm: 10 },
  Loamy: { fieldCapacityMm: 70, wiltingPointMm: 15 },
  Clay: { fieldCapacityMm: 90, wiltingPointMm: 20 }
};

const KC: Record<KcStage, number> = {
  Low: 0.7,
  Medium: 1.0,
  High: 1.2
};

const CANDIDATES_MM = [0, 5, 10, 15] as const;

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function uniform(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function storageFromMoisturePct(moisturePct: number, wp: number, fc: number) {
  const pct = clamp(moisturePct, 0, 100);
  const s = wp + (pct / 100) * (fc - wp);
  return clamp(s, 0, fc);
}

function moisturePctFromStorage(storageMm: number, wp: number, fc: number) {
  if (fc <= wp) return 0;
  const pct = (100 * (storageMm - wp)) / (fc - wp);
  return clamp(pct, 0, 100);
}

function quantile(sortedAsc: number[], p: number) {
  if (sortedAsc.length === 0) return 0;
  const pp = clamp(p, 0, 1);
  const n = sortedAsc.length;
  const idx = (n - 1) * pp;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedAsc[lo];
  const w = idx - lo;
  return sortedAsc[lo] * (1 - w) + sortedAsc[hi] * w;
}

type MonteCarloRun = {
  riskPct: number;
  moistureScenarios: number[][]; // [scenario][day]
};

function runMonteCarloWeek(opts: {
  soil: SoilParams;
  kc: number;
  initialMoisturePct: number;
  stressThresholdPct: number;
  scenarios: number;
  forecast: ForecastWeek;
  irrigationDay1Mm: number;
}): MonteCarloRun {
  const { soil, kc, initialMoisturePct, stressThresholdPct, scenarios, forecast, irrigationDay1Mm } = opts;

  const N = Math.max(1, Math.floor(scenarios));
  const moistureScenarios: number[][] = new Array(N);
  let stressedCount = 0;

  for (let s = 0; s < N; s++) {
    // Uncertainty perturbations (independent per day)
    const fc = soil.fieldCapacityMm * uniform(0.95, 1.05);
    const wp = soil.wiltingPointMm * uniform(0.95, 1.05);

    // ensure physical ordering (rare edge safety)
    const fcSafe = Math.max(fc, wp + 1e-6);
    const wpSafe = Math.min(wp, fcSafe - 1e-6);

    let storage = storageFromMoisturePct(initialMoisturePct, wpSafe, fcSafe);
    const series: number[] = new Array(7);

    let isStressed = false;
    for (let d = 0; d < 7; d++) {
      const rain = forecast.rainMm[d] * uniform(0.7, 1.3);
      const et0 = forecast.et0Mm[d] * uniform(0.85, 1.15);
      const irrigation = d === 0 ? irrigationDay1Mm : 0;

      const etc = kc * et0;
      const inflow = rain + irrigation;
      const nextRaw = storage + inflow - etc;
      const deepPercolation = Math.max(0, nextRaw - fcSafe);
      const next = clamp(nextRaw - deepPercolation, 0, fcSafe);

      storage = next;
      const mPct = moisturePctFromStorage(storage, wpSafe, fcSafe);
      series[d] = mPct;
      if (mPct < stressThresholdPct) isStressed = true;
    }

    moistureScenarios[s] = series;
    if (isStressed) stressedCount += 1;
  }

  const riskPct = (stressedCount / N) * 100;
  return { riskPct, moistureScenarios };
}

function buildEnsembleSeries(moistureScenarios: number[][], forecast: ForecastWeek): ChartPoint[] {
  const N = moistureScenarios.length;
  const out: ChartPoint[] = [];

  for (let d = 0; d < 7; d++) {
    const vals = new Array(N);
    let sum = 0;
    for (let s = 0; s < N; s++) {
      const v = moistureScenarios[s][d];
      vals[s] = v;
      sum += v;
    }

    vals.sort((a, b) => a - b);
    out.push({
      day: d + 1,
      mean: sum / N,
      p10: quantile(vals, 0.1),
      p90: quantile(vals, 0.9),
      rain: forecast.rainMm[d]
    });
  }

  return out;
}

export function runMvpSimulation(input: SimulationInput): SimulationResult {
  const soil = SOILS[input.soilType];
  const kc = KC[input.kcStage];
  const scenarios = clamp(Math.floor(input.scenarios), 50, 300);

  // Evaluate candidates
  const candidateRuns = CANDIDATES_MM.map((amountMm) => {
    const run = runMonteCarloWeek({
      soil,
      kc,
      initialMoisturePct: input.initialMoisturePct,
      stressThresholdPct: input.stressThresholdPct,
      scenarios,
      forecast: input.forecast,
      irrigationDay1Mm: amountMm
    });
    return { amountMm, run };
  });

  const riskNoIrrigationPct = candidateRuns.find((c) => c.amountMm === 0)!.run.riskPct;

  // pick minimum amount meeting the risk limit
  const riskLimit = input.riskLimitPct;
  let chosen = candidateRuns[candidateRuns.length - 1]; // default to max
  for (const c of candidateRuns) {
    if (c.run.riskPct <= riskLimit) {
      chosen = c;
      break;
    }
  }

  const recommendedAmountMm = chosen.amountMm;
  const riskWithRecommendedPct = chosen.run.riskPct;

  const series = buildEnsembleSeries(chosen.run.moistureScenarios, input.forecast);

  return {
    recommendedAmountMm,
    riskNoIrrigationPct: Math.round(riskNoIrrigationPct),
    riskWithRecommendedPct: Math.round(riskWithRecommendedPct),
    riskLimitPct: riskLimit,
    stressThresholdPct: input.stressThresholdPct,
    scenarios,
    series,
    candidateRisks: candidateRuns.map((c) => ({ amountMm: c.amountMm, riskPct: Math.round(c.run.riskPct) }))
  };
}
