# Risk-Aware Irrigation Lab (MVP)

A **Virtual Lab style** web app that simulates **7-day root-zone soil moisture** using a simple daily **bucket model** and recommends a **risk-aware irrigation amount for Day 1 (today)**.

This MVP uses a lightweight **uncertainty simulation** (Monte Carlo scenarios) to estimate **risk of crop stress (%)** under forecast uncertainty, then chooses the **minimum irrigation amount** that keeps risk below a user-selected limit.

## Features

- 2-column single-page UI: **Setup Panel** → **Simulation Dashboard**
- Soil types (Sandy / Loamy / Clay) with fixed bucket parameters
- Crop stage (Kc) affects ETc
- 3 preloaded 7-day forecast samples (rain + ET0)
- Monte Carlo uncertainty simulation for forecast + soil parameters
- Scheduler tests candidate irrigations: **0, 5, 10, 15 mm** (Day 1 only)
- Outputs:
  - Risk if no irrigation
  - Risk with recommended irrigation
  - Recommended irrigation amount
  - Chart: mean moisture + P10–P90 uncertainty band + rain bars

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Recharts (charts)
- Simulation runs **entirely in the browser** (no backend)

## Run Locally

```bash
npm install
npm run dev
```

Open: http://localhost:3000

## Build & Start (Production)

```bash
npm run build
npm start
```

## Where to Edit

- **Forecast datasets (3 sample weeks):** `data/forecastSamples.ts`
- **Core model + Monte Carlo + scheduler:** `lib/sim.ts`
- **UI:** `app/page.tsx` and components in `components/`

## Model Summary (MVP)

- Root-zone storage `S` in mm, daily timestep.
- ETc = Kc × ET0
- Inflow = rain + irrigation (only Day 1)
- Update:
  - `S_next_raw = S + In - ETc`
  - `DeepPercolation = max(0, S_next_raw - FieldCapacity)`
  - `S_next = clamp(S_next_raw - DeepPercolation, 0, FieldCapacity)`
- Display moisture%:
  - `moisturePct = 100 * (S - WiltingPoint) / (FieldCapacity - WiltingPoint)` (clamped 0–100)
- Stress event:
  - A scenario is “stressed” if `moisturePct` dips below threshold on **any** day.
## Model explain: 
https://drive.google.com/file/d/1FaL0I6ZFcO-AtPvmLJOawaDrHg1C1XEk/view?usp=drive_link

## Live Demo:

