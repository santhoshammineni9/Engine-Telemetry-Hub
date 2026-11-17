import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Play,
  Activity,
  Box,
  Layers,
  BarChart3,
  Bot,
  Sliders,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchTab?: (tab: any) => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onSwitchTab,
}) => {
  const [activeSection, setActiveSection] = useState<number>(0);

  if (!isOpen) return null;

  const sections = [
    {
      title: '1. Quick Start Walkthrough',
      icon: Activity,
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Welcome to the engineering showcase:
            <br />
            <em className="text-slate-100">&ldquo;Automobile Engine Health Deterioration &amp; Stochastic State Modeling&rdquo;</em>
          </p>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <div className="font-semibold text-slate-200">The 3-Step Demo Flow:</div>
            <ol className="list-decimal list-inside space-y-1.5 font-mono text-[11px] text-slate-400">
              <li>
                <strong className="text-sky-300">Test Presets:</strong> Click <code className="text-slate-200">Healthy Cruise</code> or <code className="text-slate-200">High-RPM Fault</code> to instantly load verified telemetry profiles.
              </li>
              <li>
                <strong className="text-emerald-300">Run Simulated Drift:</strong> Click <code className="text-slate-200">Start Simulated Run</code> in the Telemetry tab to watch an engine degrade over 20 iterations through Markov States 0 → 1 → 2 → 3.
              </li>
              <li>
                <strong className="text-amber-300">Explore in 3D:</strong> Switch to the <code className="text-slate-200">3D Dyno Stage</code> tab to watch pistons reciprocate and exhaust runners glow with thermal stress in real time!
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      title: '2. Live Telemetry Console',
      icon: Sliders,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            The <strong>Telemetry Console</strong> evaluates exact standardized logistic regression inference (Newton-Raphson IRLS) in real-time on the client:
          </p>
          <ul className="space-y-2 font-mono text-[11px] text-slate-400">
            <li className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <strong className="text-slate-200">6 Telemetry Sliders:</strong> Adjust Engine RPM, Lubrication Oil Pressure, Fuel Pressure, Coolant Pressure, Lubrication Oil Temperature, and Coolant Temperature.
            </li>
            <li className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <strong className="text-slate-200">Health Gauge:</strong> Displays live <span className="text-sky-400">P(Healthy)</span> and the binary condition badge (<code className="text-emerald-400">Normal</code> vs <code className="text-rose-400">Service Required</code> at 50% cutoff).
            </li>
            <li className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <strong className="text-slate-200">Feature Contributions (β · z):</strong> Visualizes which channels increase health (Fuel Pressure, OR = 4.01) vs which accelerate fault risk (Engine RPM, β = -2.71).
            </li>
            <li className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <strong className="text-slate-200">Step-by-Step Proof:</strong> Click to expand the live mathematical equation and inspect all raw $x_j$, means $\mu_j$, standard deviations $\sigma_j$, and z-scores.
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: '3. 3D Dyno Stage Simulator',
      icon: Box,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            The <strong>3D Dyno Stage</strong> tab runs a procedural Three.js WebGL physical simulation:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <strong className="text-slate-200">Reciprocating Pistons:</strong> Reciprocate at the exact RPM speed live with an inline-4 firing sequence ($[0, \pi, \pi, 0]$).
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <strong className="text-slate-200">Thermal Emissivity:</strong> Exhaust runners transition from metallic slate to incandescent glowing amber/red as temperatures rise.
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <strong className="text-slate-200">Exploded View Slider:</strong> Expands the cylinder head, fuel rail, and intake plenum to inspect internal components.
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <strong className="text-slate-200">Camera Views:</strong> Switch between Isometric, Front Crank, Head Top, and Exhaust Runner viewpoints.
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '4. Markov Model & Benchmarks',
      icon: BarChart3,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            Dive into the theoretical formulation and statistical validation:
          </p>
          <ul className="space-y-2 font-mono text-[11px] text-slate-400">
            <li className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <strong className="text-slate-200">Markov Model Tab:</strong> Inspect state trajectories over duty cycles n in [1, 5, 10, 20], the absorbing matrix P_abs, the continuous-time generator Q_abs = P - I, and the 91.27% steady-state repair availability.
            </li>
            <li className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <strong className="text-slate-200">Benchmarks Tab:</strong> View Welch&apos;s two-sample t-tests (p &lt; 10⁻¹²), the multi-model comparison matrix (Logistic Regression 85.21% vs 15-NN 85.50%), the 2x2 Confusion Matrix, and Poisson failure rates by RPM band.
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: '5. AI Advisor Chat & Advisories',
      icon: Bot,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            Interact with the server-side Gemini AI features:
          </p>
          <ul className="space-y-2 font-mono text-[11px] text-slate-400">
            <li className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <strong className="text-slate-200">Generate Maintenance Advisory:</strong> Click the button on the Diagnostic Gauge to generate a structured shop service protocol for the current telemetry outlier channels.
            </li>
            <li className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <strong className="text-slate-200">dino Chat:</strong> Multi-turn conversation thread answering technical questions about the dataset, mathematical proofs, and mechanical troubleshooting.
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="hud-panel rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-[#080d1a]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-display font-bold text-slate-100 uppercase tracking-wider">
                User Guide &amp; Showcase Navigation
              </h3>
              <div className="text-[11px] font-mono text-slate-400">
                Engine Telemetry &amp; Stochastic State Modeling
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

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-2 bg-[#060a13] border-b border-cyan-500/15 overflow-x-auto no-scrollbar">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            const isActive = activeSection === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  soundFx.playClick(680);
                  setActiveSection(idx);
                }}
                className={`hud-chamfer flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Section Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {sections[activeSection].content}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#080d1a] border-t border-cyan-500/20 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400 tabular-nums">
            Section {activeSection + 1} of {sections.length}
          </div>
          <div className="flex items-center gap-2">
            {activeSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick(740);
                  setActiveSection((prev) => prev + 1);
                }}
                className="hud-chamfer px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.25)]"
              >
                <span>Next Section</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick(820);
                  onClose();
                }}
                className="hud-chamfer px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold transition-colors cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              >
                Got It, Let&apos;s Explore
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
