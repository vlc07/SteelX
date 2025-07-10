export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

export interface OptimizationRange {
  min: number;
  max: number;
  step: number;
}

export interface ProcessParameters {
  temperatura: number;
  tempo: number;
  pressao: number;
  velocidade: number;
}

export interface Scenario {
  name: string;
  parameters: ProcessParameters;
  quality: number;
  isOptimized: boolean;
}