import React, { useState } from 'react';
import { CalculationResult } from '../types/engine';
import {
  P_ABS,
  Q_ABS,
  INITIAL_PI_0,
  MARKOV_STATES,
  computeTrajectory,
  matrixPower,
  vectorMatrixMultiply,
} from '../utils/engineMath';
import { ERGODIC_MODEL_SPECS } from '../data/benchmarkData';
import { Activity, GitBranch, Layers, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

interface MarkovStudioProps {
  result: CalculationResult;
}

export const MarkovStudio: React.FC<MarkovStudioProps> = ({ result }) => {
  const [selectedInitialState, setSelectedInitialState] = useState<number>(result.markovState);
  const [activeCycleTab, setActiveCycleTab] = useState<number>(5);

  // Calculate multi-cycle trajectory starting from selected initial state
  const trajectory = computeTrajectory(selectedInitialState, [0, 1, 2, 3, 5, 10, 15, 20]);

  // Compute specific P^n matrices for n = 1, 5, 10, 20
  const p1 = P_ABS;
  const p5 = matrixPower(P_ABS, 5);
  const p10 = matrixPower(P_ABS, 10);
  const p20 = matrixPower(P_ABS, 20);

  const selectedMatrix =
    activeCycleTab === 1 ? p1 : activeCycleTab === 5 ? p5 : activeCycleTab === 10 ? p10 : p20;

  // Calculate state probability vector for selected cycle
  const initialVector = [0, 0, 0, 0];
  initialVector[selectedInitialState] = 1.0;
  const cycleProbVector = vectorMatrixMultiply(initialVector, selectedMatrix);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="hud-panel rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-400" />
              <h1 className="font-display text-base font-bold text-slate-100 tracking-wider uppercase">
                4-State Absorbing Markov Deterioration Engine
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Stochastic modeling of engine wear dynamics based on logistic health probability thresholds
            </p>
          </div>

          {/* Current Engine State Badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Current Sensor State:</span>
            <div
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-mono text-xs font-bold ${
                MARKOV_STATES[result.markovState].bgLight
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MARKOV_STATES[result.markovState].color }} />
              State {result.markovState} ({result.markovStateCode} - {result.markovStateName})
            </div>
          </div>
        </div>

        {/* 4 State Threshold Reference Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {MARKOV_STATES.map((st) => {
            const isCurrent = result.markovState === st.index;
            const isSelected = selectedInitialState === st.index;

            return (
              <div
                key={st.code}
                onClick={() => setSelectedInitialState(st.index)}
                className={`hud-subpanel p-3.5 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-sky-400/75 shadow-[0_0_16px_rgba(56,189,248,0.22)] ring-1 ring-sky-400/40'
                    : 'hover:border-sky-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono font-bold text-white"
                      style={{ backgroundColor: st.color }}
                    >
                      {st.code}
                    </span>
                    <span className="text-xs font-bold text-slate-200">State {st.index}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold">
                      Live Telemetry
                    </span>
                  )}
                </div>

                <div className="text-xs font-medium text-slate-300">{st.name}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">{st.threshold}</div>

                <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">MTTF:</span>
                  <span className="font-bold text-slate-200">{st.mttf.toFixed(2)} cycles</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Projection Trajectory & Matrix Powers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): State Distribution Evolution (P^n) */}
        <div className="lg:col-span-7 hud-panel rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-sky-400" />
                <h2 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
                  Degradation Trajectory: Pⁿ from State {selectedInitialState} ({MARKOV_STATES[selectedInitialState].code})
                </h2>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Absorbing State: 3 (F)
              </div>
            </div>

            {/* Trajectory Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-800/80 mb-5">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0e1422] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Duty Cycle (n)</th>
                    <th className="py-2.5 px-3 text-emerald-400">P(H) [State 0]</th>
                    <th className="py-2.5 px-3 text-sky-400">P(M) [State 1]</th>
                    <th className="py-2.5 px-3 text-amber-400">P(C) [State 2]</th>
                    <th className="py-2.5 px-3 text-rose-400 font-bold">P(F) [Absorbed]</th>
                    <th className="py-2.5 px-3 text-cyan-300 font-bold bg-cyan-950/20">
                      Remaining Useful Life (RUL)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                  {trajectory.map((row) => (
                    <tr
                      key={row.cycle}
                      className={`hover:bg-slate-900/40 ${
                        row.cycle === activeCycleTab ? 'bg-sky-950/20 font-bold' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-200">
                        Cycle n = {row.cycle}
                        {row.cycle === 0 && ' (Initial State)'}
                      </td>
                      <td className="py-2 px-3 text-emerald-400 tabular-nums">
                        {(row.p[0] * 100).toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 text-sky-400 tabular-nums">
                        {(row.p[1] * 100).toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 text-amber-400 tabular-nums">
                        {(row.p[2] * 100).toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 text-rose-400 font-bold tabular-nums">
                        {(row.p[3] * 100).toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 text-cyan-300 font-bold tabular-nums bg-cyan-950/15">
                        {row.rul.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">cycles</span>{' '}
                        <span className="text-[10px] text-cyan-400/80 font-normal">
                          (~{row.rulHours.toLocaleString()} hrs · {row.rulPercent.toFixed(0)}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visual Progress Stacks for n = 1, 5, 10, 20 */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">
                Probability Stack Breakdown over Operation Cycles:
              </div>
              {[1, 5, 10, 20].map((c) => {
                const step = trajectory.find((t) => t.cycle === c) || trajectory[1];
                return (
                  <div key={c} className="text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1 font-mono text-[11px]">
                      <span>Cycle n = {c}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-300 font-semibold">
                          RUL: {step.rul.toFixed(2)} cycles (~{step.rulHours.toLocaleString()} hrs)
                        </span>
                        <span>·</span>
                        <span>
                          P(Failure) = <strong className="text-rose-400">{(step.p[3] * 100).toFixed(1)}%</strong>
                        </span>
                      </div>
                    </div>
                    {/* Stack Bar */}
                    <div className="h-3.5 bg-slate-900 rounded overflow-hidden flex border border-slate-800">
                      <div
                        style={{ width: `${step.p[0] * 100}%` }}
                        className="bg-emerald-500/80 transition-all"
                        title={`Healthy: ${(step.p[0] * 100).toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${step.p[1] * 100}%` }}
                        className="bg-sky-500/80 transition-all"
                        title={`Moderate Risk: ${(step.p[1] * 100).toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${step.p[2] * 100}%` }}
                        className="bg-amber-500/80 transition-all"
                        title={`Critical: ${(step.p[2] * 100).toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${step.p[3] * 100}%` }}
                        className="bg-rose-500/80 transition-all"
                        title={`Failed: ${(step.p[3] * 100).toFixed(1)}%`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Theoretical Empirical Vector Note */}
          <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Empirical Prior π(0):</span>
            <span className="text-slate-300">
              [{INITIAL_PI_0.map((v) => v.toFixed(4)).join(', ')}]
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Transition & Generator Matrices */}
        <div className="lg:col-span-5 space-y-6">
          {/* Matrix P^n Inspector */}
          <div className="hud-panel rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <h2 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
                  Matrix Exponentiation Pⁿ
                </h2>
              </div>

              {/* Cycle Tabs */}
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
                {[1, 5, 10, 20].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setActiveCycleTab(n)}
                    className={`px-2 py-0.5 text-xs font-mono rounded ${
                      activeCycleTab === n
                        ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    n={n}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="text-[11px] text-slate-400 mb-2">
                Absorbing Transition Matrix P^{activeCycleTab} (Rows sum to 1.00):
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {selectedMatrix.map((row, rIdx) =>
                  row.map((val, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`p-2 rounded border text-xs font-mono tabular-nums ${
                        rIdx === selectedInitialState
                          ? 'bg-sky-950/40 border-sky-500/40 text-sky-300 font-bold'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      {val.toFixed(4)}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                <span>Row sums Σ P(i,·) = 1.0000</span>
                <span className="text-sky-400">Row {selectedInitialState} Active</span>
              </div>
            </div>

            {/* Resulting vector for current state */}
            <div className="mt-3 p-2.5 bg-[#0e1422] rounded-lg border border-slate-800 text-[11px] font-mono">
              <span className="text-slate-400">Distribution at n={activeCycleTab}: </span>
              <span className="text-slate-200 font-bold">
                [{cycleProbVector.map((v) => (v * 100).toFixed(1) + '%').join(', ')}]
              </span>
            </div>
          </div>

          {/* Continuous-Time Generator Matrix Q_abs */}
          <div className="hud-panel rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="font-display text-xs font-bold text-slate-100 uppercase tracking-wider">
                Continuous Generator Q_abs = P_abs - I
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Row Sums = 0.00
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="grid grid-cols-4 gap-2 text-center">
                {Q_ABS.map((row, rIdx) =>
                  row.map((val, cIdx) => (
                    <div
                      key={`q-${rIdx}-${cIdx}`}
                      className={`p-1.5 rounded border text-xs font-mono tabular-nums ${
                        rIdx === cIdx
                          ? 'bg-rose-950/20 border-rose-800/40 text-rose-400 font-bold'
                          : val > 0
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Satisfies Kolmogorov backward equations: diagonals represent transition escape hazard, off-diagonals are non-negative rates.
            </div>
          </div>
        </div>
      </div>

      {/* Ergodic Repair Model & Availability */}
      <div className="hud-panel rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <h2 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
              Ergodic Closed-Loop Repair Model & Steady-State Availability
            </h2>
          </div>
          <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded border border-emerald-500/30">
            Steady-State Availability: {ERGODIC_MODEL_SPECS.steadyStateAvailability}%
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
          <div className="p-3 bg-[#0e1422] rounded-lg border border-slate-800/80">
            <div className="text-slate-400 font-mono text-[11px] mb-1">Repair Transition Rate (F → H)</div>
            <div className="text-lg font-mono font-bold text-slate-100">
              λ_repair = {ERGODIC_MODEL_SPECS.repairTransitionRateFtoH.toFixed(2)}
            </div>
            <div className="text-slate-400 text-[11px] mt-1">
              Engine overhaul restores unit directly from absorbing State 3 back into pristine State 0.
            </div>
          </div>

          <div className="p-3 bg-[#0e1422] rounded-lg border border-slate-800/80">
            <div className="text-slate-400 font-mono text-[11px] mb-1">Stationary Distribution π*</div>
            <div className="text-xs font-mono font-bold text-slate-200">
              [{ERGODIC_MODEL_SPECS.stationaryDistribution.map((v) => (v * 100).toFixed(2) + '%').join(', ')}]
            </div>
            <div className="text-slate-400 text-[11px] mt-1">
              Satisfies π* · P_ergodic = π*, proving system ergodicity and unique long-run limit.
            </div>
          </div>

          <div className="p-3 bg-[#0e1422] rounded-lg border border-slate-800/80">
            <div className="text-slate-400 font-mono text-[11px] mb-1">Operational Duty Uptime</div>
            <div className="text-lg font-mono font-bold text-emerald-400">
              91.27% Availability
            </div>
            <div className="text-slate-400 text-[11px] mt-1">
              Aggregated probability π*(H) + π*(M) + π*(C) where engine remains online in active service.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
