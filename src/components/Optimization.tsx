// src/components/Optimization.tsx
import React from 'react';
import {
  Play, Beaker, Dna, Brain, Gauge, AlertCircle, Trophy,
  Thermometer, Timer, Wind, BatteryCharging, History as HistoryIcon, Settings2, Leaf, Flame, Zap, Download
} from 'lucide-react';
import type { OptimizeMethod } from '../optim/runner';
import { runOptimization } from '../optim/runner';
import { getModel } from '../ml/engine';

type Props = {
  t: (k: string) => string;
  isDark: boolean;
  onOptimizationComplete: (res: any) => void;
};

type LastSummary = {
  method: OptimizeMethod;
  score: number;
  x: Record<string, number>;
  evaluations: number;
  quality: number;
  energy: number;
};

type Range = {
  min: number;
  max: number;
  step?: number;
  industrial: { min: number; max: number };
  tipica: { min: number; max: number };
};

type HistoryItem = {
  id: string;
  ts: number;
  method: OptimizeMethod;
  score: number;
  evaluations: number;
  x: Record<string, number>;
  quality: number;
  energy: number;
  lambda: number;
};

const HIST_KEY = 'opt_history_v1';

export const Optimization: React.FC<Props> = ({ t, isDark, onOptimizationComplete }) => {
  // Controles globais
  const [budget, setBudget] = React.useState<number>(200);
  const [lambda, setLambda] = React.useState<number>(0.15);
  const [useQualityConstraint, setUseQualityConstraint] = React.useState<boolean>(false);
  const [qualityMin, setQualityMin] = React.useState<number>(365);

  // Estados de execução
  the const [runningGrid, setRunningGrid] = React.useState(false);
  const [runningGA, setRunningGA] = React.useState(false);
  const [runningBO, setRunningBO] = React.useState(false);

  const [last, setLast] = React.useState<LastSummary | null>(null);

  // Histórico
  const [history, setHistory] = React.useState<HistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(HIST_KEY);
      return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
    } catch {
      return [];
    }
  });

  const saveHistory = React.useCallback((items: HistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(HIST_KEY, JSON.stringify(items));
    } catch {}
  }, []);

  const pushHistory = React.useCallback(
    (item: HistoryItem) => {
      const items = [item, ...history].slice(0, 20);
      saveHistory(items);
    },
    [history, saveHistory]
  );

  const clearHistory = () => saveHistory([]);

  const label = isDark ? 'text-gray-300' : 'text-gray-700';
  const text = isDark ? 'text-gray-100' : 'text-gray-900';
  const sub = isDark ? 'text-gray-400' : 'text-gray-600';

  // Helpers premium
  const ringBlue =
    'hover:ring-2 hover:ring-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50';
  const ringEmerald =
    'hover:ring-2 hover:ring-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50';
  const ringViolet =
    'hover:ring-2 hover:ring-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400/50';

  // Card base com hover glow
  const cardBase = `${
    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  } rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl`;

  // Gradientes premium
  const gradBlue = `${
    isDark ? 'from-blue-950/70 to-gray-900/60 border-blue-900/40' : 'from-blue-50 to-white border-blue-200'
  }`;
  const gradEmerald = `${
    isDark
      ? 'from-emerald-950/70 to-gray-900/60 border-emerald-900/40'
      : 'from-emerald-50 to-white border-emerald-200'
  }`;
  const gradViolet = `${
    isDark ? 'from-violet-950/70 to-gray-900/60 border-violet-900/40' : 'from-violet-50 to-white border-violet-200'
  }`;

  const model = React.useMemo(() => getModel('inference'), []);

  // Limites e unidades
  const bounds = {
    temperatura: { min: 1400, max: 1600, unit: 'ºC', icon: <Thermometer className="h-4 w-4" /> },
    tempo: { min: 10, max: 120, unit: 'min', icon: <Timer className="h-4 w-4" /> },
    pressao: { min: 95, max: 110, unit: 'un', icon: <Gauge className="h-4 w-4" /> },
    velocidade: { min: 250, max: 350, unit: 'rpm', icon: <Wind className="h-4 w-4" /> }
  } as const;

  // Faixas ótimas (para badges)
  const ideal = {
    temperatura: { low: 1470, high: 1530 },
    tempo: { low: 55, high: 75 },
    pressao: { low: 100, high: 106 },
    velocidade: { low: 290, high: 310 }
  } as const;

  /** Faixas de otimização editáveis */
  const [ranges, setRanges] = React.useState<
    Record<'temperatura' | 'tempo' | 'pressao' | 'velocidade', Range>
  >({
    temperatura: {
      min: 1400,
      max: 1600,
      step: 5,
      industrial: { min: 1400, max: 1600 },
      tipica: { min: 1450, max: 1550 }
    },
    tempo: {
      min: 15,
      max: 120,
      step: 5,
      industrial: { min: 15, max: 120 },
      tipica: { min: 30, max: 90 }
    },
    pressao: {
      min: 95,
      max: 110,
      step: 1,
      industrial: { min: 95, max: 110 },
      tipica: { min: 100, max: 106 }
    },
    velocidade: {
      min: 250,
      max: 350,
      step: 5,
      industrial: { min: 250, max: 350 },
      tipica: { min: 290, max: 310 }
    }
  });

  // Badges
  function badgeFor(name: keyof typeof bounds, v: number) {
    const id = ideal[name];
    if (v < id.low) {
      return {
        label: 'Baixo',
        class: isDark
          ? 'bg-amber-900/50 text-amber-200 border border-amber-700'
          : 'bg-amber-100 text-amber-700 border-amber-200'
      };
    }
    if (v > id.high) {
      return {
        label: 'Alto',
        class: isDark
          ? 'bg-rose-900/50 text-rose-200 border border-rose-700'
          : 'bg-rose-100 text-rose-700 border-rose-200'
      };
    }
    return {
      label: 'Ótimo',
      class: isDark
        ? 'bg-emerald-900/50 text-emerald-200 border-emerald-700'
        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
  }

  function qualityBadge(q: number) {
    if (q < 355) {
      return {
        label: 'Ruim',
        class: isDark
          ? 'bg-rose-900/50 text-rose-200 border border-rose-700'
          : 'bg-rose-100 text-rose-700 border-rose-200'
      };
    }
    if (q < 365) {
      return {
        label: 'Boa',
        class: isDark
          ? 'bg-amber-900/50 text-amber-200 border-amber-700'
          : 'bg-amber-100 text-amber-700 border-amber-200'
      };
    }
    return {
      label: 'Excelente',
      class: isDark
        ? 'bg-emerald-900/50 text-emerald-200 border-emerald-700'
        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
  }

  function energyBadge(e: number) {
    if (e < 450) {
      return {
        label: 'Muito eficiente',
        class: isDark
          ? 'bg-emerald-900/50 text-emerald-200 border-emerald-700'
          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
      };
    }
    if (e < 550) {
      return {
        label: 'Eficiente',
        class: isDark
          ? 'bg-amber-900/50 text-amber-200 border-amber-700'
          : 'bg-amber-100 text-amber-700 border-amber-200'
      };
    }
    return {
      label: 'Ineficiente',
      class: isDark
        ? 'bg-rose-900/50 text-rose-200 border-rose-700'
        : 'bg-rose-100 text-rose-700 border-rose-200'
    };
  }

  // Posição percentual p/ barra de parâmetros do resultado
  const pct = (name: keyof typeof bounds, v: number) => {
    const b = bounds[name];
    return Math.max(0, Math.min(100, ((v - b.min) / (b.max - b.min)) * 100));
  };

  // Nome completo do método
  function fullMethodName(m: OptimizeMethod) {
    if (m === 'grid') return 'Grid Search';
    if (m === 'ga') return 'Algoritmo Genético';
    return 'Otimização Bayesiana';
  }

  /** ============ PRESETS POR OBJETIVO ============ */
  type PresetKey = 'resistencia' | 'ductilidade' | 'energia' | 'balanceado';
  const [activePreset, setActivePreset] = React.useState<PresetKey | null>(null);

  const applyPreset = (p: PresetKey) => {
    setActivePreset(p);
    if (p === 'resistencia') {
      setLambda(0.08);
      setRanges(prev => ({
        ...prev,
        temperatura: { ...prev.temperatura, min: 1480, max: 1560, step: 5 },
        tempo: { ...prev.tempo, min: 55, max: 90, step: 5 },
        pressao: { ...prev.pressao, min: 100, max: 106, step: 1 },
        velocidade: { ...prev.velocidade, min: 285, max: 310, step: 5 }
      }));
      setUseQualityConstraint(true);
      setQualityMin(365);
    } else if (p === 'ductilidade') {
      setLambda(0.12);
      setRanges(prev => ({
        ...prev,
        temperatura: { ...prev.temperatura, min: 1460, max: 1520, step: 5 },
        tempo: { ...prev.tempo, min: 45, max: 75, step: 5 },
        pressao: { ...prev.pressao, min: 99, max: 106, step: 1 },
        velocidade: { ...prev.velocidade, min: 285, max: 315, step: 5 }
      }));
      setUseQualityConstraint(true);
      setQualityMin(360);
    } else if (p === 'energia') {
      setLambda(0.22);
      setRanges(prev => ({
        ...prev,
        temperatura: { ...prev.temperatura, min: 1450, max: 1500, step: 5 },
        tempo: { ...prev.tempo, min: 35, max: 65, step: 5 },
        pressao: { ...prev.pressao, min: 99, max: 105, step: 1 },
        velocidade: { ...prev.velocidade, min: 290, max: 305, step: 5 }
      }));
      setUseQualityConstraint(true);
      setQualityMin(355);
    } else {
      setLambda(0.15);
      setRanges(prev => ({
        ...prev,
        temperatura: { ...prev.temperatura, min: 1400, max: 1600, step: 5 },
        tempo: { ...prev.tempo, min: 15, max: 120, step: 5 },
        pressao: { ...prev.pressao, min: 95, max: 110, step: 1 },
        velocidade: { ...prev.velocidade, min: 250, max: 350, step: 5 }
      }));
      setUseQualityConstraint(false);
      setQualityMin(365);
    }
  };

  // ===== status visual / toast / ref para auto-scroll =====
  const isAnyRunning = runningGrid || runningGA || runningBO;
  const [showToast, setShowToast] = React.useState(false);
  const resultRef = React.useRef<HTMLDivElement | null>(null);

  function notifyAndRevealResult() {
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 3500);
    window.setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 250);
  }

  // ===== PROGRESSO VISUAL — Bayesiana (indeterminado com fallback incremental) =====
  const [boProgress, setBoProgress] = React.useState(0);
  React.useEffect(() => {
    if (!runningBO) {
      setBoProgress(0);
      return;
    }
    let p = 0;
    const id = window.setInterval(() => {
      p = Math.min(90, p + Math.random() * 6 + 2);
      setBoProgress(p);
    }, 400);
    return () => window.clearInterval(id);
  }, [runningBO]);

  // ===== Exportar histórico (CSV ; ) =====
  function exportHistoryCSV() {
    if (!history || history.length === 0) return;

    const sep = ';';
    const esc = (s: any) =>
      `"${String(s ?? '').replace(/"/g, '""')}"`;

    const header = [
      'id',
      'timestamp_iso',
      'method',
      'score',
      'evaluations',
      'quality',
      'energy',
      'lambda',
      'temperatura',
      'tempo',
      'pressao',
      'velocidade'
    ].join(sep);

    const rows = history.map((it) => {
      const t = it.ts ? new Date(it.ts).toISOString() : '';
      const temp = (it.x as any)?.temperatura ?? '';
      const tempoVal = (it.x as any)?.tempo ?? '';
      const press = (it.x as any)?.pressao ?? '';
      const vel = (it.x as any)?.velocidade ?? '';
      return [
        esc(it.id),
        esc(t),
        esc(it.method),
        esc(it.score.toFixed(2)),
        esc(it.evaluations),
        esc(it.quality.toFixed(2)),
        esc(it.energy.toFixed(2)),
        esc(it.lambda.toFixed(2)),
        esc(temp),
        esc(tempoVal),
        esc(press),
        esc(vel)
      ].join(sep);
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `historico_otimizacoes_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Executar método
  async function executar(method: OptimizeMethod) {
    const setRun =
      method === 'grid' ? setRunningGrid : method === 'ga' ? setRunningGA : setRunningBO;
    setRun(true);
    try {
      const boundsPayload = {
        temperatura: {
          min: ranges.temperatura.min,
          max: ranges.temperatura.max,
          step: ranges.temperatura.step
        },
        tempo: { min: ranges.tempo.min, max: ranges.tempo.max, step: ranges.tempo.step },
        pressao: { min: ranges.pressao.min, max: ranges.pressao.max, step: ranges.pressao.step },
        velocidade: {
          min: ranges.velocidade.min,
          max: ranges.velocidade.max,
          step: ranges.velocidade.step
        }
      };

      // Yield para o UI mostrar barra/aviso
      await new Promise((r) => setTimeout(r, 30));

      const res = await runOptimization({
        method,
        budget,
        lambda,
        useQualityConstraint,
        qualityMin,
        seed: 2025,
        bounds: boundsPayload
      });

      const qe = model.predict({
        temp: Number(res.best.x.temperatura),
        time: Number(res.best.x.tempo),
        press: Number(res.best.x.pressao),
        speed: Number(res.best.x.velocidade)
      });

      const summary: LastSummary = {
        method,
        score: res.best.y,
        x: res.best.x,
        evaluations: res.evaluations,
        quality: qe.quality,
        energy: qe.energy
      };

      setLast(summary);

      const item: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ts: Date.now(),
        method,
        score: summary.score,
        evaluations: summary.evaluations,
        x: summary.x,
        quality: summary.quality,
        energy: summary.energy,
        lambda
      };
      pushHistory(item);

      onOptimizationComplete({ ...res, bestParams: res.best.x });

      if (method === 'bo') setBoProgress(100);
      notifyAndRevealResult();
    } catch (e) {
      console.error(e);
      alert('Falha ao executar a otimização.');
    } finally {
      setRun(false);
    }
  }

  // ===== estilos premium para sliders e barra indeterminada =====
  const sliderStyle = (
    <style>{`
      .premium-range {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        border-radius: 9999px;
        background: linear-gradient(90deg, rgba(16,185,129,0.25), rgba(59,130,246,0.25));
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 14px 2px rgba(16,185,129,0.25);
        outline: none;
      }
      .dark .premium-range{
        background: linear-gradient(90deg, rgba(16,185,129,0.22), rgba(59,130,246,0.22));
        box-shadow: inset 0 0 0 1px rgba(0,0,0,0.45), 0 0 16px 3px rgba(16,185,129,0.35);
      }
      .premium-range::-webkit-slider-thumb{
        -webkit-appearance: none;
        appearance: none;
        width: 18px; height: 18px;
        border-radius: 9999px;
        background: #10b981;
        border: 2px solid rgba(255,255,255,0.8);
        box-shadow: 0 0 0 3px rgba(16,185,129,0.25), 0 0 20px rgba(16,185,129,0.45);
        margin-top: -6px;
      }
      .dark .premium-range::-webkit-slider-thumb{
        background: #22c55e;
        border-color: rgba(255,255,255,0.6);
      }
      .premium-range::-moz-range-thumb{
        width: 18px; height: 18px;
        border-radius: 9999px;
        background: #10b981;
        border: 2px solid rgba(255,255,255,0.8);
        box-shadow: 0 0 0 3px rgba(16,185,129,0.25), 0 0 20px rgba(16,185,129,0.45);
      }
      .dark .premium-range::-moz-range-thumb{
        background: #22c55e;
        border-color: rgba(255,255,255,0.6);
      }

      .progress-track {
        position: relative;
        overflow: hidden;
        height: 8px;
        border-radius: 9999px;
        background: ${isDark ? 'rgba(31,41,55,1)' : 'rgba(229,231,235,1)'};
      }
      .progress-indeterminate::before {
        content: "";
        position: absolute;
        left: -40%;
        top: 0; bottom: 0;
        width: 40%;
        border-radius: 9999px;
        background: linear-gradient(90deg, rgba(16,185,129,0.0) 0%, rgba(16,185,129,0.55) 50%, rgba(16,185,129,0.0) 100%);
        animation: indet 1.0s ease-in-out infinite;
      }
      @keyframes indet {
        0% { left: -40%; }
        100% { left: 100%; }
      }
    `}</style>
  );

  return (
    <div className="space-y-6">
      {sliderStyle}

      {isAnyRunning && (
        <div className="sticky top-2 z-40">
          <div className={`mx-auto w-fit px-4 py-2 rounded-full shadow-lg border backdrop-blur
            ${isDark
              ? 'bg-gray-900/70 border-gray-700 text-gray-100'
              : 'bg-white/80 border-gray-200 text-gray-800'}`}>
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {runningBO && 'Otimizando (Bayesiana)…'}
              {runningGrid && 'Executando Grid Search…'}
              {runningGA && 'Executando Algoritmo Genético…'}
            </span>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div className={`${cardBase} ${ringBlue} p-6`}>
        <div className="flex items-center gap-2 mb-1">
          <Beaker className="h-5 w-5 text-blue-500" />
          <h2 className={`text-xl font-semibold ${text}`}>Otimização de Parâmetros (ML)</h2>
        </div>
        <p className={`${sub} text-sm`}>
          Escolha um método para buscar os melhores parâmetros. As configurações ao lado valem para
          todos os métodos.
        </p>
      </div>

      {/* Presets por objetivo */}
      <div
        className={`rounded-2xl border bg-gradient-to-br ${gradBlue} p-5 transition-all duration-300 hover:shadow-xl ${ringBlue}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings2 className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            <h3 className={`font-semibold ${text}`}>Presets por objetivo</h3>
          </div>
          <span className="text-xs text-gray-500">
            Aplique com 1 clique — você pode ajustar as faixas depois.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* cards de preset (inalterados) */}
          {/* ... (conteúdo igual ao anterior, omitido aqui só para reduzir a resposta) */}
        </div>
      </div>

      {/* Cards dos métodos + Configurações */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Métodos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:col-span-3">
          {/* GRID SEARCH */}
          <div className={`rounded-2xl border bg-gradient-to-br ${gradBlue} p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${ringBlue}`}>
            {/* ... (inalterado) */}
          </div>

          {/* GENÉTICO */}
          <div className={`rounded-2xl border bg-gradient-to-br ${gradBlue} p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${ringBlue}`}>
            {/* ... (inalterado) */}
          </div>

          {/* BAYESIANA */}
          <div className={`rounded-2xl border bg-gradient-to-br ${gradBlue} p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${ringBlue}`}>
            {/* ... (inalterado até o botão) */}
            {/* Barra de progresso — permanece igual ao estado anterior */}
            {/* ... */}
          </div>
        </div>

        {/* Configurações — sliders premium */}
        <div className={`rounded-2xl border bg-gradient-to-br ${gradEmerald} p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${ringEmerald}`}>
          {/* ... (inalterado) */}
        </div>
      </div>

      {/* Faixas de Otimização */}
      <div className={`rounded-2xl border bg-gradient-to-br ${gradViolet} p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${ringViolet}`}>
        {/* ... (inalterado) */}
      </div>

      {/* Resultado premium */}
      {last && (
        <div ref={resultRef} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 ${isDark ? 'border-green-700 bg-gradient-to-br from-gray-800 to-gray-900' : 'border-green-200 bg-gradient-to-br from-green-50 to-white'}`}>
          {/* ... (inalterado) */}
        </div>
      )}

      {/* Histórico – ADIÇÃO: botão Exportar */}
      <div className={`${cardBase} ${ringBlue} p-6`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-indigo-500" />
            <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Histórico de Otimizações
            </h3>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportHistoryCSV}
              disabled={history.length === 0}
              className={`text-xs px-3 py-1 rounded-md border transition flex items-center gap-1
                ${
                  isDark
                    ? 'border-blue-500 text-blue-300 hover:bg-blue-900/30'
                    : 'border-blue-500 text-blue-700 hover:bg-blue-50'
                }
                ${history.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
              title="Exportar histórico em CSV"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>

            <button
              onClick={clearHistory}
              className={`text-xs px-3 py-1 rounded-md border transition 
                ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Limpar histórico
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className={`text-sm ${sub}`}>Nenhuma execução registrada ainda.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ... (cards do histórico inalterados) */}
          </div>
        )}
      </div>

      {/* Notas finais */}
      <div className={`${cardBase} ${ringBlue} p-5`}>
        <p className={`${sub} text-xs leading-relaxed`}>
          Objetivo: <i>qualidade − λ·(energia − 500)</i>. Ative a restrição para exigir qualidade
          mínima (ex.: 365). Grid Search varre combinações; o Genético evolui soluções; a Bayesiana
          aprende com cada teste para testar menos.
        </p>
      </div>

      {/* Toast de sucesso */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* ... (inalterado) */}
      </div>
    </div>
  );
};

/** Mini-card para cada parâmetro no “Melhor Resultado Encontrado” */
// (restante do arquivo permanece idêntico ao seu último envio)









