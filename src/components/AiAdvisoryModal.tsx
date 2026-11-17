import React, { useEffect, useState } from 'react';
import { CalculationResult } from '../types/engine';
import { Zap, X, AlertTriangle, ShieldCheck, Wrench, Copy, Check, RefreshCw } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface AiAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
}

export const AiAdvisoryModal: React.FC<AiAdvisoryModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [advisoryText, setAdvisoryText] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchAdvisory = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          condition: result.predictedCondition,
          pHealthy: result.pHealthy,
          markovState: result.markovState,
          stateName: result.markovStateName,
          mttf: result.mttf,
          rul: result.rul,
          rulHours: result.rulHours,
          sensors: result.sensors,
          topDeterioratingSensors: result.topDeterioratingSensors,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setAdvisoryText(data.advisory || 'No recommendation received.');
      setSource(data.source || 'gemini-3.8-flash');
    } catch (err: any) {
      console.error('Failed to fetch recommendation:', err);
      setErrorMsg(err.message || 'Network error communicating with diagnostic service.');
      // Fallback deterministic maintenance text
      setAdvisoryText(
        `Automotive Maintenance Diagnostic Briefing:\n\n1. Operational State: ${
          result.markovStateName
        } (State ${result.markovState}) with expected duty life of ${result.mttf.toFixed(
          2
        )} cycles.\n2. Primary Deteriorating Factors: ${result.topDeterioratingSensors.join(
          ', '
        )}.\n3. Shop Remediation: Perform comprehensive inspection of lubrication pressure relief valve, verify fuel injection rail pressure regulator, and inspect engine thermostat housing to prevent temperature runaway.`
      );
      setSource('deterministic_fallback');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !advisoryText && !isLoading) {
      fetchAdvisory();
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!advisoryText) return;
    navigator.clipboard.writeText(advisoryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="hud-panel rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-[#080d1a]">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-display font-bold text-slate-100 uppercase tracking-wider">
                Gemini Maintenance Advisory Briefing
              </h3>
              <div className="text-[11px] font-mono text-slate-400">
                Stochastic Diagnostic Protocol
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick(560);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Snapshot Strip */}
        <div className="px-5 py-3 bg-[#060a13] border-b border-cyan-500/15 flex items-center justify-between text-xs font-mono flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">P(Healthy):</span>
            <span className="font-bold text-cyan-400 tabular-nums">
              {(result.pHealthy * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">State:</span>
            <span className="font-bold text-slate-200">
              State {result.markovState} ({result.markovStateCode})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Remaining Useful Life (RUL):</span>
            <span className="font-bold text-cyan-300 tabular-nums">
              {result.rul.toFixed(2)} cycles (~{result.rulHours.toLocaleString()} hrs)
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
              <div className="text-sm font-semibold text-slate-200">
                Synthesizing Telemetry Diagnostics...
              </div>
              <p className="text-slate-400 text-xs max-w-sm">
                Querying server-side Gemini 3.8 Flash with live sensor deviations and Markov degradation states.
              </p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Diagnostic Notice:</span> {errorMsg}
                    <div className="text-[11px] text-amber-400/80 mt-0.5">
                      Displaying standard deterministic mechanical procedure below.
                    </div>
                  </div>
                </div>
              )}

              {/* Advisory Text Output */}
              <div className="hud-subpanel p-4 rounded-lg text-slate-200 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                {advisoryText}
              </div>

              {/* Subsystem checklist card */}
              <div className="hud-subpanel p-3.5 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-display font-semibold text-slate-200 mb-2 uppercase tracking-wider">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  <span>Suspected Deterioration Focus:</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-1 font-mono text-[11px]">
                  {result.topDeterioratingSensors.map((sensor, i) => (
                    <li key={i}>{sensor}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyan-500/20 bg-[#080d1a] flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            Source: <span className="text-cyan-400">{source || 'gemini-3.8-flash'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick(640);
                fetchAdvisory();
              }}
              disabled={isLoading}
              className="hud-chamfer px-3 py-1.5 text-xs font-mono text-slate-300 bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-200 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick(820);
                handleCopy();
              }}
              disabled={!advisoryText || isLoading}
              className="hud-chamfer px-3.5 py-1.5 text-xs font-mono font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.25)]"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Briefing'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
