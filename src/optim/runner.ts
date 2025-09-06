// src/optim/runner.ts
import { getModel } from '../ml/engine';
import type { Bounds, ObjectiveFn, SearchResult } from './optimizer';
import { GridSearch } from './grid_search';
import { GeneticOptimizer } from './genetic';
import { BayesianOptimizer } from './bayes_opt';

export type OptimizeMethod = 'grid' | 'ga' | 'bo';

export type OptimizeParams = {
  method: OptimizeMethod;
  budget: number;
  lambda: number;
  useQualityConstraint?: boolean;
  qualityMin?: number;
  seed?: number;
};

export type OptimizeReturn = SearchResult & {
  method: OptimizeMethod;
  lambda: number;
  useQualityConstraint: boolean;
  qualityMin: number;
  timestamp: string;
};

export const defaultBounds: Bounds[] = [
  { name: 'temperatura', min: 1400, max: 1600, step: 5 },
  { name: 'tempo',        min:   10, max:  120, step: 5 },
  { name: 'pressao',      min:   95, max:  110, step: 1 },
  { name: 'velocidade',   min:  250, max:  350, step: 5 },
];

export function makeObjective({ lambda, useQualityConstraint, qualityMin }: {
  lambda: number;
  useQualityConstraint?: boolean;
  qualityMin?: number;
}): ObjectiveFn {
  const model = getModel('inference');
  const requireQ = !!useQualityConstraint;
  const qMin = qualityMin ?? 365;

  return (x) => {
    const { quality, energy } = model.predict({
      temp: x.temperatura,
      time: x.tempo,
      press: x.pressao,
      speed: x.velocidade,
    });

    if (requireQ && quality < qMin) return -1e9;
    return quality - lambda * (energy - 500);
  };
}

export async function runOptimization(
  opts: OptimizeParams,
  bounds: Bounds[] = defaultBounds
): Promise<OptimizeReturn> {
  const { method, budget, lambda, useQualityConstraint = false, qualityMin = 365, seed = 2025 } = opts;

  const objective = makeObjective({ lambda, useQualityConstraint, qualityMin });

  const optimizer =
    method === 'grid'
      ? new GridSearch()
      : method === 'ga'
      ? new GeneticOptimizer({ popSize: 40, elite: 4, tournament: 3, cxProb: 0.9, mutProb: 0.2, mutSigma: 0.1 })
      : new BayesianOptimizer({ initRandom: 10, candPerIter: 300, lengthScale: 0.5, variance: 1.0, noise: 1e-6 });

  const res = await optimizer.run({ objective, bounds, budget, seed });

  return {
    ...res,
    method,
    lambda,
    useQualityConstraint,
    qualityMin,
    timestamp: new Date().toISOString(),
  };
}
