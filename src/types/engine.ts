/**
 * Types and interfaces for the Automobile Engine Health Showcase
 */

export interface SensorInputs {
  rpm: number;             // Engine rpm (slider 60 to 2240, step 1, default 750)
  lubOilPressure: number;  // Lub oil pressure (slider 0.0 to 7.5, step 0.05, default 3.14)
  fuelPressure: number;     // Fuel pressure (slider 0.0 to 21.5, step 0.05, default 6.21)
  coolantPressure: number;  // Coolant pressure (slider 0.0 to 7.5, step 0.05, default 2.19)
  lubOilTemp: number;       // Lub oil temp (slider 71.0 to 90.0, step 0.1, default 76.8)
  coolantTemp: number;      // Coolant temp (slider 61.0 to 96.0, step 0.1, default 78.3)
}

export interface SensorConfig {
  id: keyof SensorInputs;
  index: number;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  mean: number;
  std: number;
  coefficient: number;
  oddsRatio: number;
  healthyMean: number;
  faultyMean: number;
  tStat: number;
  pValueStr: string;
  nominalRange: [number, number];
  description: string;
}

export interface CalculationResult {
  sensors: SensorInputs;
  rawArray: number[];
  zScores: number[];
  contributions: number[];
  intercept: number;
  logOdds: number;
  pHealthy: number;
  predictedCondition: 0 | 1; // 1 = Healthy/Normal, 0 = Faulty
  markovState: 0 | 1 | 2 | 3; // 0: H, 1: M, 2: C, 3: F
  markovStateCode: 'H' | 'M' | 'C' | 'F';
  markovStateName: string;
  markovStateDescription: string;
  mttf: number; // Mean Time to Failure in duty cycles
  rul: number; // Remaining Useful Life in duty cycles
  rulHours: number; // RUL in equivalent operating hours (1 cycle ≈ 250 hrs)
  rulPercent: number; // Normalized RUL percentage (relative to pristine 12.08 cycles)
  topDeterioratingSensors: string[];
}

export interface TrajectoryRow {
  cycle: number;
  p: number[];
  rul: number;
  rulHours: number;
  rulPercent: number;
}

export interface EnginePreset {
  id: string;
  name: string;
  subtitle: string;
  values: [number, number, number, number, number, number];
  badgeColor: string;
}

export interface ModelComparisonRow {
  model: string;
  method: string;
  testAccuracy: number;
  rocAuc: number;
  keyCharacteristic: string;
  status: 'primary' | 'benchmark';
}

export interface WelchTTestRow {
  sensor: string;
  tStat: number;
  pValueStr: string;
  healthyMean: number;
  faultyMean: number;
  unit: string;
  impactDirection: 'Increases Risk when High' | 'Increases Risk when Low';
}

export interface PoissonBandRow {
  band: string;
  rpmRange: string;
  faultRatePer100: number;
  riskCategory: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  description: string;
}

export type MarkovStateCode = 'H' | 'M' | 'C' | 'F';

export interface TelemetryLogEntry {
  id: string;
  seq: number;
  timestamp: string;
  sensors: SensorInputs;
  pHealthy: number;
  predictedCondition: 0 | 1;
  markovState: 0 | 1 | 2 | 3;
  markovStateCode: MarkovStateCode;
  markovStateName: string;
  prevMarkovStateCode: MarkovStateCode | null;
  isTransition: boolean;
  mttf: number;
  rul: number;
}
