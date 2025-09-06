// src/optim/grid_search.ts
import { Bounds, ObjectiveFn, Optimizer, SearchResult, EvalRecord } from './optimizer';

export class GridSearch implements Optimizer {
  async run({ objective, bounds, budget }: {
    objective: ObjectiveFn; bounds: Bounds[]; budget: number;
  }): Promise<SearchResult> {

    // Gera eixos respeitando step (ou ~20 divisões por padrão)
    const axes = bounds.map(b => {
      const step = b.step ?? Math.max(1, (b.max - b.min) / 20);
      const vals: number[] = [];
      for (let v = b.min; v <= b.max + 1e-9; v += step) vals.push(+v.toFixed(10));
      return { name: b.name, values: vals };
    });

    // Produto cartesiano com limite de orçamento
    const points: Record<string, number>[] = [];
    const dfs = (i: number, acc: Record<string, number>) => {
      if (points.length >= budget) return;
      if (i === axes.length) { points.push({ ...acc }); return; }
      const { name, values } = axes[i];
      for (const v of values) {
        if (points.length >= budget) break;
        acc[name] = v;
        dfs(i + 1, acc);
      }
    };
    dfs(0, {});

    let best: EvalRecord | null = null;
    const history: EvalRecord[] = [];

    for (const x of points) {
      const y = await objective(x);
      const rec = { x, y };
      history.push(rec);
      if (!best || y > best.y) best = rec;
    }

    return { best: best!, history, evaluations: history.length, meta: { method: 'grid' } };
  }
}
