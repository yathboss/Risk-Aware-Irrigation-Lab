import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Risk-Aware Irrigation Lab (MVP)',
  description: 'Virtual lab MVP that simulates 7-day soil moisture and recommends risk-aware irrigation.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
