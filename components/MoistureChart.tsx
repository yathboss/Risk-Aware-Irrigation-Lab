'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  Line,
  Bar,
  ReferenceLine
} from 'recharts';
import type { ChartPoint } from '@/lib/sim';

function formatPct(v: any) {
  const n = typeof v === 'number' ? v : Number(v);
  if (Number.isNaN(n)) return '';
  return `${n.toFixed(1)}%`;
}

function formatMm(v: any) {
  const n = typeof v === 'number' ? v : Number(v);
  if (Number.isNaN(n)) return '';
  return `${n.toFixed(1)} mm`;
}

type Props = {
  series: ChartPoint[];
  irrigationDay1Mm: number;
};

// Custom label to avoid overlapping the left Y-axis tick (100%)
function IrrigationLabel({ viewBox, irrigationDay1Mm }: { viewBox?: any; irrigationDay1Mm: number }) {
  const x = (viewBox?.x ?? 0) + 18; // push right
  const y = (viewBox?.y ?? 0) + 14; // push down
  return (
    <text x={x} y={y} fontSize={11} fill="#334155">
      {`Irrigation: ${irrigationDay1Mm} mm`}
    </text>
  );
}

export default function MoistureChart({ series, irrigationDay1Mm }: Props) {
  const data = series.map((p) => ({
    ...p,
    dayLabel: `Day ${p.day}`,
    band: Math.max(0, p.p90 - p.p10)
  }));

  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">Soil Moisture Forecast (7 Days)</h3>
          <p className="text-xs text-slate-500">Mean moisture line with P10–P90 uncertainty band (recommended plan).</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Irrigation today: <span className="font-semibold text-slate-800">{irrigationDay1Mm} mm</span>
        </div>
      </div>

      <div className="mt-3 h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {/* Increased top/left margins so labels have space */}
          <ComposedChart data={data} margin={{ top: 26, right: 20, left: 12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tickFormatter={(d) => `D${d}`} />

            {/* Y Axis 0: moisture */}
            <YAxis
              yAxisId={0}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              label={{ value: 'Soil moisture (%)', angle: -90, position: 'insideLeft' }}
            />

            {/* Y Axis 1: rain */}
            <YAxis
              yAxisId={1}
              orientation="right"
              domain={[0, 25]}
              tickFormatter={(v) => `${v}`}
              label={{ value: 'Rain (mm)', angle: 90, position: 'insideRight' }}
            />

            <Tooltip
              formatter={(value, name, item) => {
                if (name === 'Rain (mm)') return [formatMm(value), name];

                if (name === 'Uncertainty (P10–P90)') {
                  const payload: any = (item as any)?.payload;
                  const lo = payload?.p10;
                  const hi = payload?.p90;
                  if (typeof lo === 'number' && typeof hi === 'number') {
                    return [`${lo.toFixed(1)}% – ${hi.toFixed(1)}%`, name];
                  }
                }
                return [formatPct(value), name];
              }}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Legend />

            {/* Uncertainty band */}
            <Area
              yAxisId={0}
              type="monotone"
              dataKey="p10"
              name="P10"
              stroke="none"
              fill="transparent"
              stackId="unc"
              hide
              isAnimationActive={false}
            />
            <Area
              yAxisId={0}
              type="monotone"
              dataKey="band"
              name="Uncertainty (P10–P90)"
              stroke="none"
              fillOpacity={0.18}
              stackId="unc"
              isAnimationActive={false}
            />

            <Line
              yAxisId={0}
              type="monotone"
              dataKey="mean"
              name="Mean moisture"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />

            <Bar yAxisId={1} dataKey="rain" name="Rain (mm)" barSize={18} fillOpacity={0.35} isAnimationActive={false} />

            {/* Irrigation marker (vertical line) with safe label position */}
            <ReferenceLine
              x={1}
              yAxisId={0}
              strokeDasharray="4 4"
              label={<IrrigationLabel irrigationDay1Mm={irrigationDay1Mm} />}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-xs text-slate-500">
        Tip: Increase scenarios to see a smoother uncertainty band. Changing soil type and Kc should shift the curve.
      </div>
    </div>
  );
}
