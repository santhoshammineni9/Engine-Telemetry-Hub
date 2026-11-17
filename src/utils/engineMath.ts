/**
 * Mathematical Engine for Automobile Engine Health Showcase
 * Exact implementation of trained standardized logistic regression and 4-state Markov chain.
 */

import { CalculationResult, EnginePreset, SensorConfig, SensorInputs, TrajectoryRow } from '../types/engine';

export const SENSOR_CONFIGS: SensorConfig[] = [
  {
    id: 'rpm',
    index: 0,
    label: 'Engine RPM',
    unit: 'RPM',
    min: 60,
    max: 2240,
    step: 1,
    defaultValue: 750,
    mean: 788.2137,
    std: 267.4449,
    coefficient: -2.7117,
    oddsRatio: 0.0664,
    healthyMean: 701.30,
    faultyMean: 1064.89,
    tStat: -79.8612,
    pValueStr: '< 1e-300',
    nominalRange: [500, 900],
    description: 'Crankshaft rotational speed. Highly discriminatory feature; higher RPM correlates strongly with engine distress and thermal strain.',
  },
  {
    id: 'lubOilPressure',
    index: 1,
    label: 'Lub Oil Pressure',
    unit: 'bar',
    min: 0.0,
    max: 7.5,
    step: 0.05,
    defaultValue: 3.14,
    mean: 3.2919,
    std: 1.0232,
    coefficient: 0.6794,
    oddsRatio: 1.9727,
    healthyMean: 3.37,
    faultyMean: 3.06,
    tStat: 16.1283,
    pValueStr: '2.27e-57',
    nominalRange: [2.5, 4.2],
    description: 'Engine lubrication oil circuit hydraulic pressure. Adequate oil pressure protects journal bearings and reduces boundary friction.',
  },
  {
    id: 'fuelPressure',
    index: 2,
    label: 'Fuel Pressure',
    unit: 'bar',
    min: 0.0,
    max: 21.5,
    step: 0.05,
    defaultValue: 6.21,
    mean: 6.6527,
    std: 2.7379,
    coefficient: 1.3888,
    oddsRatio: 4.0102,
    healthyMean: 6.98,
    faultyMean: 5.56,
    tStat: 31.2186,
    pValueStr: '4.40e-201',
    nominalRange: [5.0, 12.0],
    description: 'Fuel rail delivery pressure. Robust pressure promotes homogeneous atomization and stable combustion without lean misfires.',
  },
  {
    id: 'coolantPressure',
    index: 3,
    label: 'Coolant Pressure',
    unit: 'bar',
    min: 0.0,
    max: 7.5,
    step: 0.05,
    defaultValue: 2.19,
    mean: 2.3667,
    std: 1.0516,
    coefficient: -0.3918,
    oddsRatio: 0.6758,
    healthyMean: 2.32,
    faultyMean: 2.47,
    tStat: -7.3960,
    pValueStr: '1.62e-13',
    nominalRange: [1.8, 3.0],
    description: 'Closed cooling system hydraulic head pressure. Overpressurization indicates impending head gasket breach or water pump cavitation.',
  },
  {
    id: 'lubOilTemp',
    index: 4,
    label: 'Lub Oil Temp',
    unit: '°C',
    min: 71.0,
    max: 90.0,
    step: 0.1,
    defaultValue: 76.8,
    mean: 77.6819,
    std: 3.1902,
    coefficient: -0.7928,
    oddsRatio: 0.4526,
    healthyMean: 77.32,
    faultyMean: 78.81,
    tStat: -22.3661,
    pValueStr: '8.78e-106',
    nominalRange: [74.0, 80.0],
    description: 'Lubricant sump temperature. Elevated temperatures degrade oil viscosity film thickness and accelerate thermal oxidation.',
  },
  {
    id: 'coolantTemp',
    index: 5,
    label: 'Coolant Temp',
    unit: '°C',
    min: 61.0,
    max: 96.0,
    step: 0.1,
    defaultValue: 78.3,
    mean: 78.4167,
    std: 6.1942,
    coefficient: -0.2504,
    oddsRatio: 0.7785,
    healthyMean: 78.11,
    faultyMean: 79.43,
    tStat: -11.5081,
    pValueStr: '2.42e-30',
    nominalRange: [72.0, 83.0],
    description: 'Engine cylinder jacket coolant temperature. Excessive temperatures signal heat exchanger fouling, low coolant level, or radiator blockages.',
  },
];

export const MODEL_PARAMS = {
  intercept: 2.6417,
  means: [788.2137, 3.2919, 6.6527, 2.3667, 77.6819, 78.4167],
  stds: [267.4449, 1.0232, 2.7379, 1.0516, 3.1902, 6.1942],
  coefficients: [-2.7117, 0.6794, 1.3888, -0.3918, -0.7928, -0.2504],
  oddsRatios: [0.0664, 1.9727, 4.0102, 0.6758, 0.4526, 0.7785],
};

// 4-State Absorbing Transition Matrix P_abs
export const P_ABS = [
  [0.85, 0.12, 0.02, 0.01],
  [0.00, 0.75, 0.20, 0.05],
  [0.00, 0.00, 0.65, 0.35],
  [0.00, 0.00, 0.00, 1.00],
];

// Continuous-Time Generator Matrix Q_abs = P_abs - I
export const Q_ABS = [
  [-0.15,  0.12,  0.02,  0.01],
  [ 0.00, -0.25,  0.20,  0.05],
  [ 0.00,  0.00, -0.35,  0.35],
  [ 0.00,  0.00,  0.00,  0.00],
];

// Empirical Initial Distribution Vector pi(0)
export const INITIAL_PI_0 = [0.6442, 0.0606, 0.0589, 0.2364];

// Presets
export const PRESETS: EnginePreset[] = [
  {
    id: 'healthy_cruise',
    name: 'Healthy Cruise',
    subtitle: 'Low RPM, high fuel pressure, nominal thermal range',
    values: [589, 2.22, 11.67, 1.94, 78.15, 79.35],
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20',
  },
  {
    id: 'moderate_stress',
    name: 'Moderate Stress',
    subtitle: 'Moderate RPM, slight thermal buildup, intermediate risk',
    values: [890, 2.90, 5.80, 2.35, 78.20, 79.00],
    badgeColor: 'border-sky-500/30 text-sky-400 bg-sky-950/20',
  },
  {
    id: 'critical_edge',
    name: 'Critical Edge',
    subtitle: 'Elevated RPM & temperatures, reduced fuel pressure',
    values: [940, 2.70, 5.40, 2.40, 78.60, 80.20],
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-950/20',
  },
  {
    id: 'high_rpm_fault',
    name: 'High-RPM Fault',
    subtitle: 'Severe RPM surge (>1300 RPM), high thermal stress',
    values: [1301, 2.48, 6.11, 2.04, 77.10, 77.42],
    badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-950/20',
  },
];

export const MARKOV_STATES = [
  {
    index: 0,
    code: 'H' as const,
    name: 'Healthy / Nominal',
    threshold: 'p >= 0.75',
    mttf: 12.08,
    color: '#10B981', // emerald
    bgLight: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Optimal operating regime with negligible hazard rate. Expected duty life: ~12.08 cycles.',
  },
  {
    index: 1,
    code: 'M' as const,
    name: 'Moderate Risk',
    threshold: '0.50 <= p < 0.75',
    mttf: 6.29,
    color: '#38BDF8', // cyan
    bgLight: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    description: 'Early telemetry degradation. Transitional state with expected MTTF of 6.29 cycles.',
  },
  {
    index: 2,
    code: 'C' as const,
    name: 'Critical Degradation',
    threshold: '0.30 <= p < 0.50',
    mttf: 2.86,
    color: '#F59E0B', // amber
    bgLight: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'High risk of failure. Immediate maintenance inspection required. MTTF: 2.86 cycles.',
  },
  {
    index: 3,
    code: 'F' as const,
    name: 'Failed / Maintenance Needed',
    threshold: 'p < 0.30',
    mttf: 0.00,
    color: '#F43F5E', // rose
    bgLight: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    description: 'Engine has entered the absorbing failed condition. Unit must be removed for overhaul.',
  },
];

/**
 * Executes exact Newton-Raphson Standardized Logistic Regression
 * and derives stochastic Markov states deterministically.
 */
export function calculateEngineHealth(inputs: SensorInputs): CalculationResult {
  const rawArray = [
    inputs.rpm,
    inputs.lubOilPressure,
    inputs.fuelPressure,
    inputs.coolantPressure,
    inputs.lubOilTemp,
    inputs.coolantTemp,
  ];

  // 1. Compute Standardized z-scores: z_j = (x_j - mean_j) / std_j
  const zScores = rawArray.map((x, j) => (x - MODEL_PARAMS.means[j]) / MODEL_PARAMS.stds[j]);

  // 2. Compute individual contributions: beta_j * z_j
  const contributions = zScores.map((z, j) => MODEL_PARAMS.coefficients[j] * z);

  // 3. Compute Log-Odds: intercept + sum(contributions)
  const sumContributions = contributions.reduce((acc, c) => acc + c, 0);
  const logOdds = MODEL_PARAMS.intercept + sumContributions;

  // 4. Logistic Sigmoid: p_healthy = 1 / (1 + exp(-log_odds))
  const pHealthy = 1 / (1 + Math.exp(-logOdds));

  // 5. Binary Condition: 1 (Healthy) if p_healthy >= 0.50 else 0 (Faulty)
  const predictedCondition = pHealthy >= 0.50 ? 1 : 0;

  // 6. Markov State Assignment:
  let markovStateIndex: 0 | 1 | 2 | 3;
  if (pHealthy >= 0.75) {
    markovStateIndex = 0;
  } else if (pHealthy >= 0.50) {
    markovStateIndex = 1;
  } else if (pHealthy >= 0.30) {
    markovStateIndex = 2;
  } else {
    markovStateIndex = 3;
  }

  const stateMeta = MARKOV_STATES[markovStateIndex];

  // Identify top deteriorating sensors (negative contribution pushes log-odds down, increasing fault probability)
  // Sensors with lowest contributions (most negative) drive fault risk
  const indexedContribs = contributions.map((val, idx) => ({
    name: SENSOR_CONFIGS[idx].label,
    val,
    zScore: zScores[idx],
  }));
  indexedContribs.sort((a, b) => a.val - b.val);
  const topDeterioratingSensors = indexedContribs
    .filter((item) => item.val < 0)
    .slice(0, 3)
    .map((item) => `${item.name} (${item.val.toFixed(2)})`);

  // Calculate Remaining Useful Life (RUL)
  const rul = stateMeta.mttf;
  const rulHours = Math.round(rul * 250); // 1 duty cycle ≈ 250 operating hours
  const rulPercent = Math.min(100, Math.max(0, parseFloat(((rul / 12.08) * 100).toFixed(1))));

  return {
    sensors: inputs,
    rawArray,
    zScores,
    contributions,
    intercept: MODEL_PARAMS.intercept,
    logOdds,
    pHealthy,
    predictedCondition,
    markovState: markovStateIndex,
    markovStateCode: stateMeta.code,
    markovStateName: stateMeta.name,
    markovStateDescription: stateMeta.description,
    mttf: stateMeta.mttf,
    rul,
    rulHours,
    rulPercent,
    topDeterioratingSensors:
      topDeterioratingSensors.length > 0 ? topDeterioratingSensors : ['All channels within healthy bounds'],
  };
}

/**
 * Matrix multiplication: C = A * B
 */
export function multiplyMatrices(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const result: number[][] = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

/**
 * Computes matrix power P^n
 */
export function matrixPower(matrix: number[][], power: number): number[][] {
  if (power === 1) return matrix.map((row) => [...row]);
  let result = matrix.map((row) => [...row]);
  for (let p = 1; p < power; p++) {
    result = multiplyMatrices(result, matrix);
  }
  return result;
}

/**
 * Multiplies vector by matrix: v * M
 */
export function vectorMatrixMultiply(vector: number[], matrix: number[][]): number[] {
  const result: number[] = Array(matrix[0].length).fill(0);
  for (let j = 0; j < matrix[0].length; j++) {
    let sum = 0;
    for (let i = 0; i < vector.length; i++) {
      sum += vector[i] * matrix[i][j];
    }
    result[j] = sum;
  }
  return result;
}

/**
 * Computes Markov state trajectories for n = 0, 1, 2, ..., maxCycles
 * starting from initial vector and calculates expected Remaining Useful Life (RUL) at each cycle.
 */
export function computeTrajectory(
  initialStateIndex: number,
  cycles: number[] = [0, 1, 2, 3, 5, 7, 10, 15, 20]
): TrajectoryRow[] {
  const initialVector = [0, 0, 0, 0];
  initialVector[initialStateIndex] = 1.0;

  return cycles.map((cycle) => {
    let p: number[];
    if (cycle === 0) {
      p = [...initialVector];
    } else {
      const Pn = matrixPower(P_ABS, cycle);
      p = vectorMatrixMultiply(initialVector, Pn);
    }

    // Expected Remaining Useful Life at cycle n: Σ p_i * MTTF_i
    const stepRul = p[0] * 12.08 + p[1] * 6.29 + p[2] * 2.86 + p[3] * 0.00;
    const stepRulHours = Math.round(stepRul * 250);
    const stepRulPercent = Math.min(100, Math.max(0, parseFloat(((stepRul / 12.08) * 100).toFixed(1))));

    return {
      cycle,
      p,
      rul: stepRul,
      rulHours: stepRulHours,
      rulPercent: stepRulPercent,
    };
  });
}
