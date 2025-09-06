// src/optim/bayes_opt.ts
// Otimização Bayesiana (GP RBF + Expected Improvement) leve e auto-contida.
import { Bounds, ObjectiveFn, Optimizer, SearchResult, EvalRecord, Point } from './optimizer';

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const dist2 = (a: number[], b: number[]) => a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0);

// Kernel RBF
function rbf(x: number[], z: number[], length = 0.5, variance = 1.0) {
  return variance * Math.exp(-dist2(x, z) / (2 * length * length));
}

// Converters
function toVec(bounds: Bounds[], p: Point) {
  return bounds.map(b => (p[b.name] - b.min) / (b.max - b.min));
}
function fromVec(bounds: Bounds[], v: number[]) {
  const x: Point = {};
  bounds.forEach((b, i) => x[b.name] = b.min + v[i] * (b.max - b.min));
  return x;
}

function argmax(arr: number[]) { let i = 0; for (let k = 1; k < arr.length; k++) if (arr[k] > arr[i]) i = k; return i; }

// Cholesky simples (matrizes pequenas)
function cholesky(A: number[][]) {
  const n = A.length;
  const L = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = A[i][j];
      for (let k = 0; k < j; k++) sum -= L[i][k] * L[j][k];
      if (i === j) L[i][j] = Math.sqrt(Math.max(sum, 1e-12));
      else L[i][j] = sum / L[j][j];
    }
  }
  return L;
}

function solveCholesky(L: number[][], b: number[]) {
  const n = L.length;
  const y = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let s = b[i];
    for (let k = 0; k < i; k++) s -= L[i][k] * y[k];
    y[i] = s / L[i][i];
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i];
    for (let k = i + 1; k < n; k++) s -= L[k][i] * x[k];
    x[i] = s / L[i][i];
  }
  return x;
}

// Expected Improvement (maximização)
function expectedImprovement(mu: number, sigma: number, fBest: number, xi = 0.01) {
  if (sigma < 1e-9) return 0;
  const z = (mu - fBest - xi) / sigma;
  const pdf = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const cdf = 0.5 * (1 + Math.erf(z / Math.SQRT2));
  return (mu - fBest - xi) * cdf + sigma * pdf;
}

export class BayesianOptimizer implements Optimizer {
  constructor(private cfg = {
    initRandom: 8,     // amostras iniciais aleatórias
    lengthScale: 0.5,  // ℓ do kernel RBF
    variance: 1.0,     // σ² do kernel
    noise: 1e-6,       // ruído numérico
    candPerIter: 200,  // candidatos por iteração (EI)
  }) {}

  async run({ objective, bounds, budget, seed = 2025 }: {
    objective: ObjectiveFn; bounds: Bounds[]; budget: number; seed?: number;
  }): Promise<SearchResult> {
    // RNG simples
    let s = seed >>> 0;
    const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff; };

    const D = bounds.length;
    const randomVec = (): number[] => Array.from({ length: D }, () => rnd());

    const X: number[][] = []; // pontos (em [0,1]^D)
    const y: number[] = [];   // avaliações
    const hist: EvalRecord[] = [];
    let best: EvalRecord | null = null;

    const evalVec = async (vec: number[]) => {
      const x = fromVec(bounds, vec.map(v => clamp(v, 0, 1)));
      const val = await objective(x);
      X.push(vec.slice()); y.push(val);
      const rec = { x, y: val }; hist.push(rec);
      if (!best || val > best.y) best = rec;
    };

    // fase inicial
    const nInit = Math.min(this.cfg.initRandom, budget);
    for (let i = 0; i < nInit; i++) await evalVec(randomVec());
    if (nInit >= budget) return { best: best!, history: hist, evaluations: y.length, meta: { method: 'bo', ...this.cfg } };

    // loop principal
    while (y.length < budget) {
      const n = y.length;
      // monta K com ruído
      const K = Array.from({ length: n }, () => Array(n).fill(0));
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
        K[i][j] = rbf(X[i], X[j], this.cfg.lengthScale, this.cfg.variance) + (i === j ? this.cfg.noise : 0);

      const L = cholesky(K);
      const alpha = solveCholesky(L, y);

      const fBest = Math.max(...y);
      let bestCand: number[] | null = null;
      let bestEI = -Infinity;

      // avalia EI em candidatos aleatórios
      for (let c = 0; c < this.cfg.candPerIter; c++) {
        const z = randomVec();

        // μ(z)
        const k = X.map(xi => rbf(xi, z, this.cfg.lengthScale, this.cfg.variance));
        const mu = k.reduce((s, kv, i) => s + kv * alpha[i], 0);

        // σ(z)
        const v = solveCholesky(L, k);
        const kzz = rbf(z, z, this.cfg.lengthScale, this.cfg.variance) + this.cfg.noise;
        const sigma = Math.sqrt(Math.max(kzz - v.reduce((s, vi) => s + vi * vi, 0), 1e-12));

        const ei = expectedImprovement(mu, sigma, fBest, 0.01);
        if (ei > bestEI) { bestEI = ei; bestCand = z; }
      }

      await evalVec(bestCand ?? randomVec());
      if (y.length >= budget) break;
    }

    return { best: best!, history: hist, evaluations: y.length, meta: { method: 'bo', ...this.cfg } };
  }
}
