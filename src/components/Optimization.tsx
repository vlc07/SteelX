// src/components/Optimization.tsx
import React from 'react';
import { Play, Beaker, Dna, Brain, Gauge, AlertCircle } from 'lucide-react';
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
  // controles globais (iguais para todos os métodos)
  const [budget, setBudget] = React.useState<number>(200);
  const [lambda, setLambda] = React.useState<number>(0.15);
  const [useQualityConstraint, setUseQualityConstraint] = React.useState<boolean>(false);
  const [qualityMin, setQualityMin] = React.useState<number>(365);

  // estados de execução por método (deixa cada botão independente)
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

      // resumo rápido na própria tela
      setLast({
        method,
        score: res.best.y,
        x: res.best.x,
        evaluations: res.evaluations,
      });

      // envia para a tela de Resultados (mantém compatível com seu App.tsx)
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
              Modelo probabilístico (GP + EI) para explorar e explorar melhor com poucas avaliações (amostras).
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

          {/* Resumo do último run */}
          {last && (
            <div className={`mt-5 p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm ${label}`}>
                <div><b>Método:</b> {last.method.toUpperCase()}</div>
                <div><b>Avaliações:</b> {last.evaluations}</div>
                <div className="mt-1"><b>Melhor score:</b> {last.score.toFixed(2)}</div>
                <div className="mt-1">
                  <b>Parâmetros:</b>{' '}
                  temperatura={last.x.temperatura?.toFixed(1)};{' '}
                  tempo={last.x.tempo?.toFixed(1)};{' '}
                  pressao={last.x.pressao?.toFixed(1)};{' '}
                  velocidade={last.x.velocidade?.toFixed(1)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
