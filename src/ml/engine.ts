// src/ml/engine.ts
// Motor nativo de ML/IA com modelos plugáveis (inferência x simulação)

// -------- Tipos públicos --------
export type CalcMode = 'inference' | 'simulation';

export type Params = {
  temp: number;   // 1400..1600 ºC
  time: number;   // 10..120 min
  press: number;  // 95..110
  speed: number;  // 250..350
};

export type Prediction = {
  quality: number; // 300..400 (índice de qualidade)
  energy: number;  // 350..700 (kWh/ton)
};

export interface Model {
  predict(p: Params): Prediction;
}

// -------- Utilitários numéricos --------
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const norm = (x: number, a: number, b: number) => (clamp(x, a, b) - a) / (b - a);

// RNG sementeado (xorshift32)
export function makeRng(seed = 123456): () => number {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17; s >>>= 0;
    s ^= s << 5;  s >>>= 0;
    return (s >>> 0) / 0xffffffff;
  };
}

// Normal(0,1) via Box–Muller
function gaussian(rng: () => number) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// -------- Núcleo: predição base --------
function basePrediction(p: Params, noiseStd = 2, rng?: () => number): Prediction {
  const tN  = norm(p.temp, 1400, 1600);
  const tiN = norm(p.time, 10, 120);
  const prN = norm(p.press, 95, 110);
  const spN = norm(p.speed, 250, 350);

  let quality =
    320 +
    45 * (0.3 + 0.7 * Math.pow(tN, 0.8)) +
    25 * Math.exp(-Math.pow(tiN - 0.65, 2) / 0.3) +
    20 * (prN + 0.3 * Math.sin(prN * Math.PI * 2)) +
    15 * (Math.sqrt(spN) + 0.2 * Math.cos(spN * Math.PI)) +
    8  * tN * tiN + 4 * prN * spN + 3 * tN * prN;

  if (noiseStd > 0) {
    const g = rng ? gaussian(rng) : (Math.random() - 0.5) * 2.2;
    quality += g * noiseStd;
  }
  quality = clamp(Math.round(quality * 100) / 100, 300, 400);

  let energy =
    400 +
    120 * tN +
    40  * tiN +
    30  * prN +
    25  * spN;

  if (noiseStd > 0) {
    const g = rng ? gaussian(rng) : (Math.random() - 0.5) * 2.2;
    energy += g * (noiseStd * 5);
  }
  energy = clamp(Math.round(energy * 100) / 100, 350, 700);

  return { quality, energy };
}

// -------- Modelo de Produção --------
export class MetallurgyInferenceModel implements Model {
  predict(p: Params): Prediction {
    return basePrediction(p, 2);
  }
}

// -------- Modelo de Simulação --------
export class MetallurgySimulationModel implements Model {
  private rng: () => number;
  private meanTarget = 355;  // regressão à média
  private pull = 0.6;        // intensidade do "puxão"
  private minQ = 340;        // faixa mínima da simulação
  private maxQ = 370;        // faixa máxima da simulação

  constructor(seed = 2025) {
    this.rng = makeRng(seed);
  }

  predict(p: Params): Prediction {
    const distFromCenter =
      Math.abs(p.temp - 1500) / 200 +
      Math.abs(p.time - 65)  / 110 +
      Math.abs(p.press - 103)/ 15  +
      Math.abs(p.speed - 300)/ 100;

    const noiseStd = 2 + 3 * clamp(distFromCenter, 0, 1.6);
    let { quality, energy } = basePrediction(p, noiseStd, this.rng);

    const pullToMean = -(quality - this.meanTarget) * this.pull;
    quality = quality + pullToMean + gaussian(this.rng) * 3.2;

    quality = clamp(quality, this.minQ, this.maxQ);
    energy = clamp(energy + gaussian(this.rng) * 8, 350, 700);

    quality = Math.round(quality * 100) / 100;
    energy  = Math.round(energy * 100) / 100;

    return { quality, energy };
  }
}

// -------- Factory --------
export function getModel(mode: CalcMode, opts?: { seed?: number }): Model {
  if (mode === 'simulation') return new MetallurgySimulationModel(opts?.seed ?? 2025);
  return new MetallurgyInferenceModel();
}

// -------- (Opcional) Amostragem LHS --------
export function latinHypercubeSample(
  n: number,
  bounds: { min: number; max: number },
  rng = makeRng(42)
) {
  const step = 1 / n;
  const arr = Array.from({ length: n }, (_, i) => (i + rng()) * step);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.map(u => bounds.min + u * (bounds.max - bounds.min));
}
