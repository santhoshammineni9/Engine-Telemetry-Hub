import React from 'react';
import { MarkovStateCode, SensorInputs, TelemetryLogEntry } from '../types/engine';
import { ScrollText, ArrowRight, Trash2, RotateCcw } from 'lucide-react';

interface TelemetryLogProps {
  logs: TelemetryLogEntry[];
  onClearLogs: () => void;
  onRestoreSnapshot?: (sensors: SensorInputs) => void;
}

const STATE_STYLES: Record<
  MarkovStateCode,
  { badge: string; text: string; label: string }
> = {
  H: {
    badge: 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300',
    text: 'text-emerald-400',
    label: 'S0: Healthy',
  },
  M: {
    badge: 'bg-amber-950/50 border-amber-500/40 text-amber-300',
    text: 'text-amber-400',
    label: 'S1: Moderate',
  },
  C: {
    badge: 'bg-orange-950/50 border-orange-500/40 text-orange-300',
    text: 'text-orange-400',
    label: 'S2: Critical',
  },
  F: {
    badge: 'bg-rose-950/50 border-rose-500/40 text-rose-300',
    text: 'text-rose-400',
    label: 'S3: Failed',
  },
};

export const TelemetryLog: React.FC<TelemetryLogProps> = ({
  logs,
  onClearLogs,
  onRestoreSnapshot,
}) => {
  const transitionCount = logs.filter((entry) => entry.isTransition).length;

  return (
    <div className="hud-panel rounded-xl overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-800/80 bg-[#0a1120]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 hud-chamfer bg-sky-500/15 border border-sky-400/50 flex items-center justify-center text-sky-300 shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
            <ScrollText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
                Telemetry Log
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-400/40 text-emerald-300 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rolling FIFO buffer recording the last 10 sensor reading snapshots and Markov state transitions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <span className="px-2.5 py-1 rounded bg-[#050811] border border-slate-800 text-slate-300 tabular-nums">
            Buffer: <strong className="text-sky-400">{logs.length}</strong> / 10
          </span>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-[#050811] border border-slate-800 text-slate-300 tabular-nums">
            Transitions: <strong className="text-amber-400">{transitionCount}</strong>
          </span>
          <button
            type="button"
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="hud-chamfer flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-rose-400/50 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
            title="Clear telemetry log buffer"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Scrollable Snapshot Table */}
      <div className="max-h-[320px] overflow-y-auto overflow-x-auto bg-slate-950/60">
        {logs.length === 0 ? (
          <div className="py-10 text-center text-xs font-mono text-slate-500">
            Log cleared. Adjust any sensor slider, select a preset, or run a simulation to record snapshots.
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="sticky top-0 z-10 bg-[#0e1422] text-slate-400 border-b border-slate-800 shadow-sm">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">#</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Time</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">RPM</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Oil Press</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Fuel Press</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Coolant Press</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Oil / Cool °C</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">P(Healthy)</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Markov State Transition</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">RUL</th>
                {onRestoreSnapshot && (
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((entry, idx) => {
                const currStyle = STATE_STYLES[entry.markovStateCode];
                const prevStyle = entry.prevMarkovStateCode
                  ? STATE_STYLES[entry.prevMarkovStateCode]
                  : null;
                const isLatest = idx === 0;

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors hover:bg-slate-900/60 ${
                      entry.isTransition
                        ? 'bg-amber-950/15'
                        : isLatest
                        ? 'bg-sky-950/15'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-400 tabular-nums whitespace-nowrap">
                      <span className={isLatest ? 'text-sky-400 font-bold' : ''}>
                        #{String(entry.seq).padStart(3, '0')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 tabular-nums whitespace-nowrap">
                      {entry.timestamp}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-100 font-semibold tabular-nums whitespace-nowrap">
                      {entry.sensors.rpm}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums whitespace-nowrap">
                      {entry.sensors.lubOilPressure.toFixed(2)} <span className="text-slate-500">bar</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums whitespace-nowrap">
                      {entry.sensors.fuelPressure.toFixed(2)} <span className="text-slate-500">bar</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums whitespace-nowrap">
                      {entry.sensors.coolantPressure.toFixed(2)} <span className="text-slate-500">bar</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums whitespace-nowrap">
                      {entry.sensors.lubOilTemp.toFixed(1)} / {entry.sensors.coolantTemp.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold whitespace-nowrap">
                      <span className={currStyle.text}>
                        {(entry.pHealthy * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {entry.isTransition && prevStyle && entry.prevMarkovStateCode ? (
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded border text-[11px] font-semibold ${prevStyle.badge}`}
                          >
                            {entry.prevMarkovStateCode}
                          </span>
                          <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                          <span
                            className={`px-2 py-0.5 rounded border text-[11px] font-bold ${currStyle.badge}`}
                          >
                            {currStyle.label}
                          </span>
                          <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider ml-1">
                            Shift
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${currStyle.badge}`}
                          >
                            {currStyle.label}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {entry.prevMarkovStateCode ? 'Hold' : 'Init'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200 tabular-nums whitespace-nowrap">
                      {entry.rul.toFixed(2)} <span className="text-slate-500">cyc</span>
                    </td>
                    {onRestoreSnapshot && (
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onRestoreSnapshot(entry.sensors)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-[10px] text-slate-300 hover:text-sky-300 hover:border-sky-500/40 transition-colors cursor-pointer"
                          title="Load these sensor values into the console"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Load</span>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
