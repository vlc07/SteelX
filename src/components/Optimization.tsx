// src/components/Optimization.tsx
import React from 'react';
import {
  Play, Beaker, Dna, Brain, Gauge, AlertCircle, Trophy,
  Thermometer, Timer, Wind, BatteryCharging, History as HistoryIcon,
  Settings2, Leaf, Flame, Zap
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

/* ============================================================
   Helpers de estilo – “Design Premium”
   ============================================================ */
function toneClasses(isDark: boolean, tone: 'blue' | 'emerald' | 'slate' | 'purple') {
  // containers com gradiente + borda
  const containers = {
    blue:    isDark ? 'from-blue-950 to-gray-900 border-blue-900/40'    : 'from-blue-50 to-white border-blue-200',
    emerald: isDark ? 'from-emerald-950 to-gray-900 border-emerald-900/40' : 'from-emerald-50 to-white border-emerald-200',
    slate:   isDark ? 'from-slate-950 to-gray-900 border-slate-800/40'     : 'from-slate-50 to-white border-slate-200',
    purple:  isDark ? 'from-purple-950 to-gray-900 border-purple-900/40'   : 'from-purple-50 to-white border-purple-200',
  }[tone];

  // hover glow (anel + sombra suave + micro “lift”)
  const glows = {
    blue:    isDark ? 'hover:ring-2 hover:ring-blue-400/35 hover:shadow-[0_16px_40px_-18px_rgba(59,130,246,.42)]'
                    : 'hover:ring-2 hover:ring-blue-300/40 hover:shadow-[0_18px_40px_-20px_rgba(30,64,175,.30)]',
    emerald: isDark ? 'hover:ring-2 hover:ring-emerald-400/35 hover:shadow-[0_16px_40px_-18px_rgba(16,185,129,.42)]'
                    : 'hover:ring-2 hover:ring-emerald-300/40 hover:shadow-[0_18px_40px_-20px_rgba(16,185,129,.28)]',
    slate:   isDark ? 'hover:ring-2 hover:ring-slate-300/25 hover:shadow-[0_16px_40px_-18px_rgba(148,163,184,.28)]'
                    : 'hover:ring-2 hover:ring-slate-300/35 hover:shadow-[0_18px_40px_-20px_rgba(148,163,184,.24)]',
    purple:  isDark ? 'hover:ring-2 hover:ring-purple-400/35 hover:shadow-[0_16px_40px_-18px_rgba(168,85,247,.42)]'
                    : 'hover:ring-2 hover:ring-purple-300/40 hover:shadow-[0_18px_40px_-20px_rgba(168,85,247,.28)]',
  }[tone];

  const textMain = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSub  = isDark ? 'text-gray-300' : 'text-gray-600';

  return {
    container: `rounded-2xl border bg-gradient-to-br ${containers} transition-all duration-200`,
    bodyPad:   'p-6 md:p-7',
    headerPad: 'px-6 md:px-7 py-5',
    glow:      `${glows} hover:-translate-y-0.5`,
    textMain,
    textSub
  };
}

function PremiumCard({
  tone,
  isDark,
  className = '',
  children,
}: {
  tone: 'blue' | 'emerald' | 'slate' | 'purple';
  isDark: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const t = toneClasses(isDark, tone);
  return (
    <div className={`${t.container} ${t.glow} ${t.bodyPad} ${className}`}>
      {children}
    </div>
  );
}

export const Optimization: React.FC<Props> = ({ t, isDark, onOptimizationComplete }) => {
  // controles
  const [budget, setBudget] = React.useState<number>(200);
  const [lambda, setLambda] = React.useState<number>(0.15);
  const [useQualityConstraint, setUseQualityConstraint] = React.useState<boolean>(false);
  const [qualityMin, setQualityMin] = React.useState<number>(365);

  // execuções
  const [runningGrid, setRunningGrid] = React.useState(false);
  const [runningGA, setRunningGA] = React.useState(false);
  const [runningBO, setRunningBO] = React.useState(false);

  const [last, setLast] = React.useState<LastSummary | null>(null);

  // histórico
  const [history, setHistory] = React.useState<HistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(HIST_KEY);
      return raw ? JSON.parse(raw) as HistoryItem[] : [];
    } catch { return []; }
  });
  const saveHistory = (items: HistoryItem[]) => { setHistory(items); try { localStorage.setItem(HIST_KEY, JSON.stringify(items)); } catch {} };
  const pushHistory = (item: HistoryItem) => saveHistory([item, ...history].slice(0, 20));
  const clearHistory = () => saveHistory([]);

  const toneBlue    = toneClasses(isDark, 'blue');
  const toneEmerald = toneClasses(isDark, 'emerald');
  const toneSlate   = toneClasses(isDark, 'slate');

  const model = React.useMemo(() => getModel('inference'), []);

  const bounds = {
    temperatura: { min: 1400, max: 1600, unit: 'ºC', icon: <Thermometer className="h-4 w-4" /> },
    tempo:       { min:   10, max:  120, unit: 'min', icon: <Timer className="h-4 w-4" /> },
    pressao:     { min:   95, max:  110, unit: 'un',  icon: <Gauge className="h-4 w-4" /> },
    velocidade:  { min:  250, max:  350, unit: 'rpm', icon: <Wind className="h-4 w-4" /> },
  } as const;

  const ideal = {
    temperatura: { low: 1470, high: 1530 },
    tempo:       { low: 55,   high: 75   },
    pressao:     { low: 100,  high: 106  },
    velocidade:  { low: 290,  high: 310  },
  } as const;

  const [ranges, setRanges] = React.useState<Record<'temperatura'|'tempo'|'pressao'|'velocidade', Range>>({
    temperatura: { min: 1400, max: 1600, step: 5, industrial: { min: 1400, max: 1600 }, tipica: { min: 1450, max: 1550 } },
    tempo:       { min:   15, max:  120, step: 5, industrial: { min:   15, max:  120 }, tipica: { min:   30, max:   90 } },
    pressao:     { min:   95, max:  110, step: 1, industrial: { min:   95, max:  110 }, tipica: { min:  100, max:  106 } },
    velocidade:  { min:  250, max:  350, step: 5, industrial: { min:  250, max:  350 }, tipica: { min:  290, max:  310 } },
  });

  function badgeFor(name: keyof typeof bounds, v: number) {
    const id = ideal[name];
    if (v < id.low)  return { label: 'Baixo', class: isDark ? 'bg-amber-900/50 text-amber-200 border border-amber-700' : 'bg-amber-100 text-amber-700 border border-amber-200' };
    if (v > id.high) return { label: 'Alto',  class: isDark ? 'bg-rose-900/50 text-rose-200 border border-rose-700'   : 'bg-rose-100 text-rose-700 border-rose-200' };
    return { label: 'Ótimo', class: isDark ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700' : 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  }
  function qualityBadge(q: number) {
    if (q < 355) return { label: 'Ruim', class: isDark ? 'bg-rose-900/50 text-rose-200 border border-rose-700' : 'bg-rose-100 text-rose-700 border-rose-200' };
    if (q < 365) return { label: 'Boa',  class: isDark ? 'bg-amber-900/50 text-amber-200 border border-amber-700' : 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'Excelente', class: isDark ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700' : 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  }
  function energyBadge(e: number) {
    if (e < 450) return { label: 'Muito eficiente', class: isDark ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700' : 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (e < 550) return { label: 'Eficiente',       class: isDark ? 'bg-amber-900/50 text-amber-200 border border-amber-700' : 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'Ineficiente', class: isDark ? 'bg-rose-900/50 text-rose-200 border border-rose-700' : 'bg-rose-100 text-rose-700 border-rose-200' };
  }
  const pct = (name: keyof typeof bounds, v: number) => {
    const b = bounds[name]; return Math.max(0, Math.min(100, ((v - b.min) / (b.max - b.min)) * 100));
  };
  function fullMethodName(m: OptimizeMethod) {
    if (m === 'grid') return 'Grid Search';
    if (m === 'ga') return 'Algoritmo Genético';
    return 'Otimização Bayesiana';
  }

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
      setUseQualityConstraint(true); setQualityMin(365);
    } else if (p === 'ductilidade') {
      setLambda(0.12);
      setRanges(prev => ({
        ...prev,
        temperatura: { ...prev.temperatura, min: 1460, max: 1520, step: 5 },
        tempo:       { ...prev.tempo,       min:  45,  max:  75,  step: 5 },
        pressao:     { ...prev.pressao,     min:  99,  max: 106,  step: 1 },
        velocidade:  { ...prev.velocidade,  min: 285,  max: 315,  step: 5 },
      }));
      setUseQualityConstraint(true); setQualityMin(360);
    } else if (p === 'energia') {
      setLambda(0.22);
      setRanges(prev => ({
        ...prev,
        temperatura: { ...prev.temperatura, min: 1450, max: 1500, step: 5 },
        tempo:       { ...prev.tempo,       min:  35,  max:  65,  step: 5 },
        pressao:     { ...prev.pressao,     min:  99,  max: 105,  step: 1 },
        velocidade:  { ...prev.velocidade,  min: 290,  max: 305,  step: 5 },
      }));
      setUseQualityConstraint(true); setQualityMin(355);
    } else {
      setLambda(0.15);
      setRanges(prev => ({
        ...prev,
        temperatura: { ...prev.temperatura, min: 1400, max: 1600, step: 5 },
        tempo:       { ...prev.tempo,       min:   15, max:  120, step: 5 },
        pressao:     { ...prev.pressao,     min:   95, max:  110, step: 1 },
        velocidade:  { ...prev.velocidade,  min:  250, max:  350, step: 5 },
      }));
      setUseQualityConstraint(false); setQualityMin(365);
    }
  };

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
      const res = await runOptimization({ method, budget, lambda, useQualityConstraint, qualityMin, seed: 2025, bounds: boundsPayload });

      const qe = model.predict({
        temp: Number(res.best.x.temperatura),
        time: Number(res.best.x.tempo),
        press: Number(res.best.x.pressao),
        speed: Number(res.best.x.velocidade),
      });

      const summary: LastSummary = {
        method, score: res.best.y, x: res.best.x, evaluations: res.evaluations,
        quality: qe.quality, energy: qe.energy,
      };
      setLast(summary);

      pushHistory({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ts: Date.now(), method, score: summary.score, evaluations: summary.evaluations,
        x: summary.x, quality: summary.quality, energy: summary.energy, lambda,
      });

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
      {/* Cabeçalho Premium (azul) */}
      <PremiumCard tone="blue" isDark={isDark}>
        <div className="flex items-center gap-2 mb-2">
          <Beaker className="h-5 w-5 text-blue-400" />
          <h2 className={`text-xl font-semibold ${toneBlue.textMain}`}>Otimização de Parâmetros (ML)</h2>
        </div>
        <p className={`${toneBlue.textSub} text-sm`}>
          Escolha um método e ajuste as preferências. O sistema busca a melhor combinação com base em qualidade e energia.
        </p>
      </PremiumCard>

      {/* Presets Premium (slate) */}
      <PremiumCard tone="slate" isDark={isDark}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings2 className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            <h3 className={`font-semibold ${toneSlate.textMain}`}>Presets por objetivo</h3>
          </div>
          <span className="text-xs text-gray-500">
            Aplique com 1 clique — você pode ajustar as faixas depois.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key:'resistencia', icon:<Flame className="h-5 w-5 text-rose-500"/>, title:'Alta Resistência',
              desc:'Foco em qualidade. T e tempo mais altos (λ baixo).', chip:'λ ≈ 0.08 · Qualidade ≥ 365',
              chipClass:'bg-rose-100 text-rose-700 border border-rose-200' },
            { key:'ductilidade', icon:<Dna className="h-5 w-5 text-green-500"/>, title:'Alta Ductilidade',
              desc:'Maleabilidade com boa qualidade. T/tempo moderados.', chip:'λ ≈ 0.12 · Qualidade ≥ 360',
              chipClass:'bg-green-100 text-green-700 border border-green-200' },
            { key:'energia', icon:<Leaf className="h-5 w-5 text-emerald-500"/>, title:'Economia de Energia',
              desc:'Reduz custo/CO₂. T/tempo menores (λ mais alto).', chip:'λ ≈ 0.22 · Qualidade ≥ 355',
              chipClass:'bg-emerald-100 text-emerald-700 border border-emerald-200' },
            { key:'balanceado', icon:<Zap className="h-5 w-5 text-blue-500"/>, title:'Balanceado',
              desc:'Equilíbrio padrão. Você ajusta depois, se quiser.', chip:'λ ≈ 0.15 · Qualidade mínima opcional',
              chipClass:'bg-blue-100 text-blue-700 border border-blue-200' },
          ].map(p => (
            <PremiumCard key={p.key} tone="blue" isDark={isDark} className="!p-5 text-left">
              <button onClick={() => applyPreset(p.key as any)} className="w-full text-left">
                <div className="flex items-center gap-2">
                  {p.icon}
                  <div className={`font-semibold ${toneBlue.textMain}`}>{p.title}</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{p.desc}</div>
                <div className={`mt-2 text-[11px] inline-block px-2 py-0.5 rounded-full ${p.chipClass}`}>
                  {p.chip}
                </div>
              </button>
            </PremiumCard>
          ))}
        </div>
      </PremiumCard>

      {/* Métodos + Configurações */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Métodos (3 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:col-span-3">
          <PremiumCard tone="blue" isDark={isDark}>
            <div className="flex items-center gap-2 mb-2">
              <Beaker className="h-5 w-5 text-purple-400" />
              <h3 className={`font-semibold ${toneBlue.textMain}`}>Grid Search</h3>
            </div>
            <p className={`${toneBlue.textSub} text-sm mb-4`}>Testa várias combinações como em uma malha (grid).</p>
            <button
              onClick={() => executar('grid')}
              disabled={runningGrid}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition 
                         ${runningGrid ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              <Play className="h-5 w-5" />
              {runningGrid ? 'Executando…' : 'Executar Grid Search'}
            </button>
          </PremiumCard>

          <PremiumCard tone="blue" isDark={isDark}>
            <div className="flex items-center gap-2 mb-2">
              <Dna className="h-5 w-5 text-green-400" />
              <h3 className={`font-semibold ${toneBlue.textMain}`}>Algoritmo Genético</h3>
            </div>
            <p className={`${toneBlue.textSub} text-sm mb-4`}>Evolução iterativa: mistura e seleciona os melhores.</p>
            <button
              onClick={() => executar('ga')}
              disabled={runningGA}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition 
                         ${runningGA ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              <Play className="h-5 w-5" />
              {runningGA ? 'Executando…' : 'Executar Algoritmo Genético'}
            </button>
          </PremiumCard>

          <PremiumCard tone="blue" isDark={isDark}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-rose-400" />
              <h3 className={`font-semibold ${toneBlue.textMain}`}>Otimização Bayesiana</h3>
            </div>
            <p className={`${toneBlue.textSub} text-sm mb-4`}>Aprende com cada teste e sugere próximos parâmetros.</p>
            <button
              onClick={() => executar('bo')}
              disabled={runningBO}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition 
                         ${runningBO ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              <Play className="h-5 w-5" />
              {runningBO ? 'Executando…' : 'Executar Otimização Bayesiana'}
            </button>
          </PremiumCard>
        </div>

        {/* Configurações (verde) */}
        <PremiumCard tone="emerald" isDark={isDark}>
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-5 w-5 text-emerald-400" />
            <h3 className={`font-semibold ${toneEmerald.textMain}`}>Configurações</h3>
          </div>

          <div className="mb-5">
            <label className={`block text-sm mb-1 ${toneEmerald.textSub}`}>Budget (nº de testes)</label>
            <input type="range" min={50} max={1000} step={10} value={budget} onChange={(e)=>setBudget(parseInt(e.target.value))} className="w-full"/>
            <div className={`${toneEmerald.textMain} text-sm mt-1`}>{budget}</div>
          </div>

          <div className="mb-5">
            <label className={`block text-sm mb-1 ${toneEmerald.textSub}`}>
              Equilíbrio entre qualidade e energia
              <span className="block text-xs text-gray-500">Menor = foca em qualidade · Maior = foca em energia</span>
            </label>
            <input type="range" min={0} max={0.5} step={0.01} value={lambda} onChange={(e)=>setLambda(parseFloat(e.target.value))} className="w-full"/>
            <div className={`${toneEmerald.textMain} text-sm mt-1`}>{lambda.toFixed(2)}</div>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <label className={`flex items-center gap-2 ${toneEmerald.textSub}`}>
              <input type="checkbox" checked={useQualityConstraint} onChange={(e)=>setUseQualityConstraint(e.target.checked)}/>
              Exigir qualidade mínima
            </label>
          </div>
          <div className={`${useQualityConstraint ? '' : 'opacity-50 pointer-events-none'}`}>
            <label className={`block text-sm mb-1 ${toneEmerald.textSub}`}>Qualidade mínima</label>
            <input type="range" min={340} max={380} step={1} value={qualityMin} onChange={(e)=>setQualityMin(parseInt(e.target.value))} className="w-full"/>
            <div className={`${toneEmerald.textMain} text-sm mt-1`}>{qualityMin}</div>
          </div>
        </PremiumCard>
      </div>

      {/* Faixas de Otimização (slate) */}
      <PremiumCard tone="slate" isDark={isDark}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold ${toneSlate.textMain}`}>Faixas de Otimização</h3>
          <span className="text-xs text-gray-500">Defina onde cada algoritmo pode buscar o melhor ajuste</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RangeCard title="Temperatura" name="temperatura" unit="ºC" isDark={isDark} value={ranges.temperatura} onChange={(next)=>setRanges(p=>({...p,temperatura:next}))}/>
          <RangeCard title="Tempo"       name="tempo"       unit="min" isDark={isDark} value={ranges.tempo}       onChange={(next)=>setRanges(p=>({...p,tempo:next}))}/>
          <RangeCard title="Pressão"     name="pressao"     unit="un"  isDark={isDark} value={ranges.pressao}     onChange={(next)=>setRanges(p=>({...p,pressao:next}))}/>
          <RangeCard title="Velocidade"  name="velocidade"  unit="rpm" isDark={isDark} value={ranges.velocidade}  onChange={(next)=>setRanges(p=>({...p,velocidade:next}))}/>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          💡 Dica: passos menores aumentam a precisão no <b>Grid Search</b>, mas ampliam o número de testes.
        </p>
      </PremiumCard>

      {/* Melhor Resultado (card especial) */}
      {last && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-green-700 bg-gradient-to-br from-gray-800 to-gray-900' : 'border-green-200 bg-gradient-to-br from-green-50 to-white'}`}>
          <div className={`flex items-center justify-between ${toneEmerald.headerPad} ${isDark ? 'bg-gray-900/40' : 'bg-green-100/80'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isDark ? 'bg-green-700/40' : 'bg-green-500'} text-white`}>
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`text-lg font-extrabold ${isDark ? 'text-green-300' : 'text-green-700'}`}>Melhor Resultado Encontrado</h3>
                <p className={`text-xs ${toneEmerald.textSub}`}>{last.evaluations} testes realizados</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className={`text-xs ${toneEmerald.textSub}`}>Score</span>
                <span className={`cursor-help text-xs ${isDark ? 'bg-blue-900/60 text-blue-200 border border-blue-800' : 'bg-blue-100 text-blue-700 border border-blue-200'} px-2 py-0.5 rounded-full`} title="Score combina qualidade e energia (via λ).">ℹ️</span>
              </div>
              <div className={`text-4xl font-black ${isDark ? 'text-green-300' : 'text-green-700'}`}>{last.score.toFixed(2)}</div>
            </div>
          </div>

          <div className={`${toneEmerald.bodyPad} space-y-6`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
                <div className="text-xs uppercase tracking-wide text-gray-500">Método utilizado</div>
                <div className={`mt-1 text-lg font-semibold ${toneEmerald.textMain}`}>{fullMethodName(last.method)}</div>
              </div>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-gray-500">Qualidade prevista</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${qualityBadge(last.quality).class}`}>{qualityBadge(last.quality).label}</span>
                </div>
                <div className={`mt-1 text-2xl font-extrabold ${toneEmerald.textMain}`}>{last.quality.toFixed(1)}<span className="text-lg text-gray-500">/400</span></div>
              </div>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-gray-500">Consumo energético</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${energyBadge(last.energy).class}`}>
                    <BatteryCharging className="inline h-3 w-3 mr-1"/>{energyBadge(last.energy).label}
                  </span>
                </div>
                <div className={`mt-1 text-2xl font-extrabold ${toneEmerald.textMain}`}>{last.energy.toFixed(1)} <span className="text-sm text-gray-500">kWh/ton</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ParamCard title="Temperatura" name="temperatura" value={Number(last.x.temperatura)} unit={bounds.temperatura.unit} min={bounds.temperatura.min} max={bounds.temperatura.max} badge={badgeFor('temperatura', Number(last.x.temperatura))} icon={bounds.temperatura.icon} isDark={isDark} pct={pct('temperatura', Number(last.x.temperatura))}/>
              <ParamCard title="Tempo"       name="tempo"       value={Number(last.x.tempo)}        unit={bounds.tempo.unit}       min={bounds.tempo.min}       max={bounds.tempo.max}       badge={badgeFor('tempo', Number(last.x.tempo))}                 icon={bounds.tempo.icon}       isDark={isDark} pct={pct('tempo', Number(last.x.tempo))}/>
              <ParamCard title="Pressão"     name="pressao"     value={Number(last.x.pressao)}      unit={bounds.pressao.unit}     min={bounds.pressao.min}     max={bounds.pressao.max}     badge={badgeFor('pressao', Number(last.x.pressao))}             icon={bounds.pressao.icon}     isDark={isDark} pct={pct('pressao', Number(last.x.pressao))}/>
              <ParamCard title="Velocidade"  name="velocidade"  value={Number(last.x.velocidade)}   unit={bounds.velocidade.unit}  min={bounds.velocidade.min}  max={bounds.velocidade.max}  badge={badgeFor('velocidade', Number(last.x.velocidade))}       icon={bounds.velocidade.icon}  isDark={isDark} pct={pct('velocidade', Number(last.x.velocidade))}/>
            </div>

            <div className={`text-sm ${toneEmerald.textSub}`}>💡 Ajuste o controle “Equilíbrio entre qualidade e energia” para priorizar custo/CO₂ ou qualidade.</div>
          </div>
        </div>
      )}

      {/* Histórico Premium (slate) */}
      <PremiumCard tone="slate" isDark={isDark}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-indigo-400" />
            <h3 className={`font-semibold ${toneSlate.textMain}`}>Histórico de Otimizações</h3>
          </div>
          <button
            onClick={clearHistory}
            className={`text-xs px-3.5 py-1.5 rounded-md border transition 
            ${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            Limpar histórico
          </button>
        </div>

        {history.length === 0 ? (
          <div className={`text-sm ${toneSlate.textSub}`}>Nenhuma execução registrada ainda.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {history.map((item) => (
              <PremiumCard key={item.id} tone="slate" isDark={isDark} className="!p-5">
                <div className="flex items-center justify-between">
                  <div className={`text-sm font-semibold ${toneSlate.textMain}`}>{fullMethodName(item.method)}</div>
                  <div className="text-xs text-gray-500">{new Date(item.ts).toLocaleString('pt-BR')}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><div className="text-[11px] text-gray-500 mb-0.5">Score</div><div className={`${toneSlate.textMain} font-bold`}>{item.score.toFixed(2)}</div></div>
                  <div><div className="text-[11px] text-gray-500 mb-0.5">Testes</div><div className={`${toneSlate.textMain} font-bold`}>{item.evaluations}</div></div>
                  <div><div className="text-[11px] text-gray-500 mb-0.5">Qualidade</div><div className={`${toneSlate.textMain} font-bold`}>{item.quality.toFixed(1)}</div></div>
                  <div><div className="text-[11px] text-gray-500 mb-0.5">Energia</div><div className={`${toneSlate.textMain} font-bold`}>{item.energy.toFixed(1)} <span className="text-xs text-gray-500">kWh/ton</span></div></div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  λ: {item.lambda.toFixed(2)} · Parâmetros: T={item.x.temperatura?.toFixed?.(1) ?? item.x.temperatura}ºC; 
                  t={item.x.tempo?.toFixed?.(1) ?? item.x.tempo} min; 
                  p={item.x.pressao?.toFixed?.(1) ?? item.x.pressao}; 
                  v={item.x.velocidade?.toFixed?.(1) ?? item.x.velocidade} rpm
                </div>
              </PremiumCard>
            ))}
          </div>
        )}
      </PremiumCard>
    </div>
  );
};

/* ===================== Subcomponentes ===================== */
function ParamCard(props: {
  title: string; name: string; value: number; unit: string; min: number; max: number;
  badge: { label: string; class: string }; icon: React.ReactNode; isDark: boolean; pct: number;
}) {
  const { title, value, unit, min, max, badge, icon, isDark, pct } = props;
  return (
    <div
      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm transition-all
                  ${isDark ? 'hover:shadow-[0_12px_30px_-12px_rgba(16,185,129,.28)]' : 'hover:shadow-[0_12px_30px_-14px_rgba(16,185,129,.22)]'}
                  hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-md ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>{icon}</div>
          <span className="text-xs uppercase tracking-wide text-gray-500">{title}</span>
        </div>
        <span className="text-xs text-gray-500">{min}–{max} {unit}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className={`${isDark ? 'text-gray-100' : 'text-gray-900'} text-2xl font-extrabold`}>
          {value.toFixed(1)} <span className="text-sm font-semibold text-gray-500">{unit}</span>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${badge.class}`}>
          {badge.label}
        </span>
      </div>

      <div className="mt-3">
        <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div className={`h-2 rounded-full ${isDark ? 'bg-emerald-600' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function RangeCard({
  title, name, unit, isDark, value, onChange, showGridHint = true
}: {
  title: string; name: 'temperatura'|'tempo'|'pressao'|'velocidade'; unit: string;
  isDark: boolean; value: Range; onChange: (next: Range) => void; showGridHint?: boolean;
}) {
  const label = 'text-xs text-gray-500';
  const set = (patch: Partial<Range>) => onChange({ ...value, ...patch });
  const clamp = (v: number) => Math.min(value.industrial.max, Math.max(value.industrial.min, v));
  const step = Math.max(1, Number(value.step ?? 1));
  const points = Math.floor((value.max - value.min) / step) + 1;
  const invalid = value.min >= value.max;

  return (
    <div
      className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                  rounded-xl p-4 border shadow-sm transition-all
                  ${isDark ? 'hover:shadow-[0_12px_30px_-12px_rgba(148,163,184,.25)]' : 'hover:shadow-[0_12px_30px_-14px_rgba(148,163,184,.20)]'}
                  hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between">
        <h4 className={`${isDark ? 'text-gray-100' : 'text-gray-800'} font-semibold`}>{title}</h4>
        <span className="text-xs text-gray-500">
          Limites industriais: {value.industrial.min}–{value.industrial.max} {unit}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        <div>
          <label className={label}>Mínimo</label>
          <input type="number" value={value.min} onChange={e=>set({min:clamp(Number(e.target.value))})} className="w-full mt-1 rounded border px-2 py-1 bg-transparent"/>
        </div>
        <div>
          <label className={label}>Máximo</label>
          <input type="number" value={value.max} onChange={e=>set({max:clamp(Number(e.target.value))})} className="w-full mt-1 rounded border px-2 py-1 bg-transparent"/>
        </div>
        <div>
          <label className={label}>Passo (Grid)</label>
          <input type="number" value={value.step ?? 1} min={1} onChange={e=>set({step:Math.max(1, Number(e.target.value))})} className="w-full mt-1 rounded border px-2 py-1 bg-transparent"/>
        </div>
      </div>

      <div className="mt-3 text-xs flex items-center justify-between">
        <span className="text-gray-500">Faixa típica: {value.tipica.min}–{value.tipica.max} {unit}</span>
        {showGridHint && (
          <span className={`${invalid ? 'text-rose-600' : (isDark ? 'text-gray-200' : 'text-gray-700')}`}>
            {invalid ? 'Faixa inválida (mín ≥ máx)' : <>Espaço (Grid): <b>{points}</b> pontos</>}
          </span>
        )}
      </div>
    </div>
  );
}

export default Optimization;


















