import React from 'react';
import { CalculationResult } from '../types/engine';
import { ShieldCheck, AlertTriangle, Clock, Activity, Zap } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface DiagnosticGaugeProps {
  result: CalculationResult;
  onOpenAdvisory: () => void;
  isAiLoading?: boolean;
}

export const DiagnosticGauge: React.FC<DiagnosticGaugeProps> = ({
  result,
  onOpenAdvisory,
  isAiLoading = false,
}) => {
  const { pHealthy, predictedCondition, markovStateCode, markovStateName } = result;

  // Percentage value
  const percentage = Math.round(pHealthy * 10000) / 100; // e.g. 85.21

  // Color mapping based on health percentage
  let statusColor = '#10B981'; // emerald
  let statusGlow = 'rgba(16, 185, 129, 0.35)';
  if (pHealthy < 0.30) {
    statusColor = '#F43F5E'; // rose
    statusGlow = 'rgba(244, 63, 94, 0.38)';
  } else if (pHealthy < 0.50) {
    statusColor = '#F59E0B'; // amber
    statusGlow = 'rgba(245, 158, 11, 0.35)';
  } else if (pHealthy < 0.75) {
    statusColor = '#38BDF8'; // cyan
    statusGlow = 'rgba(56, 189, 248, 0.35)';
  }

  // Semi-circle Arc calculation (radius 80, stroke 12)
  const r = 80;
  const halfCircumference = Math.PI * r;
  const strokeDashoffset = halfCircumference - halfCircumference * pHealthy;

  // Generate 16 graduated tachometer ticks along the upper 180° arc
  const ticks = Array.from({ length: 17 }, (_, i) => {
    const angle = Math.PI + (i / 16) * Math.PI;
    const isMajor = i % 4 === 0;
    const innerR = isMajor ? 62 : 66;
    const outerR = 71;
    return {
      x1: 100 + innerR * Math.cos(angle),
      y1: 110 + innerR * Math.sin(angle),
      x2: 100 + outerR * Math.cos(angle),
      y2: 110 + outerR * Math.sin(angle),
      isMajor,
    };
  });

  return (
    <div className="hud-panel rounded-xl p-5 flex flex-col justify-between h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <h2 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
            Diagnostic Health Telemetry
          </h2>
        </div>
        <div className="text-[11px] font-mono text-sky-300/90">
          Threshold: τ = 0.50
        </div>
      </div>

      {/* Main Gauge & Binary Badge Stage */}
      <div className="py-4 flex flex-col items-center justify-center">
        {/* SVG Tactical Radial Tachometer Gauge */}
        <div className="relative w-60 h-36 flex items-end justify-center overflow-hidden">
          <svg className="w-60 h-60" viewBox="0 0 200 200">
            {/* Outer Precision Ring */}
            <path
              d="M 10 110 A 90 90 0 0 1 190 110"
              fill="none"
              stroke="rgba(56, 189, 248, 0.16)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            {/* Graduated Tachometer Ticks */}
            {ticks.map((tk, i) => (
              <line
                key={i}
                x1={tk.x1}
                y1={tk.y1}
                x2={tk.x2}
                y2={tk.y2}
                stroke={tk.isMajor ? '#64748b' : '#334155'}
                strokeWidth={tk.isMajor ? '2' : '1'}
              />
            ))}
            {/* Background Track Arc */}
            <path
              d="M 20 110 A 80 80 0 0 1 180 110"
              fill="none"
              stroke="#0f172a"
              strokeWidth="14"
              strokeLinecap="butt"
            />
            {/* Segmented Track Overlay */}
            <path
              d="M 20 110 A 80 80 0 0 1 180 110"
              fill="none"
              stroke="#1e293b"
              strokeWidth="14"
              strokeDasharray="6 3"
            />
            {/* Value Indicator Arc */}
            <path
              d="M 20 110 A 80 80 0 0 1 180 110"
              fill="none"
              stroke={statusColor}
              strokeWidth="14"
              strokeLinecap="butt"
              strokeDasharray={halfCircumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 400ms cubic-bezier(0.16, 1, 0.3, 1), stroke 300ms ease',
                filter: `drop-shadow(0 0 10px ${statusGlow})`,
              }}
            />
          </svg>

          {/* Centered Readout */}
          <div className="absolute bottom-1 text-center">
            <div
              className="font-display text-4xl font-bold tracking-tight text-white tabular-nums"
              style={{ textShadow: `0 0 18px ${statusGlow}` }}
            >
              {percentage.toFixed(1)}%
            </div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              P(Healthy State)
            </div>
          </div>
        </div>

        {/* Binary Engine Condition Badge */}
        <div className="mt-3 w-full max-w-xs">
          {predictedCondition === 1 ? (
            <div className="hud-chamfer flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-950/50 border border-emerald-400/50 text-emerald-300 text-xs font-display font-bold tracking-wider uppercase shadow-[0_0_16px_rgba(16,185,129,0.16)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Normal Operating Condition</span>
            </div>
          ) : (
            <div className="hud-chamfer flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-950/55 border border-rose-400/55 text-rose-300 text-xs font-display font-bold tracking-wider uppercase shadow-[0_0_18px_rgba(244,63,94,0.22)]">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Faulty / Service Required</span>
            </div>
          )}
        </div>
      </div>

      {/* Markov State & MTTF Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
        {/* Markov State Card */}
        <div className="hud-subpanel p-3 rounded-lg">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Markov State
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-6 h-6 hud-chamfer flex items-center justify-center text-xs font-mono font-bold text-white shrink-0 shadow-sm"
              style={{ backgroundColor: statusColor }}
            >
              {markovStateCode}
            </span>
            <div className="font-display text-xs font-bold text-slate-100 truncate">
              {markovStateName}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            State {result.markovState} in absorbing model
          </div>
        </div>

        {/* Remaining Useful Life (RUL) & MTTF Card */}
        <div className="hud-subpanel p-3 rounded-lg">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-300 font-semibold">Remaining Useful Life (RUL)</span>
          </div>
          <div className="font-display text-base font-bold text-slate-100 tabular-nums">
            {result.rul.toFixed(2)}{' '}
            <span className="text-[10px] font-mono font-normal text-slate-400">cycles</span>
          </div>
          <div className="text-[10px] font-mono text-cyan-400/90 mt-1 flex items-center justify-between">
            <span>~{result.rulHours.toLocaleString()} operating hrs</span>
            <span>{result.rulPercent.toFixed(0)}% Life</span>
          </div>
        </div>
      </div>

      {/* On-Demand Gemini Maintenance Advisory Trigger */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick(760, 0.05, 0.04);
            onOpenAdvisory();
          }}
          disabled={isAiLoading}
          className="hud-chamfer w-full py-2.5 px-4 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/60 text-sky-200 hover:text-white text-xs font-display font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(56,189,248,0.18)] cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5 text-sky-300" />
          <span>{isAiLoading ? 'Synthesizing Telemetry...' : 'Generate Gemini Maintenance Advisory'}</span>
        </button>
      </div>
    </div>
  );
};
