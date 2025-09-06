// src/optim/genetic.ts
import { Bounds, ObjectiveFn, Optimizer, SearchResult, EvalRecord } from './optimizer';

// RNG simples e determinístico (xorshift32)
function rng(seed = 1234) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17; s >>>= 0;
    s ^= s << 5;  s >>>= 0;
    return (s >>> 0) / 0xffffffff;
  };
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export class GeneticOptimizer implements Optimizer {
  constructor(private cfg = {
    popSize: 40,    // tamanho da população
    elite: 4,       // indivíduos mantidos por elitismo
    tournament: 3,  // tamanho do torneio de seleção
    cxProb: 0.9,    // prob. de crossover
    mutProb: 0.2,   // prob. de mutação por gene
    mutSigma: 0.1,  // fração do range para desvio padrão da mutação
  }) {}

  async run({ objective, bounds, budget, seed = 42 }: {
    objective: ObjectiveFn; bounds: Bounds[]; budget: number; seed?: number;
  }): Promise<SearchResult> {
    const rnd = rng(seed);
    const nVars = bounds.length;
    const ranges = bounds.map(b => b.max - b.min);

    const randInd = () => {
      const x: Record<string, number> = {};
      bounds.forEach((b, i) => x[b.name] = b.min + rnd() * ranges[i]);
      return x;
    };

    const pop: { x: Record<string, number>; y: number }[] = [];
    while (pop.length < this.cfg.popSize) pop.push({ x: randInd(), y: -Infinity });

    let evals = 0;
    const history: EvalRecord[] = [];
    let best: EvalRecord | null = null;

    const evalInd = async (ind: { x: Record<string, number>; y: number }) => {
      ind.y = await objective(ind.x); evals++;
      const rec = { x: { ...ind.x }, y: ind.y };
      history.push(rec);
      if (!best || ind.y > best.y) best = rec;
    };

    // população inicial
    for (const ind of pop) await evalInd(ind);

    while (evals < budget) {
      // elitismo
      pop.sort((a, b) => b.y - a.y);
      const next: typeof pop = pop.slice(0, this.cfg.elite).map(i => ({ x: { ...i.x }, y: i.y }));

      // torneio
      const pickTournament = () => {
        let bestI = Math.floor(rnd() * pop.length);
        for (let k = 1; k < this.cfg.tournament; k++) {
          const j = Math.floor(rnd() * pop.length);
          if (pop[j].y > pop[bestI].y) bestI = j;
        }
        return pop[bestI];
      };

      // descendentes
      while (next.length < this.cfg.popSize && evals < budget) {
        const p1 = pickTournament(), p2 = pickTournament();

        // Crossover BLX-α
        let child: Record<string, number> = {};
        if (rnd() < this.cfg.cxProb) {
          bounds.forEach((b, i) => {
            const a = p1.x[b.name], c = p2.x[b.name];
            const lo = Math.min(a, c), hi = Math.max(a, c);
            const alpha = 0.2;
            const L = lo - alpha * (hi - lo);
            const H = hi + alpha * (hi - lo);
            child[b.name] = clamp(L + rnd() * (H - L), b.min, b.max);
          });
        } else {
          child = { ...p1.x };
        }

        // Mutação Gaussiana
        bounds.forEach((b, i) => {
          if (rnd() < this.cfg.mutProb) {
            const sigma = this.cfg.mutSigma * ranges[i];
            // Box–Muller
            const u = Math.sqrt(-2 * Math.log(Math.max(1e-12, rnd()))) * Math.cos(2 * Math.PI * rnd());
            child[b.name] = clamp(child[b.name] + u * sigma, b.min, b.max);
          }
        });

        const ind = { x: child, y: -Infinity };
        await evalInd(ind);
        next.push(ind);
      }

      // próxima geração
      pop.splice(0, pop.length, ...next);
    }

    return { best: best!, history, evaluations: evals, meta: { method: 'ga', ...this.cfg } };
  }
}
