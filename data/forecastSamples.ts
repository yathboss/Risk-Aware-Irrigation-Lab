export type ForecastWeek = {
  id: 'sampleA' | 'sampleB' | 'sampleC';
  name: string;
  rainMm: number[]; // length 7
  et0Mm: number[]; // length 7
};

// 3 preloaded sample forecast weeks (7 days each)
// Values are intentionally "realistic" for a generic warm-season week:
// - daily ET0 typically 3–7 mm
// - daily rainfall typically 0–20 mm
export const forecastSamples: ForecastWeek[] = [
  {
    id: 'sampleA',
    name: 'Sample A (Warm & Dry)',
    rainMm: [0, 0, 2, 0, 0, 0, 1],
    et0Mm: [6.2, 6.5, 6.0, 6.8, 6.6, 6.3, 6.1]
  },
  {
    id: 'sampleB',
    name: 'Sample B (Mixed Showers)',
    rainMm: [4, 0, 0, 8, 0, 5, 0],
    et0Mm: [5.2, 5.6, 5.8, 5.0, 5.4, 5.1, 5.7]
  },
  {
    id: 'sampleC',
    name: 'Sample C (Humid & Wet Start)',
    rainMm: [12, 6, 0, 0, 3, 0, 0],
    et0Mm: [4.2, 4.0, 4.6, 4.9, 4.7, 5.1, 5.0]
  }
];
