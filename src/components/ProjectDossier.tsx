import React from 'react';
import { BookOpen, GraduationCap, CheckCircle2, FileText, Cpu, Sigma, Award } from 'lucide-react';

export const ProjectDossier: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="hud-panel rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-sky-400" />
              <h1 className="font-display text-base font-bold text-slate-100 tracking-wider uppercase">
                Engineering Dossier & Theoretical Formulation
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Applied Statistics &amp; Stochastic State Modeling
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-sky-950/40 border border-sky-500/40 text-sky-400 rounded-md font-semibold">
              Technical Showcase
            </span>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-300 leading-relaxed max-w-4xl space-y-2">
          <p>
            <strong>Project Title:</strong> &ldquo;Automobile Engine Health Deterioration &amp; Stochastic State Modeling&rdquo;
          </p>
          <p className="text-slate-400">
            This showcase synthesizes classical empirical statistics (multivariate hypothesis testing, maximum likelihood estimation) with stochastic process theory (discrete/continuous Markov jump processes, absorbing state MTTF derivations, and ergodic renewal cycles) evaluated against 15,206 clean automotive dynamometer records.
          </p>
        </div>
      </div>

      {/* 4 Pillars of the Project */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Newton-Raphson IRLS */}
        <div className="hud-panel rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <Sigma className="w-4 h-4 text-sky-400" />
            <h2 className="font-display text-sm font-bold text-slate-100 uppercase tracking-wider">
              1. Standardized Logistic Regression via IRLS
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The binary engine condition (1 = Healthy, 0 = Faulty) is modeled via the logit link function:
          </p>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-sky-300">
            ln( p / (1 - p) ) = β₀ + Σⱼ₌₀⁵ βⱼ · [ (xⱼ - μⱼ) / σⱼ ]
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Coefficients are estimated via <strong>Newton-Raphson Iteratively Reweighted Least Squares (IRLS)</strong>:
            <br />
            <span className="font-mono text-slate-300">β⁽ᵗ⁺¹⁾ = β⁽ᵗ⁾ + (Xᵀ W X)⁻¹ Xᵀ (y - p)</span>
            <br />
            Feature standardization prevents high-magnitude features (Engine RPM) from overwhelming smaller numerical scales (Coolant Pressure).
          </p>
        </div>

        {/* Pillar 2: 4-State Absorbing Markov Chain */}
        <div className="hud-panel rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <Cpu className="w-4 h-4 text-sky-400" />
            <h2 className="font-display text-sm font-bold text-slate-100 uppercase tracking-wider">
              2. 4-State Absorbing Degradation Process
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The health probability space [0, 1] is partitioned into 4 distinct physical degradation states:
          </p>
          <ul className="text-xs font-mono text-slate-300 space-y-1 bg-slate-950 p-3 rounded border border-slate-800">
            <li>State 0 (H - Healthy): p ≥ 0.75 → MTTF = 12.08 cycles</li>
            <li>State 1 (M - Moderate): 0.50 ≤ p &lt; 0.75 → MTTF = 6.29 cycles</li>
            <li>State 2 (C - Critical): 0.30 ≤ p &lt; 0.50 → MTTF = 2.86 cycles</li>
            <li>State 3 (F - Failed): p &lt; 0.30 → MTTF = 0.00 cycles (Absorbing)</li>
          </ul>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mean Time to Failure (MTTF) is derived analytically using fundamental matrix algebra:
            <br />
            <span className="font-mono text-slate-300">N = (I - Q_transient)⁻¹</span>, where row sums give expected cycles to absorption.
          </p>
        </div>

        {/* Pillar 3: Welch's t-Test */}
        <div className="hud-panel rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <FileText className="w-4 h-4 text-sky-400" />
            <h2 className="font-display text-sm font-bold text-slate-100 uppercase tracking-wider">
              3. Multivariate Welch's t-Test Validation
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Because healthy and faulty populations exhibit unequal variance and sample sizes (11,612 vs 3,594), student's pooled t-test is invalid. Welch's test computes:
          </p>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-sky-300">
            t = (x̄₁ - x̄₂) / √( s₁²/N₁ + s₂²/N₂ )
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Degrees of freedom are computed using the Welch-Satterthwaite equation. All 6 sensor features yielded extreme significance (p &lt; 10⁻¹²), proving that observed differences are not stochastic noise.
          </p>
        </div>

        {/* Pillar 4: Ergodic Renewal & Availability */}
        <div className="hud-panel rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <Award className="w-4 h-4 text-sky-400" />
            <h2 className="font-display text-sm font-bold text-slate-100 uppercase tracking-wider">
              4. Ergodic Closed-Loop Repair System
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In industrial fleet operations, failed engines are serviced and restored to pristine State 0 with repair transition rate λ_repair = 0.80.
          </p>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-emerald-300">
            Steady-State Operational Availability = 91.27%
            <br />
            π* = [0.7302, 0.1168, 0.0657, 0.0873]
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The addition of repair converts the absorbing chain into an irreducible, positive recurrent (ergodic) chain with a unique stationary probability distribution.
          </p>
        </div>
      </div>

      {/* Technical Summary Footer */}
      <div className="hud-panel p-4 rounded-xl text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="text-slate-200 font-semibold">Automobile Engine Health Deterioration</span> · Stochastic State Degradation Analysis
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          Evaluated across 15,206 clean engine records
        </div>
      </div>
    </div>
  );
};
