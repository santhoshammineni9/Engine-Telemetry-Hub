/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MarkovStateCode, SensorInputs, TelemetryLogEntry } from './types/engine';
import { calculateEngineHealth, PRESETS } from './utils/engineMath';
import { Header, NavTab } from './components/Header';
import { SensorControls } from './components/SensorControls';
import { DiagnosticGauge } from './components/DiagnosticGauge';
import { ContributionChart } from './components/ContributionChart';
import { MathematicalBreakdown } from './components/MathematicalBreakdown';
import { TelemetryLog } from './components/TelemetryLog';
import { MarkovStudio } from './components/MarkovStudio';
import { BenchmarkView } from './components/BenchmarkView';
import { ProjectDossier } from './components/ProjectDossier';
import { AiAdvisoryModal } from './components/AiAdvisoryModal';
import { Engine3DScene } from './components/Engine3DScene';
import { DiagnosticChat } from './components/DiagnosticChat';
import { UserGuideModal } from './components/UserGuideModal';
import { soundFx } from './utils/soundFx';

const DEFAULT_SENSORS: SensorInputs = {
  rpm: 750,
  lubOilPressure: 3.14,
  fuelPressure: 6.21,
  coolantPressure: 2.19,
  lubOilTemp: 76.8,
  coolantTemp: 78.3,
};

export default function App() {
  const [sensors, setSensors] = useState<SensorInputs>(DEFAULT_SENSORS);
  const [activeTab, setActiveTab] = useState<NavTab>('console');
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isHudMuted, setIsHudMuted] = useState<boolean>(false);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLogEntry[]>([]);

  const seqRef = useRef<number>(0);
  const prevMarkovStateRef = useRef<MarkovStateCode | null>(null);
  const lastLoggedSigRef = useRef<string>('');
  const logTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Deterministic 100% accurate client-side evaluation
  const result = useMemo(() => calculateEngineHealth(sensors), [sensors]);

  const recordSnapshot = useCallback((snapshotResult: typeof result) => {
    const sig = snapshotResult.rawArray.join('|');
    if (sig === lastLoggedSigRef.current) return;

    lastLoggedSigRef.current = sig;
    seqRef.current += 1;
    const prevState = prevMarkovStateRef.current;
    const isTransition = prevState !== null && prevState !== snapshotResult.markovStateCode;
    prevMarkovStateRef.current = snapshotResult.markovStateCode;

    if (isTransition) {
      soundFx.playStateAlert(snapshotResult.markovState >= 2);
    }

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const entry: TelemetryLogEntry = {
      id: `log-${seqRef.current}-${now.getTime()}`,
      seq: seqRef.current,
      timestamp,
      sensors: { ...snapshotResult.sensors },
      pHealthy: snapshotResult.pHealthy,
      predictedCondition: snapshotResult.predictedCondition,
      markovState: snapshotResult.markovState,
      markovStateCode: snapshotResult.markovStateCode,
      markovStateName: snapshotResult.markovStateName,
      prevMarkovStateCode: prevState,
      isTransition,
      mttf: snapshotResult.mttf,
      rul: snapshotResult.rul,
    };

    setTelemetryLogs((prev) => [entry, ...prev].slice(0, 10));
  }, []);

  useEffect(() => {
    const sig = result.rawArray.join('|');
    if (sig === lastLoggedSigRef.current) return;

    if (logTimerRef.current) {
      clearTimeout(logTimerRef.current);
      logTimerRef.current = null;
    }

    const isInitial = prevMarkovStateRef.current === null;
    const isStateTransition =
      prevMarkovStateRef.current !== null &&
      prevMarkovStateRef.current !== result.markovStateCode;

    if (isInitial || isStateTransition) {
      recordSnapshot(result);
    } else {
      logTimerRef.current = setTimeout(() => {
        recordSnapshot(result);
      }, 160);
    }

    return () => {
      if (logTimerRef.current) {
        clearTimeout(logTimerRef.current);
        logTimerRef.current = null;
      }
    };
  }, [result, recordSnapshot]);

  const handleClearLogs = useCallback(() => {
    setTelemetryLogs([]);
    lastLoggedSigRef.current = '';
  }, []);

  // Identify if current values match any preset
  const activePresetId = useMemo(() => {
    const matched = PRESETS.find((p) => {
      return (
        p.values[0] === sensors.rpm &&
        p.values[1] === sensors.lubOilPressure &&
        p.values[2] === sensors.fuelPressure &&
        p.values[3] === sensors.coolantPressure &&
        p.values[4] === sensors.lubOilTemp &&
        p.values[5] === sensors.coolantTemp
      );
    });
    return matched ? matched.id : null;
  }, [sensors]);

  const handleSensorChange = (key: keyof SensorInputs, val: number) => {
    setSensors((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSelectPreset = (values: [number, number, number, number, number, number]) => {
    setSensors({
      rpm: values[0],
      lubOilPressure: values[1],
      fuelPressure: values[2],
      coolantPressure: values[3],
      lubOilTemp: values[4],
      coolantTemp: values[5],
    });
  };

  const handleResetSensors = () => {
    setSensors(DEFAULT_SENSORS);
  };

  const handleToggleMute = () => {
    setIsHudMuted((prev) => {
      const next = !prev;
      soundFx.setMuted(next);
      if (!next) {
        soundFx.playClick(760);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onResetSensors={handleResetSensors}
        onOpenGuide={() => setIsGuideOpen(true)}
        isMuted={isHudMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'console' && (
          <div className="space-y-6">
            {/* Top Row: Sensor Controls + Diagnostic Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 flex flex-col">
                <SensorControls
                  sensors={sensors}
                  onChangeSensor={handleSensorChange}
                  onSetAllSensors={setSensors}
                  onSelectPreset={handleSelectPreset}
                  activePresetId={activePresetId}
                  zScores={result.zScores}
                  rul={result.rul}
                  rulHours={result.rulHours}
                  rulPercent={result.rulPercent}
                />
              </div>

              <div className="lg:col-span-4 flex flex-col">
                <DiagnosticGauge
                  result={result}
                  onOpenAdvisory={() => setIsAdvisoryOpen(true)}
                />
              </div>
            </div>

            {/* Bottom Row: Per-Sensor Feature Risk Contributions */}
            <ContributionChart result={result} />

            {/* Step-by-Step Live Mathematical Proof Breakdown */}
            <MathematicalBreakdown result={result} />

            {/* Real-Time Telemetry Log (Last 10 Snapshots & State Transitions) */}
            <TelemetryLog
              logs={telemetryLogs}
              onClearLogs={handleClearLogs}
              onRestoreSnapshot={setSensors}
            />
          </div>
        )}

        {activeTab === 'dyno3d' && (
          <div className="space-y-6">
            <div className="hud-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-4 shadow-lg">
              <div>
                <h1 className="text-base font-display font-bold text-slate-100 tracking-wider uppercase">
                  Interactive 3D Engine Dyno Stage
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full Three.js procedural kinematics: reciprocating pistons, rotating crankshaft, and live thermal emissivity driven by telemetry
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hud-chamfer text-xs font-mono px-3 py-1 bg-cyan-950/50 border border-cyan-400/40 text-cyan-300 font-semibold">
                  60 FPS WebGL PBR Engine
                </span>
              </div>
            </div>

            <Engine3DScene
              sensors={sensors}
              result={result}
              onChangeSensor={handleSensorChange}
            />
          </div>
        )}

        {activeTab === 'markov' && <MarkovStudio result={result} />}

        {activeTab === 'benchmarks' && <BenchmarkView />}

        {activeTab === 'chat' && <DiagnosticChat result={result} />}

        {activeTab === 'dossier' && <ProjectDossier />}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-[#050811]/95 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
          <div>
            <span>Automobile Engine Health Deterioration &amp; Stochastic State Modeling</span>
          </div>
          <div className="text-slate-500">
            Newton-Raphson IRLS (85.21% Test Acc) · 4-State Absorbing Markov Engine · Three.js 3D Simulator
          </div>
        </div>
      </footer>

      {/* On-Demand Gemini Maintenance Advisory Modal */}
      <AiAdvisoryModal
        isOpen={isAdvisoryOpen}
        onClose={() => setIsAdvisoryOpen(false)}
        result={result}
      />

      {/* User Guide Showcase Walkthrough Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onSwitchTab={setActiveTab}
      />
    </div>
  );
}
