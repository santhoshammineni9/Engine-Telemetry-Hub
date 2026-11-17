import React, { useState } from 'react';
import { CalculationResult } from '../types/engine';
import { SENSOR_CONFIGS, MODEL_PARAMS } from '../utils/engineMath';
import { Calculator, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface MathematicalBreakdownProps {
  result: CalculationResult;
}

export const MathematicalBreakdown: React.FC<MathematicalBreakdownProps> = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const { rawArray, zScores, contributions, logOdds, pHealthy, predictedCondition, intercept } = result;

  return (
    <div className="hud-panel rounded-xl overflow-hidden">
      {/* Header with Accordion Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-sky-400" />
          <h2 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
            Step-by-Step Mathematical Derivation (Newton-Raphson IRLS)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-sky-300 font-mono">
          <span>{isExpanded ? 'Collapse Proof' : 'Expand Live Proof'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 border-t border-slate-800/80 space-y-5">
          {/* Section 1: Standardization Scaler Table */}
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2 flex items-center justify-between">
              <span>Step 1: Feature Standardization zⱼ = (xⱼ - μⱼ) / σⱼ</span>
              <span className="text-[11px] font-mono text-slate-400 font-normal">
                Standardized on 12,164 training records
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-800/80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0e1422] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Feature (j)</th>
                    <th className="py-2 px-3">Raw xⱼ</th>
                    <th className="py-2 px-3">Mean μⱼ</th>
                    <th className="py-2 px-3">Std Dev σⱼ</th>
                    <th className="py-2 px-3 text-sky-400 font-bold">Standardized zⱼ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                  {SENSOR_CONFIGS.map((cfg) => {
                    const raw = rawArray[cfg.index];
                    const z = zScores[cfg.index];
                    return (
                      <tr key={cfg.id} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 text-slate-300 font-medium">
                          {cfg.index}: {cfg.label}
                        </td>
                        <td className="py-2 px-3 text-slate-200 tabular-nums">
                          {raw.toFixed(2)} {cfg.unit}
                        </td>
                        <td className="py-2 px-3 text-slate-400 tabular-nums">{cfg.mean.toFixed(4)}</td>
                        <td className="py-2 px-3 text-slate-400 tabular-nums">{cfg.std.toFixed(4)}</td>
                        <td className="py-2 px-3 text-sky-400 font-bold tabular-nums">
                          {z >= 0 ? `+${z.toFixed(4)}` : z.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Log-Odds Linear Combination */}
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2">
              Step 2: Linear Predictor Formulation (Log-Odds = β₀ + Σ βⱼ · zⱼ)
            </div>
            <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-lg font-mono text-xs text-slate-300 space-y-2">
              <div className="text-slate-400">
                Log-Odds = <span className="text-amber-400 font-bold">β₀ (2.6417)</span>
                {SENSOR_CONFIGS.map((cfg) => {
                  const beta = cfg.coefficient;
                  const z = zScores[cfg.index];
                  const sign = beta >= 0 ? '+' : '-';
                  return (
                    <span key={cfg.id}>
                      {' '}{sign} ({Math.abs(beta).toFixed(4)} × {z >= 0 ? `+${z.toFixed(2)}` : z.toFixed(2)})
                    </span>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Sum of Partial Contributions:</span>
                <span className="font-bold text-slate-200 tabular-nums">
                  {(logOdds - intercept >= 0 ? `+${(logOdds - intercept).toFixed(4)}` : (logOdds - intercept).toFixed(4))}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-bold">Resulting Log-Odds (η):</span>
                <span className="font-bold text-sky-400 tabular-nums text-sm">
                  {logOdds >= 0 ? `+${logOdds.toFixed(4)}` : logOdds.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Logistic Sigmoid Activation & Binary Classification */}
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2">
              Step 3: Logistic Sigmoid Mapping P(Healthy) = 1 / (1 + e⁻η)
            </div>
            <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-lg font-mono text-xs space-y-2">
              <div className="text-slate-300">
                P(Healthy) = 1 / (1 + exp(-({logOdds.toFixed(4)}))) ={' '}
                <span className="text-sky-400 font-bold text-sm">
                  {pHealthy.toFixed(6)}
                </span>{' '}
                ({(pHealthy * 100).toFixed(2)}%)
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-slate-400">
                  Decision Threshold: τ = 0.50 (Healthy if P ≥ 0.50)
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  {predictedCondition === 1 ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Class 1 (Healthy Engine)
                    </span>
                  ) : (
                    <span className="text-rose-400">
                      Class 0 (Faulty / Maintenance Required)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
