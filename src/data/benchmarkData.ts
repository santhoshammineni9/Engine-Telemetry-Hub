/**
 * Verified statistical benchmarks, dataset metrics, and model comparison data
 * for "Automobile Engine Health Deterioration & Stochastic State Modeling".
 */

import { ModelComparisonRow, PoissonBandRow, WelchTTestRow } from '../types/engine';

export const DATASET_METRICS = {
  title: 'Curated Kaggle Automotive Engine Telemetry',
  filename: 'engine_data_85.csv',
  totalObservations: 15206,
  duplicates: 0,
  missingValues: 0,
  trainCount: 12164,
  trainPercent: 80.0,
  testCount: 3042,
  testPercent: 20.0,
  healthyCount: 11612,
  healthyPercent: 76.36,
  faultyCount: 3594,
  faultyPercent: 23.64,
};

export const LOGISTIC_REGRESSION_METRICS = {
  modelName: 'Standardized Logistic Regression (Newton-Raphson IRLS)',
  testAccuracy: 0.8521, // 85.21%
  precision: 0.8864,
  recall: 0.9266,
  f1Score: 0.9061,
  rocAuc: 0.9372,
  confusionMatrix: {
    tn: 422, // True Negative (Faulty predicted as Faulty)
    fp: 278, // False Positive (Faulty predicted as Healthy)
    fn: 172, // False Negative (Healthy predicted as Faulty)
    tp: 2170, // True Positive (Healthy predicted as Healthy)
    totalTest: 3042,
  },
};

export const CAT3_COMPARISON: ModelComparisonRow[] = [
  {
    model: 'Logistic Regression',
    method: 'Newton-Raphson IRLS with Z-score Standardization',
    testAccuracy: 85.21,
    rocAuc: 0.9372,
    keyCharacteristic: 'Linear log-odds boundary with exact probabilistic interpretability and odds-ratio coefficients',
    status: 'primary',
  },
  {
    model: '15-Nearest Neighbors',
    method: 'Euclidean distance metric on standard scaler (n=1000 test sample)',
    testAccuracy: 85.50,
    rocAuc: 0.9311,
    keyCharacteristic: 'Non-parametric local manifold density; competitive accuracy but high $O(Nd)$ inference latency',
    status: 'benchmark',
  },
  {
    model: 'Gaussian Naive Bayes',
    method: 'Maximum Likelihood Estimation with Gaussian kernel likelihoods',
    testAccuracy: 83.69,
    rocAuc: 0.9180,
    keyCharacteristic: 'Fast closed-form training; slight underperformance due to conditional sensor feature covariance',
    status: 'benchmark',
  },
  {
    model: 'CART Decision Tree',
    method: 'Gini impurity criterion with constrained max_depth = 4',
    testAccuracy: 83.50,
    rocAuc: 0.8886,
    keyCharacteristic: 'Axis-aligned orthogonal partitions; prone to staircase boundary artifacts on continuous thermal channels',
    status: 'benchmark',
  },
];

export const WELCH_T_TESTS: WelchTTestRow[] = [
  {
    sensor: 'Engine RPM',
    tStat: -79.8612,
    pValueStr: '< 1e-300',
    healthyMean: 701.30,
    faultyMean: 1064.89,
    unit: 'RPM',
    impactDirection: 'Increases Risk when High',
  },
  {
    sensor: 'Fuel Pressure',
    tStat: 31.2186,
    pValueStr: '4.40e-201',
    healthyMean: 6.98,
    faultyMean: 5.56,
    unit: 'bar',
    impactDirection: 'Increases Risk when Low',
  },
  {
    sensor: 'Lub Oil Temp',
    tStat: -22.3661,
    pValueStr: '8.78e-106',
    healthyMean: 77.32,
    faultyMean: 78.81,
    unit: '°C',
    impactDirection: 'Increases Risk when High',
  },
  {
    sensor: 'Lub Oil Pressure',
    tStat: 16.1283,
    pValueStr: '2.27e-57',
    healthyMean: 3.37,
    faultyMean: 3.06,
    unit: 'bar',
    impactDirection: 'Increases Risk when Low',
  },
  {
    sensor: 'Coolant Temp',
    tStat: -11.5081,
    pValueStr: '2.42e-30',
    healthyMean: 78.11,
    faultyMean: 79.43,
    unit: '°C',
    impactDirection: 'Increases Risk when High',
  },
  {
    sensor: 'Coolant Pressure',
    tStat: -7.3960,
    pValueStr: '1.62e-13',
    healthyMean: 2.32,
    faultyMean: 2.47,
    unit: 'bar',
    impactDirection: 'Increases Risk when High',
  },
];

export const POISSON_FAULT_RATES: PoissonBandRow[] = [
  {
    band: 'Low RPM Operating Band',
    rpmRange: '< 700 RPM',
    faultRatePer100: 0.98,
    riskCategory: 'Low Risk',
    description: 'Idle and light cruising duty. Hazard rate is virtually zero (0.98 faults per 100 engine runs).',
  },
  {
    band: 'Medium RPM Operating Band',
    rpmRange: '700 - 1,100 RPM',
    faultRatePer100: 15.00,
    riskCategory: 'Moderate Risk',
    description: 'Standard cruising speed. Failure rate rises fifteen-fold to 15.00 per 100 engine runs as thermal load builds.',
  },
  {
    band: 'High RPM Operating Band',
    rpmRange: '> 1,100 RPM',
    faultRatePer100: 54.98,
    riskCategory: 'High Risk',
    description: 'High-speed / aggressive acceleration. Majority of engines experience acute telemetry deterioration (54.98 faults per 100).',
  },
];

export const ERGODIC_MODEL_SPECS = {
  absorbingMatrix: [
    [0.85, 0.12, 0.02, 0.01],
    [0.00, 0.75, 0.20, 0.05],
    [0.00, 0.00, 0.65, 0.35],
    [0.00, 0.00, 0.00, 1.00],
  ],
  generatorMatrix: [
    [-0.15,  0.12,  0.02,  0.01],
    [ 0.00, -0.25,  0.20,  0.05],
    [ 0.00,  0.00, -0.35,  0.35],
    [ 0.00,  0.00,  0.00,  0.00],
  ],
  repairTransitionRateFtoH: 0.80,
  steadyStateAvailability: 91.27, // 91.27%
  stationaryDistribution: [0.7302, 0.1168, 0.0657, 0.0873],
};
