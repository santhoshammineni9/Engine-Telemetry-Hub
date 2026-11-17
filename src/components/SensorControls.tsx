import React, { useState, useEffect, useRef } from 'react';
import { SensorInputs } from '../types/engine';
import { PRESETS, SENSOR_CONFIGS } from '../utils/engineMath';
import {
  Sliders,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Timer,
  Activity,
} from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface SensorControlsProps {
  sensors: SensorInputs;
  onChangeSensor: (key: keyof SensorInputs, val: number) => void;
  onSetAllSensors?: (sensors: SensorInputs) => void;
  onSelectPreset: (presetValues: [number, number, number, number, number, number]) => void;
  activePresetId: string | null;
  zScores: number[];
  rul?: number;
  rulHours?: number;
  rulPercent?: number;
}

type SimulationScenario = 'lifecycle' | 'thermal' | 'rpm_stress';

interface ScenarioDef {
  id: SimulationScenario;
  label: string;
  description: string;
  start: SensorInputs;
  end: SensorInputs;
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: 'lifecycle',
    label: 'Progressive Wear Lifecycle (H → M → C → F)',
    description: 'Models multi-cycle duty wear: RPM climbs, fuel/oil pressures degrade, and thermal friction builds across 20 iterations.',
    start: {
      rpm: 600,
      lubOilPressure: 3.45,
      fuelPressure: 10.5,
      coolantPressure: 2.15,
      lubOilTemp: 76.2,
      coolantTemp: 77.0,
    },
    end: {
      rpm: 1350,
      lubOilPressure: 2.15,
      fuelPressure: 4.8,
      coolantPressure: 2.65,
      lubOilTemp: 84.8,
      coolantTemp: 86.5,
    },
  },
  {
    id: 'thermal',
    label: 'Cooling Failure & Thermal Runaway',
    description: 'Rapid radiator jacket fouling: coolant and oil temperatures surge past 88°C, triggering catastrophic State 3 failure.',
    start: {
      rpm: 780,
      lubOilPressure: 3.25,
      fuelPressure: 6.8,
      coolantPressure: 2.20,
      lubOilTemp: 76.5,
      coolantTemp: 77.2,
    },
    end: {
      rpm: 1100,
      lubOilPressure: 2.30,
      fuelPressure: 5.6,
      coolantPressure: 3.40,
      lubOilTemp: 88.5,
      coolantTemp: 94.0,
    },
  },
  {
    id: 'rpm_stress',
    label: 'High-RPM Overspeed Cavitation',
    description: 'Uncontrolled throttle surge past 1,800 RPM: boundary oil film collapses and fuel pressure collapses.',
    start: {
      rpm: 650,
      lubOilPressure: 3.50,
      fuelPressure: 8.5,
      coolantPressure: 2.10,
      lubOilTemp: 75.8,
      coolantTemp: 76.5,
    },
    end: {
      rpm: 1950,
      lubOilPressure: 1.85,
      fuelPressure: 3.9,
      coolantPressure: 2.90,
      lubOilTemp: 86.0,
      coolantTemp: 88.0,
    },
  },
];

export const SensorControls: React.FC<SensorControlsProps> = ({
  sensors,
  onChangeSensor,
  onSetAllSensors,
  onSelectPreset,
  activePresetId,
  zScores,
  rul,
  rulHours,
  rulPercent,
}) => {
  // Simulation Run State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simIteration, setSimIteration] = useState<number>(0);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>('lifecycle');
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 4x

  const totalIterations = 20;
  const isSimulatingRef = useRef<boolean>(false);
  const simIterationRef = useRef<number>(0);

  // Keep refs in sync for timer callbacks
  useEffect(() => {
    isSimulatingRef.current = isSimulating;
  }, [isSimulating]);

  useEffect(() => {
    simIterationRef.current = simIteration;
  }, [simIteration]);

  // Execute time-based sensor drift simulation
  useEffect(() => {
    if (!isSimulating) return;

    const scenario = SCENARIOS.find((s) => s.id === selectedScenario) || SCENARIOS[0];
    const baseIntervalMs = 900 / simSpeed; // 900ms at 1x, 450ms at 2x, 225ms at 4x

    const timer = setInterval(() => {
      setSimIteration((prev) => {
        const next = prev + 1;
        if (next > totalIterations) {
          // Complete run or loop
          setIsSimulating(false);
          return totalIterations;
        }

        // Interpolate fraction t in [0, 1]
        const t = next / totalIterations;

        // Non-linear wear acceleration (wear accelerates exponentially as parts degrade)
        const wearCurve = Math.pow(t, 1.35);

        // Calculate interpolated values with realistic stochastic telemetry jitter
        const jitter = () => (Math.random() - 0.5) * 0.04;
        const rpmJitter = Math.round((Math.random() - 0.5) * 12);

        const newRpm = Math.round(
          scenario.start.rpm + (scenario.end.rpm - scenario.start.rpm) * wearCurve + rpmJitter
        );
        const newLubOilPressure = parseFloat(
          Math.max(
            0.5,
            scenario.start.lubOilPressure +
              (scenario.end.lubOilPressure - scenario.start.lubOilPressure) * wearCurve +
              jitter()
          ).toFixed(2)
        );
        const newFuelPressure = parseFloat(
          Math.max(
            1.0,
            scenario.start.fuelPressure +
              (scenario.end.fuelPressure - scenario.start.fuelPressure) * wearCurve +
              jitter() * 2
          ).toFixed(2)
        );
        const newCoolantPressure = parseFloat(
          Math.max(
            0.5,
            scenario.start.coolantPressure +
              (scenario.end.coolantPressure - scenario.start.coolantPressure) * wearCurve +
              jitter()
          ).toFixed(2)
        );
        const newLubOilTemp = parseFloat(
          (
            scenario.start.lubOilTemp +
            (scenario.end.lubOilTemp - scenario.start.lubOilTemp) * wearCurve +
            jitter() * 2
          ).toFixed(1)
        );
        const newCoolantTemp = parseFloat(
          (
            scenario.start.coolantTemp +
            (scenario.end.coolantTemp - scenario.start.coolantTemp) * wearCurve +
            jitter() * 2
          ).toFixed(1)
        );

        const newSensors: SensorInputs = {
          rpm: Math.max(60, Math.min(2240, newRpm)),
          lubOilPressure: Math.max(0, Math.min(7.5, newLubOilPressure)),
          fuelPressure: Math.max(0, Math.min(21.5, newFuelPressure)),
          coolantPressure: Math.max(0, Math.min(7.5, newCoolantPressure)),
          lubOilTemp: Math.max(71.0, Math.min(90.0, newLubOilTemp)),
          coolantTemp: Math.max(61.0, Math.min(96.0, newCoolantTemp)),
        };

        if (onSetAllSensors) {
          onSetAllSensors(newSensors);
        } else {
          onChangeSensor('rpm', newSensors.rpm);
          onChangeSensor('lubOilPressure', newSensors.lubOilPressure);
          onChangeSensor('fuelPressure', newSensors.fuelPressure);
          onChangeSensor('coolantPressure', newSensors.coolantPressure);
          onChangeSensor('lubOilTemp', newSensors.lubOilTemp);
          onChangeSensor('coolantTemp', newSensors.coolantTemp);
        }

        return next;
      });
    }, baseIntervalMs);

    return () => clearInterval(timer);
  }, [isSimulating, selectedScenario, simSpeed, onSetAllSensors, onChangeSensor]);

  const handleStartSim = () => {
    soundFx.playClick(780, 0.06, 0.045);
    // If starting from fresh or completed run, initialize to scenario start
    if (simIteration >= totalIterations || simIteration === 0) {
      const scenario = SCENARIOS.find((s) => s.id === selectedScenario) || SCENARIOS[0];
      setSimIteration(0);
      if (onSetAllSensors) {
        onSetAllSensors({ ...scenario.start });
      }
    }
    setIsSimulating(true);
  };

  const handlePauseSim = () => {
    soundFx.playClick(480, 0.05, 0.04);
    setIsSimulating(false);
  };

  const handleResetSim = () => {
    soundFx.playClick(420, 0.06, 0.04);
    setIsSimulating(false);
    setSimIteration(0);
    const scenario = SCENARIOS.find((s) => s.id === selectedScenario) || SCENARIOS[0];
    if (onSetAllSensors) {
      onSetAllSensors({ ...scenario.start });
    }
  };

  return (
    <div className="hud-panel rounded-xl p-5 h-full">
      {/* Header and Presets Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h2 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
              Engine Telemetry Channels
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            6 calibrated telemetry streams feeding standardized Newton-Raphson IRLS logistic core
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Presets:
          </span>
          {PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id && !isSimulating;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  soundFx.playClick(700, 0.045, 0.04);
                  setIsSimulating(false);
                  onSelectPreset(preset.values);
                }}
                className={`hud-chamfer px-3 py-1 text-xs font-display tracking-wide uppercase transition-all duration-150 whitespace-nowrap cursor-pointer active:scale-[0.97] ${
                  isActive
                    ? 'bg-sky-500/25 text-sky-200 border border-sky-400/70 font-bold shadow-[0_0_14px_rgba(56,189,248,0.28)]'
                    : 'bg-slate-900/95 text-slate-300 border border-slate-700/80 hover:border-sky-500/40 hover:text-white'
                }`}
                title={preset.subtitle}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* SIMULATED RUN TIME-BASED DRIFT CONTROL DECK */}
      <div className="hud-subpanel p-3.5 rounded-xl mb-5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Simulation Title & Scenario Selector */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-display font-bold text-slate-100">
              <Activity className={`w-4 h-4 ${isSimulating ? 'text-amber-400 animate-pulse' : 'text-sky-400'}`} />
              <span className="uppercase tracking-wider">Time-Based Drift Simulation:</span>
            </div>

            <select
              value={selectedScenario}
              onChange={(e) => {
                soundFx.playClick(600, 0.04, 0.035);
                const newScen = e.target.value as SimulationScenario;
                setSelectedScenario(newScen);
                setIsSimulating(false);
                setSimIteration(0);
                const s = SCENARIOS.find((item) => item.id === newScen);
                if (s && onSetAllSensors) onSetAllSensors({ ...s.start });
              }}
              disabled={isSimulating}
              className="bg-[#050811] border border-slate-700/90 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-sky-400 font-sans"
            >
              {SCENARIOS.map((scen) => (
                <option key={scen.id} value={scen.id}>
                  {scen.label}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Simulation Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Speed Selector */}
            <div className="flex items-center bg-[#050811] p-0.5 rounded border border-slate-800 text-[11px] font-mono">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => {
                    soundFx.playClick(640 + spd * 40, 0.035, 0.03);
                    setSimSpeed(spd);
                  }}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    simSpeed === spd
                      ? 'bg-sky-500/25 text-sky-300 font-bold border border-sky-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Start / Pause Button */}
            {!isSimulating ? (
              <button
                type="button"
                onClick={handleStartSim}
                className="hud-chamfer px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/60 text-white text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_16px_rgba(16,185,129,0.28)] cursor-pointer active:scale-[0.97]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{simIteration > 0 && simIteration < totalIterations ? 'Resume Simulation' : 'Start Simulated Run'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseSim}
                className="hud-chamfer px-4 py-1.5 bg-amber-600 hover:bg-amber-500 border border-amber-400/60 text-white text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_16px_rgba(245,158,11,0.28)] cursor-pointer active:scale-[0.97]"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Simulation</span>
              </button>
            )}

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetSim}
              className="hud-chamfer px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/90 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer active:scale-[0.97]"
              title="Reset simulation to cycle 0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Progress & State Transition Ticker Bar */}
        <div className="pt-2 border-t border-slate-800/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-slate-400 mb-1.5 gap-2">
            <span className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-sky-400" />
              <span>Simulation Duty Cycle:</span>
              <strong className="text-slate-100 font-bold tabular-nums">
                Iteration {simIteration} / {totalIterations}
              </strong>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-cyan-300 font-semibold bg-cyan-950/50 border border-cyan-500/45 px-2.5 py-0.5 rounded">
                Remaining Useful Life (RUL): {(rul ?? (12.08 * (1 - simIteration / totalIterations))).toFixed(2)} cycles (~{(rulHours ?? Math.round((rul ?? 12) * 250)).toLocaleString()} hrs)
              </span>
            </div>
          </div>

          {/* Stepped Progress Track with State Boundaries */}
          <div className="relative h-3 bg-[#050811] rounded-sm border border-slate-700/90 overflow-hidden">
            {/* Color-coded State Zones Underlay */}
            <div className="absolute inset-0 flex opacity-45">
              <div className="w-[35%] bg-emerald-500/25 border-r border-emerald-400/50" title="State 0: Healthy" />
              <div className="w-[25%] bg-sky-500/25 border-r border-sky-400/50" title="State 1: Moderate Risk" />
              <div className="w-[20%] bg-amber-500/25 border-r border-amber-400/50" title="State 2: Critical Edge" />
              <div className="w-[20%] bg-rose-500/25" title="State 3: Failed" />
            </div>

            {/* Active Progress Fill */}
            <div
              className={`h-full transition-all duration-300 ${
                simIteration < 7
                  ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.65)]'
                  : simIteration < 12
                  ? 'bg-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.65)]'
                  : simIteration < 16
                  ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.65)]'
                  : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.65)]'
              }`}
              style={{ width: `${(simIteration / totalIterations) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span className="text-emerald-400">Cycle 0: State H (Nominal)</span>
            <span className="text-sky-400">Cycle 7: State M (Moderate)</span>
            <span className="text-amber-400">Cycle 12: State C (Critical)</span>
            <span className="text-rose-400">Cycle 16-20: State F (Failure)</span>
          </div>
        </div>
      </div>

      {/* 6 Sensor Slider Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SENSOR_CONFIGS.map((cfg) => {
          const currentValue = sensors[cfg.id];
          const z = zScores[cfg.index];
          // Determine if value is outside nominal range
          const isOutlier = currentValue < cfg.nominalRange[0] || currentValue > cfg.nominalRange[1];

          return (
            <div
              key={cfg.id}
              className={`hud-subpanel p-3.5 rounded-lg transition-all ${
                isOutlier
                  ? 'border-amber-500/50 shadow-[0_0_16px_rgba(245,158,11,0.12)]'
                  : isSimulating
                  ? 'border-sky-400/45 shadow-[0_0_14px_rgba(56,189,248,0.12)]'
                  : 'hover:border-sky-500/40'
              }`}
            >
              {/* Sensor Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-xs font-bold tracking-wide text-slate-100">{cfg.label}</span>
                    <span className="text-[10px] font-mono text-slate-400">({cfg.unit})</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Mean: {cfg.mean.toFixed(2)} · Std: {cfg.std.toFixed(2)}
                  </div>
                </div>

                {/* Direct Numeric Input */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={cfg.min}
                    max={cfg.max}
                    step={cfg.step}
                    value={currentValue}
                    onChange={(e) => {
                      setIsSimulating(false);
                      const num = parseFloat(e.target.value);
                      if (!isNaN(num)) {
                        const clamped = Math.max(cfg.min, Math.min(cfg.max, num));
                        onChangeSensor(cfg.id, clamped);
                      }
                    }}
                    className="w-20 px-2 py-1 text-right font-mono text-xs font-bold text-sky-300 bg-[#050811] border border-sky-500/40 rounded focus:border-sky-400 focus:outline-none shadow-inner"
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-6">{cfg.unit}</span>
                </div>
              </div>

              {/* Slider Track */}
              <div className="relative my-2.5">
                <input
                  type="range"
                  min={cfg.min}
                  max={cfg.max}
                  step={cfg.step}
                  value={currentValue}
                  onChange={(e) => {
                    setIsSimulating(false);
                    onChangeSensor(cfg.id, parseFloat(e.target.value));
                  }}
                  className="hud-slider w-full cursor-pointer"
                />
                {/* Nominal Range Visual Underlay */}
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1.5">
                  <span>{cfg.min}</span>
                  <span className="text-slate-400">
                    Nominal: {cfg.nominalRange[0]} - {cfg.nominalRange[1]}
                  </span>
                  <span>{cfg.max}</span>
                </div>
              </div>

              {/* Standardized Metric Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-mono">
                <span className="text-slate-400">
                  Standardized z:
                  <span className={`ml-1 font-semibold ${Math.abs(z) > 1.5 ? 'text-amber-400' : 'text-slate-200'}`}>
                    {z >= 0 ? `+${z.toFixed(2)}` : z.toFixed(2)}σ
                  </span>
                </span>
                <span className={`text-[10px] font-semibold ${isOutlier ? 'text-amber-400' : 'text-emerald-400/90'}`}>
                  {isOutlier ? 'Exceeds Nominal' : 'In Envelope'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
