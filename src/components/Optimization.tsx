// src/components/Optimization.tsx
import React from 'react';
import {
  Play, Beaker, Dna, Brain, Gauge, AlertCircle, Trophy,
  Thermometer, Timer, Wind, BatteryCharging, History as HistoryIcon, Settings2, Leaf, Flame, Zap
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

/** ---- Tipagem local para faixas editáveis ---- */
type Range = {
  min: number;
  max: number;
  step?: number;
  industrial: { min: number; max: number };
  tipica: { min: number; max: number };
};

/** ---- Histórico ---- */
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
  const [runningGrid, setRunningGrid] = React.useState(false);
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
  const text = isDark ? 'text-gray-200' : 'text-gray-800';
  const sub = isDark ? 'text-gray-400' : 'text-gray-600';
  const card = `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-5`;

  const model = React.useMemo(() => getModel('inference'), []);

  // Limites e unidades
  const bounds = {
    temperatura: { min: 1400, max: 1600, unit: 'ºC', icon: <Thermometer className="h-4 w-4" /> },
    tempo:       { min:   10, max:  120, unit: 'min', icon: <Timer className="h-4 w-4" /> },
    pressao:     { min:   95, max:  110, unit: 'un',  icon: <Gauge className="h-4 w-4" /> },
    velocidade:  { min:  250, max:  350, unit: 'rpm', icon: <Wind className="h-4 w-4" /> },
  } as const;

  // Faixas "ótimas"
  const ideal = {
    temperatura: { low: 1470, high: 1530 },
    tempo:       { low: 55,   high: 75   },
    pressao:     { low: 100,  high: 106  },
    velocidade:  { low: 290,  high: 310  },
  } as const;

  /** --- faixas de otimização editáveis --- */
  const [ranges, setRanges] = React.useState<Record<'temperatura'|'tempo'|'pressao'|'velocidade', Range>>({
    temperatura: { min: 1400, max: 1600, step: 5,  industrial: { min: 1400, max: 1600 }, tipica: { min: 1450, max: 1550 } },
    tempo:       { min:   15, max:  120, step: 5,  industrial: { min:   15, max:  120 }, tipica: { min:   30, max:   90 } },
    pressao:     { min:   95, max:  110, step: 1,  industrial: { min:   95, max:  110 }, tipica: { min:  100, max:  106 } },
    velocidade:  { min:  250, max:  350, step: 5,  industrial: { min:  250, max:  350 }, tipica: { min:  290, max:  310 } },
  });

  // Badges
  function badgeFor(name: keyof typeof bounds, v: number) {
    const id = ideal[name];
    if (v < id.low) {
      return { label: 'Baixo', class: isDark ? 'bg-amber-900/50 text-amber-200 border border-amber-700' : 'bg-amber-100 text-amber-700 border border-amber-200' };
    }
    if (v > id.high) {
      return { label: 'Alto', class: isDark ? 'bg-rose-900/50 text-rose-200 border border-rose-700' : 'bg-rose-100 text-rose-700 border border-rose-200' };
    }
    return { label: 'Ótimo', class: isDark ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700' : 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
  }
  function qualityBadge(q: number) {
    if (q < 355) return { label: 'Ruim', class: isDark ? 'bg-rose-900/50 text-rose-200 border border-rose-700' : 'bg-rose-100 text-rose-700 border border-rose-200' };
    if (q < 365) return { label: 'Boa',  class: isDark ? 'bg-amber-900/50 text-amber-200 border border-amber-700' : 'bg-amber-100 text-amber-700 border border-amber-200' };
    return { label: 'Excelente', class: isDark ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700' : 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
  }
  function energyBadge(e: number) {
    if (e < 450) return { label: 'Muito eficiente', class: isDark ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700' : 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
    if (e < 550) return { label: 'Eficiente',        class: isDark ? 'bg-amber-900/50 text-amber-200 border border-amber-700'   : 'bg-amber-100 text-amber-700 border border-amber-200' };
    return { label: 'Ineficiente', class: isDark ? 'bg-rose-900/50 text-rose-200 border border-rose-700' : 'bg-rose-100 text-rose-700 border border-rose-200' };
  }

  const pct = (name: keyof typeof bounds, v: number) => {
    const b = bounds[name];
    return Math.max(0, Math.min(100, ((v - b.min) / (b.max - b.min)) * 100));
  };

  function fullMethodName(m: OptimizeMethod) {
    if (m === 'grid') return 'Grid Search';
    if (m === 'ga') return 'Algoritmo Genético';
    return 'Otimização Bayesiana';
  }

  /** ============ PRESETS POR OBJETIVO ============ */
  type PresetKey = 'resistencia' | 'ductilidade' | 'energia' | 'balanceado';
  const applyPreset = (p: PresetKey) => {
    if (p === 'resistencia') {
      setLambda(0.08);
      setRanges(prev => ({
        ...prev,
        temperatura: { ...prev.temperatura, min: 1480, max: 1560, step: 5 },
        tempo:       { ...prev.tempo,       min:  55,  max:  90,  step: 5 },
        pressao:     { ...prev.pressao,     min: 100,  max: 106,  step: 1 },
        velocidade:  { ...prev.velocidade,  min: 285,  max: 310,  step: 5 },
      }));
      setUseQualityConstraint(true);
      setQualityMin(365);
    } else if (p === 'ductilidade') {
      setLambda(0.12);
      setRanges(prev => ({
        ...prev,
        temperatura: { ...prev.temperatura, min: 1460, max: 1520, step: 5 },
        tempo:       { ...prev.tempo,       min:  45,  max:  75,  step: 5 },
        pressao:     { ...prev.pressao,     min:  99,  max: 106,  step: 1 },
        velocidade:  { ...prev.velocidade,  min: 285,  max: 315,  step: 5 },
      }));
      setUseQualityConstraint(true);
      setQualityMin(360);
    } else if (p === 'energia') {
      setLambda(0.22);
      setRanges(prev => ({
        ...prev,
        temperatura: { ...prev.temperatura, min: 1450, max: 1500, step: 5 },
        tempo:       { ...prev.tempo,       min:  35,  max:  65,  step: 5 },
        pressao:     { ...prev.pressao,     min:  99,  max: 105,  step: 1 },
        velocidade:  { ...prev.velocidade,  min: 290,  max: 305,  step: 5 },
      }));
      setUseQualityConstraint(true);
      setQualityMin(355);
    } else {
      setLambda(0.15);
      setRanges(prev => ({
        ...prev,
        temperatura: { ...prev.temperatura, min: 1400, max: 1600, step: 5 },
        tempo:       { ...prev.tempo,       min:   15, max:  120, step: 5 },
        pressao:     { ...prev.pressao,     min:   95, max:  110, step: 1 },
        velocidade:  { ...prev.velocidade,  min:  250, max:  350, step: 5 },
      }));
      setUseQualityConstraint(false);
      setQualityMin(365);
    }
  };

  // Executar método
  async function executar(method: OptimizeMethod) {
    const setRun = method === 'grid' ? setRunningGrid : method === 'ga' ? setRunningGA : setRunningBO;
    setRun(true);
    try {
      const boundsPayload = {
        temperatura: { min: ranges.temperatura.min, max: ranges.temperatura.max, step: ranges.temperatura.step },
        tempo:       { min: ranges.tempo.min,       max: ranges.tempo.max,       step: ranges.tempo.step },
        pressao:     { min: ranges.pressao.min,     max: ranges.pressao.max,     step: ranges.pressao.step },
        velocidade:  { min: ranges.velocidade.min,  max: ranges.velocidade.max,  step: ranges.velocidade.step },
      };

      const res = await runOptimization({
        method, budget, lambda, useQualityConstraint, qualityMin, seed: 2025,
        bounds: boundsPayload,
      });

      const qe = model.predict({
        temp: Number(res.best.x.temperatura),
        time: Number(res.best.x.tempo),
        press: Number(res.best.x.pressao),
        speed: Number(res.best.x.velocidade),
      });

      const summary: LastSummary = {
        method,
        score: res.best.y,
        x: res.best.x,
        evaluations: res.evaluations,
        quality: qe.quality,
        energy: qe.energy,
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
        lambda,
      };
      pushHistory(item);

      onOptimizationComplete({ ...res, bestParams: res.best.x });
    } catch (e) {
      console.error(e);
      alert('Falha ao executar a otimização.');
    } finally {
      setRun(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho premium */}
      <div
        className={`rounded-2xl p-6 border shadow-[0_10px_30px_rgba(0,0,0,0.06)]
        ${isDark
          ? 'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700'
          : 'bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 border-slate-200'}`}
      >
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${isDark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-100 text-sky-600'}`}>
            <Beaker className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              Otimização de Parâmetros (ML)
            </h2>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} text-sm mt-1`}>
              Escolha um método e ajuste as preferências. O sistema busca a melhor combinação com base em qualidade e energia.
            </p>
          </div>
        </div>
      </div>

      {/* PRESETS premium */}
      <div
        className={`rounded-2xl p-6 border mt-2
        ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`h-9 w-9 flex items-center justify-center rounded-lg ${isDark ? 'bg-violet-500/15 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
              <Settings2 className="h-5 w-5" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Presets por objetivo</h3>
          </div>
          <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>Aplique com 1 clique — você pode ajustar as faixas depois.</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* cards de preset */}
          <PresetCard
            isDark={isDark}
            icon={<Flame className="h-5 w-5 text-rose-500" />}
            title="Alta Resistência"
            desc="Foco em qualidade. T e tempo mais altos (λ baixo)."
            badgeClass={isDark ? 'bg-rose-500/15 text-rose-200 border-rose-400/30' : 'bg-rose-100 text-rose-700 border-rose-200'}
            badgeText="λ ≈ 0.08 · Qualidade ≥ 365"
            onClick={() => applyPreset('resistencia')}
          />
          <PresetCard
            isDark={isDark}
            icon={<Dna className="h-5 w-5 text-emerald-500" />}
            title="Alta Ductilidade"
            desc="Maleabilidade com boa qualidade. T/tempo moderados."
            badgeClass={isDark ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}
            badgeText="λ ≈ 0.12 · Qualidade ≥ 360"
            onClick={() => applyPreset('ductilidade')}
          />
          <PresetCard
            isDark={isDark}
            icon={<Leaf className="h-5 w-5 text-lime-600" />}
            title="Economia de Energia"
            desc="Reduz custo/CO₂. T/tempo menores (λ mais alto)."
            badgeClass={isDark ? 'bg-lime-500/15 text-lime-200 border-lime-400/30' : 'bg-lime-100 text-lime-700 border-lime-200'}
            badgeText="λ ≈ 0.22 · Qualidade ≥ 355"
            onClick={() => applyPreset('energia')}
          />
          <PresetCard
            isDark={isDark}
            icon={<Zap className="h-5 w-5 text-sky-500" />}
            title="Balanceado"
            desc="Equilíbrio padrão. Você ajusta depois, se quiser."
            badgeClass={isDark ? 'bg-sky-500/15 text-sky-200 border-sky-400/30' : 'bg-sky-100 text-sky-700 border-sky-200'}
            badgeText="λ ≈ 0.15 · Qualidade mínima opcional"
            onClick={() => applyPreset('balanceado')}
          />
        </div>
      </div>

      {/* Métodos + Configurações (mantidos) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:col-span-3">
          <MethodCard
            isDark={isDark}
            icon={<Beaker className="h-5 w-5 text-purple-500" />}
            title="Grid Search"
            desc="Testa várias combinações de parâmetros como se fosse uma tabela. Simples, mas pode levar mais tempo quando há muitas opções."
            running={runningGrid}
            onClick={() => executar('grid')}
            btnClass="bg-blue-600 hover:bg-blue-700"
            runningText="Executando…"
            idleText="Executar Grid Search"
          />
          <MethodCard
            isDark={isDark}
            icon={<Dna className="h-5 w-5 text-green-500" />}
            title="Algoritmo Genético"
            desc="Funciona como a evolução da natureza: mistura e seleciona os melhores parâmetros a cada rodada, refinando até achar combinações mais fortes."
            running={runningGA}
            onClick={() => executar('ga')}
            btnClass="bg-blue-600 hover:bg-blue-700"
            runningText="Executando…"
            idleText="Executar Algoritmo Genético"
          />
          <MethodCard
            isDark={isDark}
            icon={<Brain className="h-5 w-5 text-rose-500" />}
            title="Otimização Bayesiana"
            desc="Usa inteligência estatística: aprende com cada teste e sugere os próximos parâmetros de forma esperta, gastando menos tentativas."
            running={runningBO}
            onClick={() => executar('bo')}
            btnClass="bg-blue-600 hover:bg-blue-700"
            runningText="Executando…"
            idleText="Executar Otimização Bayesiana"
          />
        </div>

        {/* Configurações */}
        <div className={card}>
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-5 w-5 text-emerald-500" />
            <h3 className={`font-semibold ${text}`}>Configurações</h3>
          </div>

          <div className="mb-4">
            <label className={`block text-sm mb-1 ${label}`}>Budget (nº de testes)</label>
            <input type="range" min={50} max={1000} step={10} value={budget} onChange={(e) => setBudget(parseInt(e.target.value))} className="w-full" />
            <div className={`${text} text-sm mt-1`}>{budget}</div>
          </div>

          <div className="mb-4">
            <label className={`block text-sm mb-1 ${label}`}>
              Equilíbrio entre qualidade e energia
              <span className="block text-xs text-gray-500">Valores menores = foco em qualidade · Valores maiores = foco em economia de energia</span>
            </label>
            <input type="range" min={0} max={0.5} step={0.01} value={lambda} onChange={(e) => setLambda(parseFloat(e.target.value))} className="w-full" />
            <div className={`${text} text-sm mt-1`}>{lambda.toFixed(2)}</div>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <label className={`flex items-center gap-2 ${label}`}>
              <input type="checkbox" checked={useQualityConstraint} onChange={(e) => setUseQualityConstraint(e.target.checked)} />
              Exigir qualidade mínima
            </label>
          </div>
          <div className={`${useQualityConstraint ? '' : 'opacity-50 pointer-events-none'}`}>
            <label className={`block text-sm mb-1 ${label}`}>Qualidade mínima</label>
            <input type="range" min={340} max={380} step={1} value={qualityMin} onChange={(e) => setQualityMin(parseInt(e.target.value))} className="w-full" />
            <div className={`${text} text-sm mt-1`}>{qualityMin}</div>
          </div>
        </div>
      </div>

      {/* === FAIXAS DE OTIMIZAÇÃO — design premium === */}
      <div
        className={`rounded-2xl p-6 border
        ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
              <Settings2 className="h-4 w-4" />
            </div>
            <h3 className={`${isDark ? 'text-slate-100' : 'text-slate-800'} font-bold`}>Faixas de Otimização</h3>
          </div>
          <span className="text-xs text-gray-500">Defina onde cada algoritmo pode buscar o melhor ajuste</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RangeCard title="Temperatura" name="temperatura" unit="ºC" isDark={isDark} value={ranges.temperatura} onChange={(next) => setRanges(prev => ({ ...prev, temperatura: next }))} />
          <RangeCard title="Tempo"        name="tempo"        unit="min" isDark={isDark} value={ranges.tempo}        onChange={(next) => setRanges(prev => ({ ...prev, tempo: next }))} />
          <RangeCard title="Pressão"      name="pressao"      unit="un"  isDark={isDark} value={ranges.pressao}      onChange={(next) => setRanges(prev => ({ ...prev, pressao: next }))} />
          <RangeCard title="Velocidade"   name="velocidade"   unit="rpm" isDark={isDark} value={ranges.velocidade}   onChange={(next) => setRanges(prev => ({ ...prev, velocidade: next }))} />
        </div>

        <p className="text-xs text-gray-500 mt-3">
          💡 Dica: passos menores aumentam a precisão no <b>Grid Search</b>, mas ampliam o número de testes. Algoritmo Genético e Bayesiano não usam o passo.
        </p>
      </div>

      {/* Resultado premium (melhor encontrado) */}
      {last && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-green-700 bg-gradient-to-br from-gray-800 to-gray-900' : 'border-green-200 bg-gradient-to-br from-green-50 to-white'}`}>
          <div className={`flex items-center justify-between px-6 py-5 ${isDark ? 'bg-gray-900/40' : 'bg-green-100/80'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isDark ? 'bg-green-700/40' : 'bg-green-500'} text-white`}><Trophy className="h-5 w-5" /></div>
              <div>
                <h3 className={`text-lg font-extrabold ${isDark ? 'text-green-300' : 'text-green-700'}`}>Melhor Resultado Encontrado</h3>
                <p className={`${sub} text-xs`}>{last.evaluations} testes realizados</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className={`text-xs ${sub}`}>Score</span>
                <span
                  className={`cursor-help text-xs ${isDark ? 'bg-blue-900/60 text-blue-200 border border-blue-800' : 'bg-blue-100 text-blue-700 border border-blue-200'} px-2 py-0.5 rounded-full`}
                  title={`O score combina qualidade prevista e consumo de energia em um só valor.
Valores menores no controle de equilíbrio priorizam qualidade. Valores maiores priorizam economia de energia.`}
                >
                  ℹ️
                </span>
              </div>
              <div className={`text-4xl font-black ${isDark ? 'text-green-300' : 'text-green-700'}`}>{last.score.toFixed(2)}</div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
                <div className="text-xs uppercase tracking-wide text-gray-500">Método utilizado</div>
                <div className={`mt-1 text-lg font-semibold ${text}`}>{fullMethodName(last.method)}</div>
              </div>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-gray-500">Qualidade prevista</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${qualityBadge(last.quality).class}`}>{qualityBadge(last.quality).label}</span>
                </div>
                <div className={`mt-1 text-2xl font-extrabold ${text}`}>{last.quality.toFixed(1)}<span className="text-lg text-gray-500">/400</span></div>
              </div>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-gray-500">Consumo energético</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${energyBadge(last.energy).class}`}>
                    <BatteryCharging className="inline h-3 w-3 mr-1" />{energyBadge(last.energy).label}
                  </span>
                </div>
                <div className={`mt-1 text-2xl font-extrabold ${text}`}>{last.energy.toFixed(1)} <span className="text-sm text-gray-500">kWh/ton</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ParamCard title="Temperatura" name="temperatura" value={Number(last.x.temperatura)} unit={bounds.temperatura.unit} min={bounds.temperatura.min} max={bounds.temperatura.max} badge={badgeFor('temperatura', Number(last.x.temperatura))} icon={bounds.temperatura.icon} isDark={isDark} pct={pct('temperatura', Number(last.x.temperatura))} />
              <ParamCard title="Tempo"        name="tempo"        value={Number(last.x.tempo)}        unit={bounds.tempo.unit}        min={bounds.tempo.min}        max={bounds.tempo.max}        badge={badgeFor('tempo', Number(last.x.tempo))}              icon={bounds.tempo.icon}        isDark={isDark} pct={pct('tempo', Number(last.x.tempo))} />
              <ParamCard title="Pressão"      name="pressao"      value={Number(last.x.pressao)}      unit={bounds.pressao.unit}      min={bounds.pressao.min}      max={bounds.pressao.max}      badge={badgeFor('pressao', Number(last.x.pressao))}          icon={bounds.pressao.icon}      isDark={isDark} pct={pct('pressao', Number(last.x.pressao))} />
              <ParamCard title="Velocidade"   name="velocidade"   value={Number(last.x.velocidade)}   unit={bounds.velocidade.unit}   min={bounds.velocidade.min}   max={bounds.velocidade.max}   badge={badgeFor('velocidade', Number(last.x.velocidade))}     icon={bounds.velocidade.icon}   isDark={isDark} pct={pct('velocidade', Number(last.x.velocidade))} />
            </div>

            <div className={`text-sm ${sub}`}>
              💡 O score combina qualidade e eficiência energética via o controle “Equilíbrio entre qualidade e energia”.
              Ajuste esse controle para priorizar custo/CO₂ (energia) ou qualidade do produto.
            </div>
          </div>
        </div>
      )}

      {/* === HISTÓRICO — design premium === */}
      <div
        className={`rounded-2xl p-6 border
        ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-indigo-500/15 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
              <HistoryIcon className="h-4 w-4" />
            </div>
            <h3 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Histórico de Otimizações</h3>
          </div>
          <button
            onClick={clearHistory}
            className={`text-xs px-3 py-1 rounded-md border transition ${
              isDark ? 'border-slate-600 text-slate-200 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Limpar histórico
          </button>
        </div>

        {history.length === 0 ? (
          <div className={`text-sm ${sub}`}>Nenhuma execução registrada ainda.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {history.map(item => (
              <div
                key={item.id}
                className={`rounded-xl p-4 border transition ${
                  isDark ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'
                } shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{fullMethodName(item.method)}</div>
                  <div className="text-xs text-gray-500">{new Date(item.ts).toLocaleString('pt-BR')}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <KPI label="Score" value={item.score.toFixed(2)} />
                  <KPI label="Testes" value={String(item.evaluations)} />
                  <KPI label="Qualidade" value={item.quality.toFixed(1)} />
                  <KPI label="Energia" value={`${item.energy.toFixed(1)} kWh/ton`} />
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  λ: {item.lambda.toFixed(2)} · Parâmetros: T={item.x.temperatura?.toFixed?.(1) ?? item.x.temperatura}ºC; t={item.x.tempo?.toFixed?.(1) ?? item.x.tempo} min; p={item.x.pressao?.toFixed?.(1) ?? item.x.pressao}; v={item.x.velocidade?.toFixed?.(1) ?? item.x.velocidade} rpm
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notas finais */}
      <div className={card}>
        <p className={`${sub} text-xs leading-relaxed`}>
          Objetivo: <i>qualidade − λ·(energia − 500)</i>. Ative a restrição para exigir qualidade mínima (ex.: 365).
          Grid Search varre combinações; o Genético evolui soluções; a Bayesiana aprende com cada teste para testar menos.
        </p>
      </div>
    </div>
  );
};

/** --- componentes auxiliares --- */
function PresetCard({
  isDark, icon, title, desc, badgeClass, badgeText, onClick,
}: {
  isDark: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  badgeClass: string;
  badgeText: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group rounded-xl p-4 border transition ${
        isDark ? 'bg-slate-800/90 border-slate-700 hover:border-slate-600 hover:shadow-lg'
               : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <div className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{title}</div>
      </div>
      <div className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{desc}</div>
      <div className={`mt-3 inline-block px-2.5 py-1 rounded-full text-[11px] border ${badgeClass}`}>{badgeText}</div>
    </button>
  );
}

function MethodCard({
  isDark, icon, title, desc, running, onClick, btnClass, runningText, idleText,
}: {
  isDark: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  running: boolean;
  onClick: () => void;
  btnClass: string;
  runningText: string;
  idleText: string;
}) {
  const text = isDark ? 'text-gray-200' : 'text-gray-800';
  const sub  = isDark ? 'text-gray-400' : 'text-gray-600';
  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-5`}>
      <div className="flex items-center gap-2 mb-2">{icon}<h3 className={`font-semibold ${text}`}>{title}</h3></div>
      <p className={`${sub} text-sm mb-4`}>{desc}</p>
      <button
        onClick={onClick}
        disabled={running}
        className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${running ? 'bg-gray-400 cursor-not-allowed' : btnClass} text-white`}
      >
        <Play className="h-5 w-5" />
        {running ? runningText : idleText}
      </button>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[11px] text-gray-500 mb-0.5">{label}</div>
      <div className="text-base font-bold text-slate-800 dark:text-slate-100">{value}</div>
    </div>
  );
}

/** Mini-card reutilizável para cada parâmetro com badge e barra de posição */
function ParamCard(props: {
  title: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  badge: { label: string; class: string };
  icon: React.ReactNode;
  isDark: boolean;
  pct: number;
}) {
  const { title, value, unit, min, max, badge, icon, isDark, pct } = props;
  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>{icon}</div>
          <span className="text-xs uppercase tracking-wide text-gray-500">{title}</span>
        </div>
        <span className="text-xs text-gray-500">{min}–{max} {unit}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className={`${isDark ? 'text-gray-100' : 'text-gray-900'} text-2xl font-extrabold`}>
          {value.toFixed(1)} <span className="text-sm font-semibold text-gray-500">{unit}</span>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${badge.class}`}>{badge.label}</span>
      </div>

      <div className="mt-3">
        <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div className={`h-2 rounded-full ${isDark ? 'bg-emerald-600' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

/** Card reutilizável para edição de faixas — com contraste melhor no dark mode */
function RangeCard({
  title, name, unit, isDark, value, onChange, showGridHint = true
}: {
  title: string;
  name: 'temperatura'|'tempo'|'pressao'|'velocidade';
  unit: string;
  isDark: boolean;
  value: {
    min: number; max: number; step?: number;
    industrial: { min: number; max: number };
    tipica: { min: number; max: number };
  };
  onChange: (next: any) => void;
  showGridHint?: boolean;
}) {
  const card = `${isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-white border-slate-200'} rounded-xl p-4 border shadow-sm`;
  const label = 'text-xs text-gray-500';
  const set = (patch: Partial<typeof value>) => onChange({ ...value, ...patch });

  const clamp = (v: number) => Math.min(value.industrial.max, Math.max(value.industrial.min, v));

  const step = Math.max(1, Number(value.step ?? 1));
  const points = Math.floor((value.max - value.min) / step) + 1;
  const invalid = value.min >= value.max;

  const inputClass = isDark
    ? 'w-full mt-1 rounded border px-2 py-1 bg-slate-800 text-slate-100 placeholder-slate-400 border-slate-600 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/40'
    : 'w-full mt-1 rounded border px-2 py-1 bg-white text-slate-800 placeholder-slate-400 border-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200';

  return (
    <div className={card}>
      <div className="flex items-center justify-between">
        <h4 className={`${isDark ? 'text-slate-100' : 'text-slate-800'} font-semibold`}>{title}</h4>
        <span className={`${isDark ? 'text-slate-300' : 'text-slate-500'} text-xs`}>
          Limites industriais: {value.industrial.min}–{value.industrial.max} {unit}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        <div>
          <label className={label}>Mínimo</label>
          <input
            type="number"
            value={value.min}
            onChange={e => set({ min: clamp(Number(e.target.value)) })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={label}>Máximo</label>
          <input
            type="number"
            value={value.max}
            onChange={e => set({ max: clamp(Number(e.target.value)) })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={label}>Passo (Grid)</label>
          <input
            type="number"
            value={value.step ?? 1}
            min={1}
            onChange={e => set({ step: Math.max(1, Number(e.target.value)) })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-3 text-xs flex items-center justify-between">
        <span className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Faixa típica: {value.tipica.min}–{value.tipica.max} {unit}
        </span>
        {showGridHint && (
          <span className={`${invalid ? 'text-rose-500' : (isDark ? 'text-slate-200' : 'text-slate-700')}`}>
            {invalid ? 'Faixa inválida (mín ≥ máx)' : <>Espaço (Grid): <b>{points}</b> pontos</>}
          </span>
        )}
      </div>
    </div>
  );
}







