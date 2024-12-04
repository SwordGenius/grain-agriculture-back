export interface Probabilities {
  below_min: number;
  above_max: number;
  within_limits: number;
}

export interface SensorStats {
  average: number;
  std_dev: number;
  probabilities: Probabilities;
}

export interface Stadistics {
  temperature_outside: SensorStats;
  temperature_inside: SensorStats;
  humidity: SensorStats;
  gas: SensorStats;
}

export interface Limits {
  temperature: { min: number; max: number };
  humidity: { min: number; max: number };
  gas: { min: number; max: number };
}