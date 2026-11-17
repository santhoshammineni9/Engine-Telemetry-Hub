import React from 'react';
import {
  DATASET_METRICS,
  LOGISTIC_REGRESSION_METRICS,
  CAT3_COMPARISON,
  WELCH_T_TESTS,
  POISSON_FAULT_RATES,
} from '../data/benchmarkData';
import { BarChart3, Database, Award, GitCompare, CheckCircle2 } from 'lucide-react';

export const BenchmarkView: React.FC = () => {
  const { confusionMatrix, testAccuracy, precision, recall, f1Score, rocAuc } = LOGISTIC_REGRESSION_METRICS;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="hud-panel rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              <h1 className="font-display text-base font-bold text-slate-100 tracking-wider uppercase">
                statistical proofs
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Curated Kaggle Automotive Engine Telemetry empirical evaluation across 15,206 observations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 rounded-md font-bold">
              Test Accuracy: {(testAccuracy * 100).toFixed(2)}% (Exceeds 85% requirement)
            </span>
          </div>
        </div>

        {/* Dataset Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
          <div className="p-3 bg-[#0e1422] rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">Total Sample Size</div>
            <div className="text-lg font-bold text-slate-100 tabular-nums">
              {DATASET_METRICS.totalObservations.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">0 nulls · 0 duplicates</div>
          </div>

          <div className="p-3 bg-[#0e1422] rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">Train / Test Partition</div>
            <div className="text-lg font-bold text-sky-400 tabular-nums">
              80% / 20%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {DATASET_METRICS.trainCount.toLocaleString()} / {DATASET_METRICS.testCount.toLocaleString()}
            </div>
          </div>

          <div className="p-3 bg-[#0e1422] rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">Healthy Class (1)</div>
            <div className="text-lg font-bold text-emerald-400 tabular-nums">
              {DATASET_METRICS.healthyCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {DATASET_METRICS.healthyPercent}% baseline
            </div>
          </div>

          <div className="p-3 bg-[#0e1422] rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">Faulty Class (0)</div>
            <div className="text-lg font-bold text-rose-400 tabular-nums">
              {DATASET_METRICS.faultyCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {DATASET_METRICS.faultyPercent}% baseline
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Confusion Matrix & Multi-Model Benchmark Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Confusion Matrix & Metrics */}
        <div className="lg:col-span-5 hud-panel rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-400" />
                <h2 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
                  Primary Model Confusion Matrix (20% Test)
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                N = 3,042
              </span>
            </div>

            {/* 2x2 Matrix */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs mb-4">
              <div className="text-center text-[11px] text-slate-400 mb-2">
                Predicted Condition vs Actual Ground Truth
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center items-center">
                <div className="text-[10px] text-slate-400 font-bold"></div>
                <div className="text-[11px] font-semibold text-rose-400 bg-slate-900/60 py-1 rounded">
                  Pred: Faulty (0)
                </div>
                <div className="text-[11px] font-semibold text-emerald-400 bg-slate-900/60 py-1 rounded">
                  Pred: Healthy (1)
                </div>

                <div className="text-[11px] font-semibold text-rose-400 bg-slate-900/60 py-2 rounded text-right pr-2">
                  Act: Faulty
                </div>
                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded">
                  <div className="text-slate-400 text-[10px]">True Neg (TN)</div>
                  <div className="text-base font-bold text-rose-300 tabular-nums">
                    {confusionMatrix.tn}
                  </div>
                </div>
                <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded">
                  <div className="text-slate-400 text-[10px]">False Pos (FP)</div>
                  <div className="text-base font-bold text-amber-300 tabular-nums">
                    {confusionMatrix.fp}
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-emerald-400 bg-slate-900/60 py-2 rounded text-right pr-2">
                  Act: Healthy
                </div>
                <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded">
                  <div className="text-slate-400 text-[10px]">False Neg (FN)</div>
                  <div className="text-base font-bold text-amber-300 tabular-nums">
                    {confusionMatrix.fn}
                  </div>
                </div>
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded">
                  <div className="text-slate-400 text-[10px]">True Pos (TP)</div>
                  <div className="text-base font-bold text-emerald-300 tabular-nums">
                    {confusionMatrix.tp}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance KPI Table */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0e1422] rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Precision:</span>
                <span className="font-bold text-slate-100 tabular-nums">
                  {(precision * 100).toFixed(2)}%
                </span>
              </div>
              <div className="p-2.5 bg-[#0e1422] rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Recall:</span>
                <span className="font-bold text-slate-100 tabular-nums">
                  {(recall * 100).toFixed(2)}%
                </span>
              </div>
              <div className="p-2.5 bg-[#0e1422] rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">F1-Score:</span>
                <span className="font-bold text-slate-100 tabular-nums">
                  {f1Score.toFixed(4)}
                </span>
              </div>
              <div className="p-2.5 bg-[#0e1422] rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">ROC-AUC:</span>
                <span className="font-bold text-sky-400 tabular-nums">
                  {rocAuc.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
            High recall (92.66%) ensures that deteriorating automobile engines are reliably detected prior to catastrophic field breakdown.
          </div>
        </div>

        {/* Right Column (7 cols): Multi-Model Comparison Table */}
        <div className="lg:col-span-7 hud-panel rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-sky-400" />
                <h2 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
                  Multi-Model Benchmark Comparison
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Continuous Evaluation Matrix
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800/80 mb-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0e1422] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Model Architecture</th>
                    <th className="py-2.5 px-3 text-right">Accuracy</th>
                    <th className="py-2.5 px-3 text-right">ROC-AUC</th>
                    <th className="py-2.5 px-3">Architectural Character</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                  {CAT3_COMPARISON.map((row) => {
                    const isSelected = row.status === 'primary';
                    return (
                      <tr
                        key={row.model}
                        className={`hover:bg-slate-900/40 ${
                          isSelected ? 'bg-sky-950/20 font-semibold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            )}
                            <span className={isSelected ? 'text-sky-300 font-bold' : 'text-slate-200'}>
                              {row.model}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-100">
                          {row.testAccuracy.toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-sky-400 font-bold">
                          {row.rocAuc.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-400">
                          {row.keyCharacteristic}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Model Comparison Takeaway */}
            <div className="p-3 bg-[#0e1422] rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-slate-100">Why Logistic Regression was Chosen:</strong> While 15-NN achieves 85.50% (+0.29%), it requires storing the entire 12,164 training dataset in memory and computing pairwise distances during inference. Logistic Regression achieves virtually identical accuracy (85.21%), higher ROC-AUC (0.9372 vs 0.9311), zero inference latency $O(1)$, and closed-form odds ratio interpretability.
            </div>
          </div>
        </div>
      </div>

      {/* Welch's Two-Sample t-Test Verification Table */}
      <div className="hud-panel rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 mb-4 gap-2">
          <div>
            <h2 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
              Welch's Two-Sample t-Test Significance (Healthy N=11,612 vs Faulty N=3,594)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Unequal variance two-tailed hypothesis testing verifying sensor discriminability
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/30 px-2.5 py-1 rounded border border-emerald-500/30">
            All 6 Channels Reject H₀ (p &lt; 10⁻¹²)
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800/80">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0e1422] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Telemetry Feature</th>
                <th className="py-2.5 px-3 text-emerald-400 font-bold">Healthy Mean (μ₁)</th>
                <th className="py-2.5 px-3 text-rose-400 font-bold">Faulty Mean (μ₀)</th>
                <th className="py-2.5 px-3 text-right">t-Statistic</th>
                <th className="py-2.5 px-3 text-right text-sky-400 font-bold">p-Value</th>
                <th className="py-2.5 px-3">Physical Impact Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
              {WELCH_T_TESTS.map((row) => (
                <tr key={row.sensor} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 text-slate-200 font-semibold">{row.sensor}</td>
                  <td className="py-2.5 px-3 text-emerald-400 tabular-nums">
                    {row.healthyMean.toFixed(2)} {row.unit}
                  </td>
                  <td className="py-2.5 px-3 text-rose-400 tabular-nums">
                    {row.faultyMean.toFixed(2)} {row.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-200 font-bold">
                    {row.tStat >= 0 ? `+${row.tStat.toFixed(4)}` : row.tStat.toFixed(4)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-sky-400 font-bold">
                    {row.pValueStr}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-400">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mr-1.5 ${
                        row.impactDirection.includes('High')
                          ? 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
                          : 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                      }`}
                    >
                      {row.impactDirection}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Poisson Fault Rates by RPM Operating Band */}
      <div className="hud-panel rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 mb-4 gap-2">
          <div>
            <h2 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
              Poisson Fault Rate Distribution by Engine RPM Band
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical occurrence rate λ (fault events per 100 engine runs)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Non-linear wear escalation with rotational velocity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {POISSON_FAULT_RATES.map((band) => {
            const isHigh = band.riskCategory === 'High Risk';
            const isMed = band.riskCategory === 'Moderate Risk';

            return (
              <div
                key={band.band}
                className="p-4 bg-[#0e1422] rounded-lg border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">{band.band}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        isHigh
                          ? 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
                          : isMed
                          ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                          : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                      }`}
                    >
                      {band.riskCategory}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 mb-2">
                    Operating Range: {band.rpmRange}
                  </div>
                  <div className="text-2xl font-mono font-bold text-slate-100 mb-1 tabular-nums">
                    {band.faultRatePer100.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-400">/ 100 runs</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">{band.description}</p>
                </div>

                {/* Relative Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  <div className="h-2 bg-slate-900 rounded overflow-hidden">
                    <div
                      className={`h-full ${
                        isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(band.faultRatePer100 / 60) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
