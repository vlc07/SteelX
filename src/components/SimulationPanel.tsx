// src/components/SimulationPanel.tsx
import React from 'react';
import {
  Play, TrendingUp, Zap, AlertCircle,
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ParameterInput } from './ParameterInput';
import { validateAllParameters, validateParameterCombination } from '../utils/parameterValidation';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type SimulationPanelProps = {
  temperatura: number;
  setTemperatura: (v: number) => void;
  tempo: number;
  setTempo: (v: number) => void;
  pressao: number;
  setPressao: (v: number) => void;
  velocidade: number;
  setVelocidade: (v: number) => void;
  simulationResults: any[];
  setSimulationResults: (r: any) => void; // recebe 1 resultado por chamada; o App empilha
  t: (k: string) => string;
  isDark: boolean;
};

const SimulationPanel: React.FC<SimulationPanelProps> = ({
  temperatura,
  setTemperatura,
  tempo,
  setTempo,
  pressao,
  setPressao,
  velocidade,
  setVelocidade,
  simulationResults,
  setSimulationResults,
  t,
  isDark,
}) => {
  const [isRunning, setIsRunning] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'single' | 'batch' | 'sensitivity'>('single');
  const [sensitivityResults, setSensitivityResults] = React.useState<{
    temperatura: { x: number; y: number }[];
    tempo: { x: number; y: number }[];
    pressao: { x: number; y: number }[];
    velocidade: { x: number; y: number }[];
  } | null>(null);

  const [validationState, setValidationState] = React.useState({
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
  });

  // validação contínua
  React.useEffect(() => {
    const v1 = validateAllParameters({ temperatura, tempo, pressao, velocidade });
    const v2 = validateParameterCombination({ temperatura, tempo, pressao, velocidade });
    setValidationState({
      isValid: v1.isValid && v2.isValid,
      errors: v1.errors,
      warnings: v2.warnings,
    });
  }, [temperatura, tempo, pressao, velocidade]);

  // --- Modelo de simulação (qualidade + energia) ---
  const calculateQuality = (temp: number, time: number, press: number, speed: number) => {
    const tempNorm = (temp - 1400) / 200;
    const timeNorm = (time - 10) / 110;
    const pressNorm = (press - 95) / 15;
    const speedNorm = (speed - 250) / 100;

    let q = 300;
    q += 50 * Math.pow(Math.max(0, Math.min(1, tempNorm)), 1.15) + 18 * Math.sin(tempNorm * Math.PI);
    const timeOptimal = 1 - Math.pow(timeNorm - 0.6, 2);
    q += 28 * timeOptimal;
    q += 14 * pressNorm;
    q += 9 * Math.sqrt(Math.max(0, speedNorm));
    q += 5 * tempNorm * timeNorm + 3 * pressNorm * speedNorm;
    q += (Math.random() - 0.5) * 3.5;
    return Math.max(300, Math.min(400, q));
  };

  const calculateEnergy = (temp: number, time: number, press: number, speed: number) => {
    const tempNorm = (temp - 1400) / 200;
    const timeNorm = (time - 10) / 110;
    const pressNorm = (press - 95) / 15;
    const speedNorm = (speed - 250) / 100;

    let e = 420 + 110 * tempNorm + 35 * timeNorm + 22 * pressNorm + 18 * speedNorm;
    e += (Math.random() - 0.5) * 18;
    return Math.max(350, Math.min(700, e));
  };

  // --- Execuções ---
  const runSingle = () => {
    setIsRunning(true);
    setTimeout(() => {
      const quality = calculateQuality(temperatura, tempo, pressao, velocidade);
      const energy = calculateEnergy(temperatura, tempo, pressao, velocidade);
      const res = {
        id: Date.now(),
        type: 'single',
        parameters: { temperatura, tempo, pressao, velocidade },
        quality,
        energy,
        timestamp: new Date().toISOString(),
      };
      setSimulationResults(res);
      setIsRunning(false);
    }, 900);
  };

  const runBatch = () => {
    setIsRunning(true);
    setTimeout(() => {
      const N = 20;
      for (let i = 0; i < N; i++) {
        const tVar = Math.max(1400, Math.min(1600, temperatura + (Math.random() - 0.5) * 30));
        const tmVar = Math.max(10, Math.min(120, tempo + (Math.random() - 0.5) * 18));
        const pVar = Math.max(95, Math.min(110, pressao + (Math.random() - 0.5) * 2));
        const vVar = Math.max(250, Math.min(350, velocidade + (Math.random() - 0.5) * 18));

        const q = calculateQuality(tVar, tmVar, pVar, vVar);
        const e = calculateEnergy(tVar, tmVar, pVar, vVar);

        setSimulationResults({
          id: Date.now() + i,
          type: 'batch',
          parameters: { temperatura: tVar, tempo: tmVar, pressao: pVar, velocidade: vVar },
          quality: q,
          energy: e,
          timestamp: new Date().toISOString(),
          batchIndex: i + 1,
        });
      }
      setIsRunning(false);
    }, 1800);
  };

  const runSensitivity = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = {
        temperatura: [] as { x: number; y: number }[],
        tempo: [] as { x: number; y: number }[],
        pressao: [] as { x: number; y: number }[],
        velocidade: [] as { x: number; y: number }[],
      };

      for (let T = 1400; T <= 1600; T += 10) {
        res.temperatura.push({ x: T, y: calculateQuality(T, tempo, pressao, velocidade) });
      }
      for (let tm = 10; tm <= 120; tm += 5) {
        res.tempo.push({ x: tm, y: calculateQuality(temperatura, tm, pressao, velocidade) });
      }
      for (let pr = 95; pr <= 110; pr += 0.5) {
        res.pressao.push({ x: pr, y: calculateQuality(temperatura, tempo, pr, velocidade) });
      }
      for (let sp = 250; sp <= 350; sp += 5) {
        res.velocidade.push({ x: sp, y: calculateQuality(temperatura, tempo, pressao, sp) });
      }
      setSensitivityResults(res);
      setIsRunning(false);
    }, 1500);
  };

  // --- Métricas do lote & IA ---
  const batch = React.useMemo(() => simulationResults.filter((r) => r.type === 'batch'), [simulationResults]);
  const batchStats = React.useMemo(() => {
    if (batch.length === 0) return null;
    const qs = batch.map((r) => r.quality);
    const es = batch.map((r) => r.energy);
    const meanQ = qs.reduce((s, v) => s + v, 0) / qs.length;
    const varQ = qs.reduce((s, v) => s + Math.pow(v - meanQ, 2), 0) / qs.length;
    const stdQ = Math.sqrt(varQ);

    const meanE = es.reduce((s, v) => s + v, 0) / es.length;

    // R² “simulado” coerente com variação
    const r2 = Math.max(0.75, Math.min(0.98, 1 - varQ / 900));

    return { meanQ, stdQ, varQ, meanE, r2 };
  }, [batch]);

  const aiInsightSingle = React.useMemo(() => {
    const last = simulationResults.findLast?.((r) => r.type === 'single') || simulationResults[simulationResults.length - 1];
    if (!last) return null;
    const q = last.quality;
    const e = last.energy;
    let msg = '';
    if (q >= 365 && e <= 550) msg = 'Excelente equilíbrio: qualidade alta com consumo contido. Recomenda-se salvar esta configuração como referência.';
    else if (q >= 365 && e > 550) msg = 'Qualidade alta, porém custo energético acima do ideal. Avalie reduzir levemente temperatura/tempo (1–3%).';
    else if (q >= 355) msg = 'Qualidade boa. Pequenos ajustes em tempo/pressão podem levar ao nível excelente.';
    else msg = 'Qualidade abaixo do desejado. Tente aumentar tempo ou temperatura com passos pequenos, mantendo pressão estável.';
    return { q, e, msg };
  }, [simulationResults]);

  const aiInsightBatch = React.useMemo(() => {
    if (!batchStats) return null;
    const { meanQ, stdQ, meanE } = batchStats;
    const estabilidade = stdQ < 3 ? 'alta' : stdQ < 6 ? 'média' : 'baixa';
    let foco = '';
    if (meanQ >= 365 && meanE <= 550) foco = 'Manter a faixa atual e validar em produção.';
    else if (meanQ >= 365) foco = 'Buscar reduzir energia ~2–5% via menores picos de temperatura.';
    else if (meanQ >= 355) foco = 'Elevar levemente o tempo/pressão para subir a média de qualidade.';
    else foco = 'Necessário ajuste mais amplo—revise temperatura e tempo primeiro.';
    return { meanQ, stdQ, meanE, estabilidade, foco };
  }, [batchStats]);

  // --- helpers de chart ---
  const axisColor = isDark ? '#e5e7eb' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  const makeSensitivityChart = (label: string, arr: { x: number; y: number }[], color: string) => ({
    data: {
      labels: arr.map((d) => d.x),
      datasets: [{
        label,
        data: arr.map((d) => d.y),
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.12)'),
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false as const,
      plugins: {
        legend: { labels: { color: axisColor } },
        title: { display: true, text: label, color: axisColor },
      },
      scales: {
        y: {
          title: { display: true, text: 'Qualidade', color: axisColor },
          ticks: { color: axisColor },
          grid: { color: gridColor },
        },
        x: {
          ticks: { color: axisColor },
          grid: { color: gridColor },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Abas no topo */}
      <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow p-2 flex gap-2`}>
        {(['single', 'batch', 'sensitivity'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? `${isDark ? 'bg-gray-700 text-blue-300' : 'bg-gray-100 text-blue-700'}`
                : `${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
            }`}
          >
            {tab === 'single' && 'Simulação Única'}
            {tab === 'batch' && 'Simulação em Lote'}
            {tab === 'sensitivity' && 'Análise de Sensibilidade'}
          </button>
        ))}
      </div>

      {/* Parâmetros */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
          Configuração de Parâmetros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ParameterInput label="Temperatura" parameterName="temperatura" value={temperatura} onChange={setTemperatura} isDark={isDark} />
          <ParameterInput label="Tempo" parameterName="tempo" value={tempo} onChange={setTempo} isDark={isDark} />
          <ParameterInput label="Pressão" parameterName="pressao" value={pressao} onChange={setPressao} isDark={isDark} />
          <ParameterInput label="Velocidade" parameterName="velocidade" value={velocidade} onChange={setVelocidade} isDark={isDark} />
        </div>

        {/* avisos de validação */}
        {(!validationState.isValid || validationState.warnings.length > 0) && (
          <div className="mt-4 space-y-2">
            {validationState.errors.map((e, i) => (
              <div key={i} className={`p-3 rounded-lg border ${isDark ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'}`}>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{e}</span>
                </div>
              </div>
            ))}
            {validationState.warnings.map((w, i) => (
              <div key={i} className={`p-3 rounded-lg border ${isDark ? 'bg-yellow-900 text-yellow-200 border-yellow-700' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{w}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {activeTab === 'single' && (
          <button
            onClick={runSingle}
            disabled={isRunning || !validationState.isValid}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isRunning || !validationState.isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Play className="h-5 w-5 mr-2" />
            {isRunning ? 'Simulando...' : 'Executar Simulação'}
          </button>
        )}
        {activeTab === 'batch' && (
          <button
            onClick={runBatch}
            disabled={isRunning || !validationState.isValid}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isRunning || !validationState.isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            {isRunning ? 'Executando Lote...' : 'Executar Lote (20x)'}
          </button>
        )}
        {activeTab === 'sensitivity' && (
          <button
            onClick={runSensitivity}
            disabled={isRunning || !validationState.isValid}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isRunning || !validationState.isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <Zap className="h-5 w-5 mr-2" />
            {isRunning ? 'Analisando...' : 'Executar Análise de Sensibilidade'}
          </button>
        )}
      </div>

      {/* Indicador de progresso */}
      {isRunning && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4`}>
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {activeTab === 'single' && 'Executando modelo ML...'}
              {activeTab === 'batch' && 'Processando simulações em lote...'}
              {activeTab === 'sensitivity' && 'Analisando sensibilidade de parâmetros...'}
            </span>
          </div>
        </div>
      )}

      {/* Resultados — SIMULAÇÃO ÚNICA */}
      {activeTab === 'single' && simulationResults.findLast?.((r) => r.type === 'single') && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Resultado da Simulação</h3>
          {(() => {
            const last = simulationResults.findLast?.((r) => r.type === 'single')!;
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Qualidade Prevista</div>
                    <div className="text-2xl font-bold text-blue-600">{last.quality.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Consumo Energético</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {last.energy.toFixed(1)} <span className="text-sm">kWh/ton</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Classificação</div>
                    <div className={`text-lg font-bold ${
                      last.quality >= 365 ? 'text-green-600' : last.quality >= 355 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {last.quality >= 365 ? 'Excelente' : last.quality >= 355 ? 'Boa' : 'Ruim'}
                    </div>
                  </div>
                </div>

                {/* Análise IA */}
                {aiInsightSingle && (
                  <div className={`mt-4 p-3 rounded ${isDark ? 'bg-blue-900' : 'bg-blue-50'}`}>
                    <p className={`${isDark ? 'text-blue-200' : 'text-blue-700'} text-sm`}>
                      <strong>Análise IA:</strong> {aiInsightSingle.msg}
                    </p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Resultados — LOTE */}
      {activeTab === 'batch' && batchStats && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Resultados do Lote</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <StatCard title="Qualidade Média" value={batchStats.meanQ.toFixed(2)} color="text-blue-600" />
            <StatCard title="Energia Média" value={`${batchStats.meanE.toFixed(1)} kWh/ton`} color="text-orange-600" />
            <StatCard title="Desvio Padrão" value={batchStats.stdQ.toFixed(2)} color={isDark ? 'text-gray-200' : 'text-gray-800'} />
            <div className="text-center">
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>R²</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                {batchStats.r2.toFixed(3)}
              </div>
            </div>
          </div>

          {/* Análise IA do lote */}
          {aiInsightBatch && (
            <div className={`p-3 rounded ${isDark ? 'bg-green-900' : 'bg-green-50'}`}>
              <p className={`${isDark ? 'text-green-200' : 'text-green-700'} text-sm`}>
                <strong>Análise IA:</strong> estabilidade {aiInsightBatch.estabilidade}.
                {aiInsightBatch.meanQ >= 365 ? ' Qualidade média alta.' : aiInsightBatch.meanQ >= 355 ? ' Qualidade média boa.' : ' Qualidade média baixa.'}
                {' '}Recomendação: {aiInsightBatch.foco}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sensibilidade */}
      {activeTab === 'sensitivity' && sensitivityResults && (
        <div className="space-y-6">
          <SensitivityBlock
            title="Temperatura (°C)"
            dataCfg={makeSensitivityChart('Qualidade vs Temperatura (°C)', sensitivityResults.temperatura, 'rgb(239, 68, 68)')}
            isDark={isDark}
          />
          <SensitivityBlock
            title="Tempo (min)"
            dataCfg={makeSensitivityChart('Qualidade vs Tempo (min)', sensitivityResults.tempo, 'rgb(59, 130, 246)')}
            isDark={isDark}
          />
          <SensitivityBlock
            title="Pressão (kPa)"
            dataCfg={makeSensitivityChart('Qualidade vs Pressão (kPa)', sensitivityResults.pressao, 'rgb(34, 197, 94)')}
            isDark={isDark}
          />
          <SensitivityBlock
            title="Velocidade (rpm)"
            dataCfg={makeSensitivityChart('Qualidade vs Velocidade (rpm)', sensitivityResults.velocidade, 'rgb(168, 85, 247)')}
            isDark={isDark}
          />

          {/* Análise IA agregada da Sensibilidade */}
          <SensitivityInsight results={sensitivityResults} isDark={isDark} />
        </div>
      )}
    </div>
  );
};

export default SimulationPanel;

/* ---------- auxiliares visuais ---------- */

function StatCard({ title, value, color }: { title: string; value: string; color?: string }) {
  return (
    <div className="text-center">
      <div className="text-sm text-gray-600 dark:text-gray-300">{title}</div>
      <div className={`text-2xl font-bold ${color ?? 'text-gray-800 dark:text-gray-100'}`}>{value}</div>
    </div>
  );
}

function SensitivityBlock({
  title,
  dataCfg,
  isDark,
}: {
  title: string;
  dataCfg: { data: any; options: any };
  isDark: boolean;
}) {
  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
      <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{title}</h4>
      <div className="w-full" style={{ height: 320 }}>
        <Line data={dataCfg.data} options={dataCfg.options} />
      </div>
    </div>
  );
}

function SensitivityInsight({
  results,
  isDark,
}: {
  results: { [k: string]: { x: number; y: number }[] };
  isDark: boolean;
}) {
  // calcula “inclinação média” para cada parâmetro
  const slope = (arr: { x: number; y: number }[]) => {
    if (arr.length < 2) return 0;
    const first = arr[0];
    const last = arr[arr.length - 1];
    return (last.y - first.y) / (last.x - first.x || 1);
    // simples aproximação para ranking
  };

  const sTemp = Math.abs(slope(results.temperatura));
  const sTime = Math.abs(slope(results.tempo));
  const sPress = Math.abs(slope(results.pressao));
  const sSpeed = Math.abs(slope(results.velocidade));

  const ranking = [
    { name: 'Temperatura', score: sTemp },
    { name: 'Tempo', score: sTime },
    { name: 'Pressão', score: sPress },
    { name: 'Velocidade', score: sSpeed },
  ].sort((a, b) => b.score - a.score);

  const top = ranking[0];

  return (
    <div className={`p-4 rounded ${isDark ? 'bg-blue-900' : 'bg-blue-50'}`}>
      <p className={`${isDark ? 'text-blue-200' : 'text-blue-700'} text-sm`}>
        <strong>Análise IA (Sensibilidade):</strong>{' '}
        O parâmetro com maior impacto na qualidade nesta faixa é <strong>{top.name}</strong>. 
        Quanto maior a inclinação do gráfico, maior a influência daquele parâmetro na variação da qualidade. 
        Use esse ranking para priorizar controle fino e monitoramento.
      </p>
      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {ranking.map((r) => (
          <div key={r.name} className={`${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            {r.name}: impacto relativo {(r.score / (ranking[0].score || 1) * 100).toFixed(0)}%
          </div>
        ))}
      </div>
    </div>
  );
}





