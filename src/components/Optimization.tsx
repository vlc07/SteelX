// src/components/Optimization.tsx
import React from 'react';
import { Play, Gauge, Beaker, Atom, AlertCircle } from 'lucide-react';
import { getModel } from '../ml/engine';
import { GridSearch } from '../optim/grid_search';
import { GeneticOptimizer } from '../optim/genetic';
import { BayesianOptimizer } from '../optim/bayes_opt';
import type { Bounds, ObjectiveFn } from '../optim/optimizer';

type Props = {
  t: (k: string) => string;
  isDark: boolean;
  onOptimizationComplete: (res: any) => void;
};

type Method = 'grid' | 'ga' | 'bo';

export const Optimization: React.FC<Props> = ({ t, isDark, onOptimizationComplete }) => {
  const [method, setMethod] = React.useState<Method>('grid');
  const [budget, setBudget] = React.useState<number>(200);
  const [lambda, setLambda] = React.useState<number>(0.15); // penalização de energia
  const [useQualityConstraint, setUseQualityConstraint] = React.useState<boolean>(false);
  const [qualityMin, setQualityMin] = React.useState<number>(365);
  const [running, setRunning] = React.useState<boolean>(false);
  const [lastSummary, setLastSummary] = React.useState<null | {
    method: Method;
    best: { x: Record<string, number>; y: number };
    evaluations: number;
  }>(null);

  // Modelo de inferência (produção)
  const model = React.useMemo(() => getModel('inference'), []);

  // Limites coerentes com sua UI
  const bounds: Bounds[] = React.useMemo(
    () => [
      { name: 'temperatura', min: 1400, max: 1600, step: 5 },
      { name: 'tempo',        min:   10, max:  120, step: 5 },
      { name: 'pressao',      min:   95, max:  110, step: 1 },
      { name: 'velocidade',   min:  250, max:  350, step: 5 },
    ],
    []
  );

  // Função-objetivo (maximização)
  const objective: ObjectiveFn = React.useCallback((x) => {
    const { quality, energy } = model.predict({
      temp: x.temperatura,
      time: x.tempo,
      press: x.pressao,
      speed: x.velocidade,
    });

    if (useQualityConstraint && quality < qualityMin) return -1e9; // inviável

    // qualidade − λ·(energia − 500)
    return quality - lambda * (energy - 500);
  }, [model, lambda, useQualityConstraint, qualityMin]);

  const run = async () => {
    setRunning(true);
    try {
      const opt =
        method === 'grid'
          ? new GridSearch()
          : method === 'ga'
          ? new GeneticOptimizer({ popSize: 40, elite: 4, tournament: 3, cxProb: 0.9, mutProb: 0.2, mutSigma: 0.1 })
          : new BayesianOptimizer({ initRandom: 10, candPerIter: 300, lengthScale: 0.5, variance: 1.0, noise: 1e-6 });

      const res = await opt.run({ objective, bounds, budget, seed: 2025 });

      setLastSummary({
        method,
        best: res.best,
        evaluations: res.evaluations,
      });

      onOptimizationComplete({
        method,
        bestParams: res.best.x,
        bestScore: res.best.y,
        history: res.history,
        evaluations: res.evaluations,
        timestamp: new Date().toISOString(),
        lambda,
        useQualityConstraint,
        qualityMin,
      });
    } catch (e) {
      console.error(e);
      alert('Falha ao executar a otimização. Veja o console para detalhes.');
    } finally {
      setRunning(false);
    }
  };

  const labelClass = isDark ? 'text-gray-300' : 'text-gray-700';
  const textClass = isDark ? 'text-gray-200' : 'text-gray-800';
  const subTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardClass = `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-5`;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-2">
          <Atom className="h-5 w-5 text-blue-500" />
          <h2 className={`text-xl font-semibold ${textClass}`}>Otimização de Parâmetros (ML)</h2>
        </div>
        <p className={`${subTextClass} text-sm`}>
          Selecione o método (Grid Search, Algoritmo Genético, Otimização Bayesiana), ajuste o orçamento e os critérios.
        </p>
      </div>

      {/* Configurações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Método */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-3">
            <Beaker className="h-5 w-5 text-purple-500" />
            <h3 className={`font-semibold ${textClass}`}>Método</h3>
          </div>
          <div className="space-y-2">
            <label className={`flex items-center gap-2 ${labelClass}`}>
              <input type="radio" name="method" value="grid" checked={method === 'grid'} onChange={() => setMethod('grid')} />
              Grid Search
            </label>
            <label className={`flex items-center gap-2 ${labelClass}`}>
              <input type="radio" name="method" value="ga" checked={method === 'ga'} onChange={() => setMethod('ga')} />
              Algoritmo Genético
            </label>
            <label className={`flex items-center gap-2 ${labelClass}`}>
              <input type="radio" name="method" value="bo" checked={method === 'bo'} onChange={() => setMethod('bo')} />
              Otimização Bayesiana
            </label>
          </div>
        </div>

        {/* Orçamento & Lambda */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-5 w-5 text-green-500" />
            <h3 className={`font-semibold ${textClass}`}>Parâmetros Globais</h3>
          </div>

          <div className="mb-4">
            <label className={`block text-sm mb-1 ${labelClass}`}>Budget (nº de avaliações)</label>
            <input
              type="range"
              min={50}
              max={1000}
              step={10}
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              className="w-full"
            />
            <div className={`${textClass} text-sm mt-1`}>{budget}</div>
          </div>

          <div>
            <label className={`block text-sm mb-1 ${labelClass}`}>λ (penalização de energia)</label>
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.01}
              value={lambda}
              onChange={(e) => setLambda(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className={`${textClass} text-sm mt-1`}>{lambda.toFixed(2)}</div>
          </div>
        </div>

        {/* Restrição de qualidade */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <h3 className={`font-semibold ${textClass}`}>Restrição (opcional)</h3>
          </div>
          <label className={`flex items-center gap-2 mb-3 ${labelClass}`}>
            <input
              type="checkbox"
              checked={useQualityConstraint}
              onChange={(e) => setUseQualityConstraint(e.target.checked)}
            />
            Exigir qualidade mínima
          </label>
          <div className={`${useQualityConstraint ? '' : 'opacity-50 pointer-events-none'}`}>
            <label className={`block text-sm mb-1 ${labelClass}`}>Qualidade mínima</label>
            <input
              type="range"
              min={340}
              max={380}
              step={1}
              value={qualityMin}
              onChange={(e) => setQualityMin(parseInt(e.target.value))}
              className="w-full"
            />
            <div className={`${textClass} text-sm mt-1`}>{qualityMin}</div>
          </div>
        </div>
      </div>

      {/* Rodar */}
      <div className={cardClass}>
        <button
          onClick={run}
          disabled={running}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
            running ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          <Play className="h-5 w-5" />
          {running ? 'Executando…' : 'Executar Otimização'}
        </button>

        {lastSummary && (
          <div className={`mt-4 p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className={`text-sm ${labelClass}`}>
              <div><b>Método:</b> {lastSummary.method.toUpperCase()}</div>
              <div><b>Avaliações:</b> {lastSummary.evaluations}</div>
              <div className="mt-1"><b>Melhor score:</b> {lastSummary.best.y.toFixed(2)}</div>
              <div className="mt-1">
                <b>Parâmetros:</b>{' '}
                temperatura={lastSummary.best.x.temperatura?.toFixed(1)};{' '}
                tempo={lastSummary.best.x.tempo?.toFixed(1)};{' '}
                pressao={lastSummary.best.x.pressao?.toFixed(1)};{' '}
                velocidade={lastSummary.best.x.velocidade?.toFixed(1)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notas */}
      <div className={cardClass}>
        <p className={`${subTextClass} text-xs leading-relaxed`}>
          Objetivo: <i>qualidade − λ·(energia − 500)</i>. Ative a restrição para exigir qualidade mínima (ex.: 365).
          Grid Search usa o <i>step</i> dos limites; Genético e Bayesiano são estocásticos (determinísticos via semente).
        </p>
      </div>
    </div>
  );
};
