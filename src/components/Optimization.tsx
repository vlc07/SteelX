// src/components/Optimization.tsx
import React from 'react';
import { Play, Beaker, Dna, Brain, Gauge, AlertCircle, Trophy } from 'lucide-react';
import type { OptimizeMethod } from '../optim/runner';
import { runOptimization } from '../optim/runner';

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
};

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

  const label = isDark ? 'text-gray-300' : 'text-gray-700';
  const text = isDark ? 'text-gray-200' : 'text-gray-800';
  const sub = isDark ? 'text-gray-400' : 'text-gray-600';
  const card = `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-5`;

  async function executar(method: OptimizeMethod) {
    const setRun =
      method === 'grid' ? setRunningGrid :
      method === 'ga'   ? setRunningGA   :
                          setRunningBO;

    setRun(true);
    try {
      const res = await runOptimization({
        method,
        budget,
        lambda,
        useQualityConstraint,
        qualityMin,
        seed: 2025,
      });

      setLast({
        method,
        score: res.best.y,
        x: res.best.x,
        evaluations: res.evaluations,
      });

      onOptimizationComplete({
        method: res.method,
        bestParams: res.best.x,
        bestScore: res.best.y,
        history: res.history,
        evaluations: res.evaluations,
        timestamp: res.timestamp,
        lambda: res.lambda,
        useQualityConstraint: res.useQualityConstraint,
        qualityMin: res.qualityMin,
      });
    } catch (e) {
      console.error(e);
      alert('Falha ao executar a otimização. Veja o console para detalhes.');
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
        <p className={`${sub} text-sm`}>
          Escolha um método para buscar os melhores parâmetros do processo. As configurações à direita valem para todos os métodos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* === Cards dos métodos (3 colunas) === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:col-span-3">
          {/* GRID SEARCH */}
          <div className={card}>
            <div className="flex items-center gap-2 mb-2">
              <Beaker className="h-5 w-5 text-purple-500" />
              <h3 className={`font-semibold ${text}`}>Grid Search</h3>
            </div>
            <p className={`${sub} text-sm mb-4`}>
              Varre uma grade de combinações de parâmetros conforme o passo (step) definido, limitada pelo budget.
            </p>
            <button
              onClick={() => executar('grid')}
              disabled={runningGrid}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                runningGrid ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              <Play className="h-5 w-5" />
              {runningGrid ? 'Executando…' : 'Executar Grid Search'}
            </button>
          </div>

          {/* GENÉTICO */}
          <div className={card}>
            <div className="flex items-center gap-2 mb-2">
              <Dna className="h-5 w-5 text-green-500" />
              <h3 className={`font-semibold ${text}`}>Algoritmo Genético</h3>
            </div>
            <p className={`${sub} text-sm mb-4`}>
              Busca estocástica por seleção, crossover e mutação. Bom para espaços contínuos e múltiplos ótimos locais.
            </p>
            <button
              onClick={() => executar('ga')}
              disabled={runningGA}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                runningGA ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              <Play className="h-5 w-5" />
              {runningGA ? 'Executando…' : 'Executar Algoritmo Genético'}
            </button>
          </div>

          {/* BAYESIANA */}
          <div className={card}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-rose-500" />
              <h3 className={`font-semibold ${text}`}>Otimização Bayesiana</h3>
            </div>
            <p className={`${sub} text-sm mb-4`}>
              Modelo probabilístico (GP + EI) para explorar e explorar melhor com poucas avaliações.
            </p>
            <button
              onClick={() => executar('bo')}
              disabled={runningBO}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                runningBO ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              <Play className="h-5 w-5" />
              {runningBO ? 'Executando…' : 'Executar Otimização Bayesiana'}
            </button>
          </div>
        </div>

        {/* === Painel de Configurações (1 coluna) === */}
        <div className={card}>
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-5 w-5 text-emerald-500" />
            <h3 className={`font-semibold ${text}`}>Configurações</h3>
          </div>

          {/* Budget */}
          <div className="mb-4">
            <label className={`block text-sm mb-1 ${label}`}>Budget (nº de avaliações)</label>
            <input
              type="range"
              min={50}
              max={1000}
              step={10}
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              className="w-full"
            />
            <div className={`${text} text-sm mt-1`}>{budget}</div>
          </div>

          {/* Lambda */}
          <div className="mb-4">
            <label className={`block text-sm mb-1 ${label}`}>
              λ — penalização de energia (maior ⇒ valoriza mais eficiência)
            </label>
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.01}
              value={lambda}
              onChange={(e) => setLambda(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className={`${text} text-sm mt-1`}>{lambda.toFixed(2)}</div>
          </div>

          {/* Restrição de Qualidade */}
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <label className={`flex items-center gap-2 ${label}`}>
              <input
                type="checkbox"
                checked={useQualityConstraint}
                onChange={(e) => setUseQualityConstraint(e.target.checked)}
              />
              Exigir qualidade mínima
            </label>
          </div>

          <div className={`${useQualityConstraint ? '' : 'opacity-50 pointer-events-none'}`}>
            <label className={`block text-sm mb-1 ${label}`}>Qualidade mínima</label>
            <input
              type="range"
              min={340}
              max={380}
              step={1}
              value={qualityMin}
              onChange={(e) => setQualityMin(parseInt(e.target.value))}
              className="w-full"
            />
            <div className={`${text} text-sm mt-1`}>{qualityMin}</div>
          </div>
        </div>
      </div>

      {/* === Card de Resultado Premium === */}
      {last && (
        <div
          className={`rounded-2xl border overflow-hidden ${isDark ? 'border-green-700 bg-gradient-to-br from-gray-800 to-gray-900' : 'border-green-200 bg-gradient-to-br from-green-50 to-white'}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-5 ${isDark ? 'bg-gray-900/40' : 'bg-green-100/80'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isDark ? 'bg-green-700/40' : 'bg-green-500'} text-white`}>
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`text-lg font-extrabold ${isDark ? 'text-green-300' : 'text-green-700'}`}>Melhor Resultado Encontrado</h3>
                <p className={`${sub} text-xs`}>Otimização concluída com sucesso</p>
              </div>
            </div>

            {/* Score em destaque */}
            <div className="text-right">
              <div className={`text-xs ${sub}`}>Score</div>
              <div className={`text-4xl font-black ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                {last.score.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Métricas rápidas */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
                <div className="text-xs uppercase tracking-wide text-gray-500">Método</div>
                <div className={`mt-1 text-lg font-semibold ${text}`}>{last.method.toUpperCase()}</div>
              </div>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
                <div className="text-xs uppercase tracking-wide text-gray-500">Avaliações</div>
                <div className={`mt-1 text-lg font-semibold ${text}`}>{last.evaluations}</div>
              </div>

              {/* Param chips (colspan) */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm md:col-span-2`}>
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Parâmetros</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(last.x).map(([k, v]) => (
                    <span
                      key={k}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isDark ? 'bg-green-900/40 text-green-200' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {k}={typeof v === 'number' ? v.toFixed(1) : String(v)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Nota para investidores/usuários */}
            <div className={`mt-6 text-sm ${sub}`}>
              💡 A IA encontrou um conjunto de parâmetros promissor com poucas avaliações, reduzindo iterações experimentais e custo energético.
            </div>
          </div>
        </div>
      )}

      {/* Notas */}
      <div className={card}>
        <p className={`${sub} text-xs leading-relaxed`}>
          Objetivo: <i>qualidade − λ·(energia − 500)</i>. Ative a restrição para exigir qualidade mínima (ex.: 365).
          Grid Search usa o <i>step</i> dos limites; Genético e Bayesiano são estocásticos (determinísticos via semente).
        </p>
      </div>
    </div>
  );
};
