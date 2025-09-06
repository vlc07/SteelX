// src/components/Optimization.tsx
import React from 'react';
import {
  Play, Beaker, Dna, Brain, Gauge, AlertCircle, Trophy,
  Thermometer, Timer, Wind, BatteryCharging
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

export const Optimization: React.FC<Props> = ({ t, isDark, onOptimizationComplete }) => {
  const [budget, setBudget] = React.useState<number>(200);
  const [lambda, setLambda] = React.useState<number>(0.15);
  const [useQualityConstraint, setUseQualityConstraint] = React.useState<boolean>(false);
  const [qualityMin, setQualityMin] = React.useState<number>(365);

  const [runningGrid, setRunningGrid] = React.useState(false);
  const [runningGA, setRunningGA] = React.useState(false);
  const [runningBO, setRunningBO] = React.useState(false);

  const [last, setLast] = React.useState<LastSummary | null>(null);

  const label = isDark ? 'text-gray-300' : 'text-gray-700';
  const text = isDark ? 'text-gray-200' : 'text-gray-800';
  const sub = isDark ? 'text-gray-400' : 'text-gray-600';
  const card = `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-5`;

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
    if (q < 355) {
      return { label: 'Ruim', class: isDark ? 'bg-rose-900/50 text-rose-200 border border-rose-700' : 'bg-rose-100 text-rose-700 border border-rose-200' };
    }
    if (q < 365) {
      return { label: 'Boa', class: isDark ? 'bg-amber-900/50 text-amber-200 border border-amber-700' : 'bg-amber-100 text-amber-700 border border-amber-200' };
    }
    return { label: 'Excelente', class: isDark ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700' : 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
  }

  function energyBadge(e: number) {
    if (e < 450) {
      return { label: 'Muito eficiente', class: isDark ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700' : 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
    }
    if (e < 550) {
      return { label: 'Eficiente', class: isDark ? 'bg-amber-900/50 text-amber-200 border border-amber-700' : 'bg-amber-100 text-amber-700 border border-amber-200' };
    }
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

  async function executar(method: OptimizeMethod) {
    const setRun = method === 'grid' ? setRunningGrid : method === 'ga' ? setRunningGA : setRunningBO;
    setRun(true);
    try {
      const res = await runOptimization({ method, budget, lambda, useQualityConstraint, qualityMin, seed: 2025 });
      const qe = model.predict({
        temp: Number(res.best.x.temperatura),
        time: Number(res.best.x.tempo),
        press: Number(res.best.x.pressao),
        speed: Number(res.best.x.velocidade),
      });
      setLast({ method, score: res.best.y, x: res.best.x, evaluations: res.evaluations, quality: qe.quality, energy: qe.energy });
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
      {/* Cabeçalho */}
      <div className={card}>
        <div className="flex items-center gap-2 mb-1">
          <Beaker className="h-5 w-5 text-blue-500" />
          <h2 className={`text-xl font-semibold ${text}`}>Otimização de Parâmetros (ML)</h2>
        </div>
        <p className={`${sub} text-sm`}>Escolha um método para buscar os melhores parâmetros. As configurações ao lado valem para todos os métodos.</p>
      </div>

      {/* Cards dos métodos */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:col-span-3">
          <div className={card}>
            <div className="flex items-center gap-2 mb-2"><Beaker className="h-5 w-5 text-purple-500" /><h3 className={`font-semibold ${text}`}>Grid Search</h3></div>
            <p className={`${sub} text-sm mb-4`}>Testa várias combinações de parâmetros como se fosse uma tabela. Simples, mas pode levar mais tempo quando há muitas opções.</p>
            <button onClick={() => executar('grid')} disabled={runningGrid} className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${runningGrid ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
              <Play className="h-5 w-5" /> {runningGrid ? 'Executando…' : 'Executar Grid Search'}
            </button>
          </div>
          <div className={card}>
            <div className="flex items-center gap-2 mb-2"><Dna className="h-5 w-5 text-green-500" /><h3 className={`font-semibold ${text}`}>Algoritmo Genético</h3></div>
            <p className={`${sub} text-sm mb-4`}>Funciona como a evolução da natureza: mistura e seleciona os melhores parâmetros a cada rodada, refinando até achar combinações mais fortes.</p>
            <button onClick={() => executar('ga')} disabled={runningGA} className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${runningGA ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
              <Play className="h-5 w-5" /> {runningGA ? 'Executando…' : 'Executar Algoritmo Genético'}
            </button>
          </div>
          <div className={card}>
            <div className="flex items-center gap-2 mb-2"><Brain className="h-5 w-5 text-rose-500" /><h3 className={`font-semibold ${text}`}>Otimização Bayesiana</h3></div>
            <p className={`${sub} text-sm mb-4`}>Usa inteligência estatística: aprende com cada teste e sugere os próximos parâmetros de forma esperta, gastando menos tentativas.</p>
            <button onClick={() => executar('bo')} disabled={runningBO} className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${runningBO ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
              <Play className="h-5 w-5" /> {runningBO ? 'Executando…' : 'Executar Otimização Bayesiana'}
            </button>
          </div>
        </div>

        {/* Configurações */}
        <div className={card}>
          <div className="flex items-center gap-2 mb-3"><Gauge className="h-5 w-5 text-emerald-500" /><h3 className={`font-semibold ${text}`}>Configurações</h3></div>
          <div className="mb-4">
            <label className={`block text-sm mb-1 ${label}`}>Budget (nº de testes)</label>
            <input type="range" min={50} max={1000} step={10} value={budget} onChange={(e) => setBudget(parseInt(e.target.value))} className="w-full" />
            <div className={`${text} text-sm mt-1`}>{budget}</div>
          </div>
          <div className="mb-4">
            <label className={`block text-sm mb-1 ${label}`}>Equilíbrio entre qualidade e energia
              <span className="block text-xs text-gray-500">Valores menores = foco em qualidade · Valores maiores = foco em economia de energia</span>
            </label>
            <input type="range" min={0} max={0.5} step={0.01} value={lambda} onChange={(e) => setLambda(parseFloat(e.target.value))} className="w-full" />
            <div className={`${text} text-sm mt-1`}>{lambda.toFixed(2)}</div>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <label className={`flex items-center gap-2 ${label}`}>
              <input type="checkbox" checked={useQualityConstraint} onChange={(e) => setUseQualityConstraint(e.target.checked)} /> Exigir qualidade mínima
            </label>
          </div>
          <div className={`${useQualityConstraint ? '' : 'opacity-50 pointer-events-none'}`}>
            <label className={`block text-sm mb-1 ${label}`}>Qualidade mínima</label>
            <input type="range" min={340} max={380} step={1} value={qualityMin} onChange={(e) => setQualityMin(parseInt(e.target.value))} className="w-full" />
            <div className={`${text} text-sm mt-1`}>{qualityMin}</div>
          </div>
        </div>
      </div>

      {/* Resultado */}
      {last && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-green-700 bg-gradient-to-br from-gray-800 to-gray-900' : 'border-green-200 bg-gradient-to-br from-green-50 to-white'}`}>
          <div className={`flex items-center justify-between px-6 py-5 ${isDark ? 'bg-gray-900/40' : 'bg-green-100/80'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isDark ? 'bg-green-700/40' : 'bg-green-500'} text-white`}><Trophy className="h-5 w-5" /></div>
              <div>
                <h3 className={`text-lg font-extrabold ${isDark ? 'text-green-300' : 'text-green-700'}`}>Melhor Resultado Encontrado</h3>
                <p className={`${sub} text-xs`}>Método: {fullMethodName(last.method)} · {last.evaluations} testes</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs ${sub}`}>Score</div>
              <div className={`text-4xl font-black ${isDark ? 'text-green-300' : 'text-green-700'}`}>{last.score.toFixed(2)}</div>
              <div className={`text-[11px] mt-1 ${sub}`}>{`${last.quality.toFixed(1)} − ${lambda.toFixed(2)} × (${last.energy.toFixed(1)} − 500)`}</div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Qualidade */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wide text-gray-500">Qualidade prevista</span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${qualityBadge(last.quality).class}`}>
                  {qualityBadge(last.quality).label}
                </span>
              </div>
              <div className={`mt-1 text-2xl font-extrabold ${text}`}>{last.quality.toFixed(1)}</div>
            </div>
            {/* Energia */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wide text-gray-500">Consumo energético</span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${energyBadge(last.energy).class}`}>
                  <BatteryCharging className="inline h-3 w-3 mr-1" /> {energyBadge(last.energy).label}
                </span>
              </div>
              <div className={`mt-1 text-2xl font-extrabold ${text}`}>{last.energy.toFixed(1)} <span className="text-sm text-gray-500">kWh/ton</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Mini card para parâmetros */
function ParamCard(props: {
  title: string; name: string; value: number; unit: string; min: number; max: number;
  badge: { label: string; class: string }; icon: React.ReactNode; isDark: boolean; pct: number;
}) {
  const { title, value, unit, min, max, badge, icon, isDark, pct } = props;
  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><div className={`p-2 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>{icon}</div><span className="text-xs uppercase text-gray-500">{title}</span></div>
        <span className="text-xs text-gray-500">{min}–{max} {unit}</span>
      </div>
     
