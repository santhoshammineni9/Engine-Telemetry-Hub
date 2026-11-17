import React from 'react';
import { CalculationResult } from '../types/engine';
import { SENSOR_CONFIGS } from '../utils/engineMath';
import { BarChart2, Info } from 'lucide-react';

interface ContributionChartProps {
  result: CalculationResult;
}

export const ContributionChart: React.FC<ContributionChartProps> = ({ result }) => {
  const { contributions, zScores, rawArray } = result;

  // Max absolute contribution for scaling bars
  const maxAbs = Math.max(
    ...contributions.map((c) => Math.abs(c)),
    1.5 // minimum scale floor
  );

  return (
    <div className="hud-panel rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-sky-400" />
          <h2 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
            Per-Sensor Feature Risk Contributions (βⱼ · zⱼ)
          </h2>
        </div>
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
          <span className="text-emerald-400 font-semibold">+ Increases Healthy Prob</span>
          <span>·</span>
          <span className="text-rose-400 font-semibold">- Accelerates Fault Risk</span>
        </div>
      </div>

      <div className="space-y-3.5">
        {SENSOR_CONFIGS.map((cfg) => {
          const val = contributions[cfg.index];
          const z = zScores[cfg.index];
          const raw = rawArray[cfg.index];
          const isPositive = val >= 0;

          // Normalized width from center (0 to 50%)
          const widthPercent = Math.min(50, (Math.abs(val) / maxAbs) * 50);

          return (
            <div key={cfg.id} className="text-xs">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold tracking-wide text-slate-100">{cfg.label}</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {raw.toFixed(1)} {cfg.unit}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    (β={cfg.coefficient >= 0 ? `+${cfg.coefficient.toFixed(2)}` : cfg.coefficient.toFixed(2)}, OR={cfg.oddsRatio.toFixed(2)})
                  </span>
                </div>
                <div className="font-mono tabular-nums font-bold flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-normal">
                    z={z >= 0 ? `+${z.toFixed(2)}` : z.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {val >= 0 ? `+${val.toFixed(3)}` : val.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Divergent Center-Aligned Tactical Bar Track */}
              <div className="relative h-4 bg-[#050811] rounded-sm border border-slate-700/80 overflow-hidden flex items-center">
                {/* Tactical Quarter Gridlines */}
                <div className="absolute left-1/4 top-0 bottom-0 w-px bg-slate-800/80 z-10" />
                <div className="absolute left-3/4 top-0 bottom-0 w-px bg-slate-800/80 z-10" />
                {/* Center Zero Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-sky-400/50 z-10" />

                {isPositive ? (
                  /* Positive Bar (Grows Right from Center) */
                  <div
                    className="absolute left-1/2 h-full bg-emerald-500/85 border-l border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.45)]"
                    style={{
                      width: `${widthPercent}%`,
                      transition: 'width 250ms ease-out',
                    }}
                  />
                ) : (
                  /* Negative Bar (Grows Left from Center) */
                  <div
                    className="absolute right-1/2 h-full bg-rose-500/85 border-r border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.45)]"
                    style={{
                      width: `${widthPercent}%`,
                      transition: 'width 250ms ease-out',
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
        <p>
          Calculated via trained Newton-Raphson logistic regression coefficients. Note that Fuel Pressure has the highest positive odds ratio (4.01), protecting health, whereas Engine RPM has the strongest negative coefficient (-2.71), driving acute deterioration under high speeds.
        </p>
      </div>
    </div>
  );
};
