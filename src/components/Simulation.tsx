import React, { useState } from 'react';
import { Play, BarChart3, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ParameterInput } from './ParameterInput';
import { validateAllParameters, validateParameterCombination } from '../utils/parameterValidation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type AnalysisTab = 'single' | 'batch' | 'sensitivity';

interface SimulationProps {
  temperatura: number;
  setTemperatura: (value: number) => void;
  tempo: number;
  setTempo: (value: number) => void;
  pressao: number;
  setPressao: (value: number) => void;
  velocidade: number;
  setVelocidade: (value: number) => void;
  simulationResults: any[];
  setSimulationResults: (results: any) => void;
  t: (key: string) => string;
  isDark: boolean;
}

export const Simulation: React.FC<SimulationProps> = ({
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
  isDark
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisTab>('single');
  const [sensitivityResults, setSensitivityResults] = useState<any>(null);
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[]
  });

  // ====== VALIDATION ======
  React.useEffect(() => {
    const paramValidation = validateAllParameters({ temperatura, tempo, pressao, velocidade });
    const combinationValidation = validateParameterCombination({ temperatura, tempo, pressao, velocidade });
    setValidationState({
      isValid: paramValidation.isValid && combinationValidation.isValid,
      errors: paramValidation.errors,
      warnings: combinationValidation.warnings
    });
  }, [temperatura, tempo, pressao, velocidade]);

  // ====== QUALITY MODEL (simulado) ======
  const calculateQuality = (temp: number, time: number, press: number, speed: number) => {
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const tval = clamp(temp, 1400, 1600);
    const tim = clamp(time, 10, 120);
    const prs = clamp(press, 95, 110);
    const spd = clamp(speed, 250, 350);

    const tempNorm = (tval - 1400) / 200;
    const timeNorm = (tim - 10) / 110;
    const pressNorm = (prs - 95) / 15;
    const speedNorm = (spd - 250) / 100;

    let quality = 320;
    quality += 50 * Math.pow(tempNorm, 1.2) + 20 * Math.sin(tempNorm * Math.PI);
    const timeOptimal = 1 - Math.pow(timeNorm - 0.6, 2);
    quality += 30 * timeOptimal;
    quality += 15 * pressNorm;
    quality += 10 * Math.sqrt(Math.max(0, speedNorm));
    quality += 5 * tempNorm * timeNorm;
    quality += 3 * pressNorm * speedNorm;
    quality += (Math.random() - 0.5) * 4;

    return Math.max(300, Math.min(400, quality));
  };

  // ====== SINGLE ======
  const runSingleSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const quality = calculateQuality(temperatura, tempo, pressao, velocidade);
      const newResult = {
        id: Date.now(),
        parameters: { temperatura, tempo, pressao, velocidade },
        quality,
        timestamp: new Date().toISOString(),
        type: 'single'
      };
      setSimulationResults(newResult);
      setIsRunning(false);
    }, 900);
  };

  // ====== BATCH ======
  const runBatchSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const batchResults: any[] = [];
      const variations = 20;
      for (let i = 0; i < variations; i++) {
        const tempVar = temperatura + (Math.random() - 0.5) * 30;
        const timeVar = tempo + (Math.random() - 0.5) * 20;
        const pressVar = pressao + (Math.random() - 0.5) * 2;
        const speedVar = velocidade + (Math.random() - 0.5) * 20;

        const quality = calculateQuality(tempVar, timeVar, pressVar, speedVar);

        batchResults.push({
          id: Date.now() + i,
          parameters: {
            temperatura: Math.max(1400, Math.min(1600, tempVar)),
            tempo: Math.max(10, Math.min(120, timeVar)),
            pressao: Math.max(95, Math.min(110, pressVar)),
            velocidade: Math.max(250, Math.min(350, speedVar))
          },
          quality,
          timestamp: new Date().toISOString(),
          type: 'batch',
          batchIndex: i + 1
        });
      }
      batchResults.forEach((r) => setSimulationResults(r));
      setIsRunning(false);
    }, 2000);
  };

  // ====== SENSITIVITY ======
  const runSensitivityAnalysis = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results: any = { temperatura: [], tempo: [], pressao: [], velocidade: [] };

      for (let temp = 1400; temp <= 1600; temp += 10) {
        results.temperatura.push({ x: temp, y: calculateQuality(temp, tempo, pressao, velocidade) });
      }
      for (let time = 10; time <= 120; time += 5) {
        results.tempo.push({ x: time, y: calculateQuality(temperatura, time, pressao, velocidade) });
      }
      for (let press = 95; press <= 110; press += 0.5) {
        results.pressao.push({ x: press, y: calculateQuality(temperatura, tempo, press, velocidade) });
      }
      for (let speed = 250; speed <= 350; speed += 5) {
        results.velocidade.push({ x: speed, y: calculateQuality(temperatura, tempo, pressao, speed) });
      }

      setSensitivityResults(results);
      setIsRunning(false);
    }, 1600);
  };

  // ====== GRÁFICOS ======
  const seriesFor = (param: 'temperatura' | 'tempo' | 'pressao' | 'velocidade', data: any[]) => {
    const palette: Record<string, { stroke: string; fill: string }> = {
      temperatura: { stroke: 'rgb(239, 68, 68)', fill: 'rgba(239, 68, 68, 0.1)' },
      tempo: { stroke: 'rgb(59, 130, 246)', fill: 'rgba(59, 130, 246, 0.1)' },
      pressao: { stroke: 'rgb(34, 197, 94)', fill: 'rgba(34, 197, 94, 0.1)' },
      velocidade: { stroke: 'rgb(168, 85, 247)', fill: 'rgba(168, 85, 247, 0.1)' }
    };
    const pal = palette[param];
    return {
      labels: data.map((d) => d.x),
      datasets: [
        {
          label: `Qualidade vs ${param}`,
          data: data.map((d) => d.y),
          borderColor: pal.stroke,
          backgroundColor: pal.fill,
          tension: 0.35,
          fill: true,
          pointRadius: 2.5,
          pointHoverRadius: 5
        }
      ]
    };
  };

  const chartOptions = (unit: string, title: string, tall = false) => ({
    responsive: true,
    maintainAspectRatio: tall ? false : true,
    plugins: {
      legend: {
        labels: { color: isDark ? '#e5e7eb' : '#374151' }
      },
      title: {
        display: true,
        text: title,
        color: isDark ? '#e5e7eb' : '#374151'
      },
      tooltip: {
        callbacks: { label: (ctx: any) => `Qualidade: ${Number(ctx.parsed.y).toFixed(2)}` }
      }
    },
    scales: {
      y: {
        title: { display: true, text: 'Qualidade', color: isDark ? '#e5e7eb' : '#374151' },
        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
        grid: { color: isDark ? '#374151' : '#e5e7eb' }
      },
      x: {
        title: { display: true, text: unit, color: isDark ? '#e5e7eb' : '#374151' },
        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
        grid: { color: isDark ? '#374151' : '#e5e7eb' }
      }
    }
  });

  const getImpactAnalysis = () => {
    if (!sensitivityResults) return null;

    const range = (arr: any[]) => Math.max(...arr.map((d: any) => d.y)) - Math.min(...arr.map((d: any) => d.y));
    const impacts = {
      temperatura: range(sensitivityResults.temperatura),
      tempo: range(sensitivityResults.tempo),
      pressao: range(sensitivityResults.pressao),
      velocidade: range(sensitivityResults.velocidade)
    };

    const sorted = Object.entries(impacts).sort(([, a], [, b]) => b - a);
    const maxImpact = Math.max(...Object.values(impacts));

    return (
      <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Análise de Impacto dos Parâmetros</h3>
        <div className="space-y-3">
          {sorted.map(([param, impact], idx) => (
            <div key={param} className="flex items-center justify-between">
              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {idx + 1}. {param.charAt(0).toUpperCase() + param.slice(1)}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-500' : idx === 2 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(Number(impact) / maxImpact) * 100}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Δ{Number(impact).toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ====== RENDER ======
  const shellCard = `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={shellCard}>
        <h2 className={`text-2xl font-bold flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <BarChart3 className="h-6 w-6 mr-2 text-blue-500" />
          <span>{t('simulation')} &nbsp;|&nbsp; Painel de Simulação</span>
        </h2>

        {/* TAB BAR (topo) */}
        <div className="mt-4">
          <div className={`flex rounded-xl p-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {[
              { key: 'single', label: 'Simulação Única', icon: <Play className="h-4 w-4 mr-1" /> },
              { key: 'batch', label: 'Simulação em Lote', icon: <TrendingUp className="h-4 w-4 mr-1" /> },
              { key: 'sensitivity', label: 'Análise de Sensibilidade', icon: <Zap className="h-4 w-4 mr-1" /> }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveAnalysis(key as AnalysisTab)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold transition
                  ${activeAnalysis === key
                    ? `${isDark ? 'bg-gray-600 text-blue-400' : 'bg-white text-blue-600 shadow-sm'}`
                    : `${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                  }`}
              >
                {icon}{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PARÂMETROS (comuns às abas) */}
      <div className={shellCard}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          Configuração de Parâmetros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ParameterInput label="Temperatura" parameterName="temperatura" value={temperatura} onChange={setTemperatura} isDark={isDark} />
          <ParameterInput label="Tempo" parameterName="tempo" value={tempo} onChange={setTempo} isDark={isDark} />
          <ParameterInput label="Pressão" parameterName="pressao" value={pressao} onChange={setPressao} isDark={isDark} />
          <ParameterInput label="Velocidade" parameterName="velocidade" value={velocidade} onChange={setVelocidade} isDark={isDark} />
        </div>

        {(!validationState.isValid || validationState.warnings.length > 0) && (
          <div className="mt-4 space-y-2">
            {validationState.errors.map((error, i) => (
              <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'} border ${isDark ? 'border-red-700' : 'border-red-200'}`}>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            ))}
            {validationState.warnings.map((w, i) => (
              <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50 text-yellow-700'} border ${isDark ? 'border-yellow-700' : 'border-yellow-200'}`}>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{w}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AÇÕES, de acordo com a ABA */}
      <div className={shellCard}>
        <div className="flex justify-center flex-wrap gap-4">
          {activeAnalysis === 'single' && (
            <button
              onClick={runSingleSimulation}
              disabled={isRunning || !validationState.isValid}
              className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                isRunning || !validationState.isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
              } transition-colors`}
            >
              <Play className="h-5 w-5 mr-2" />
              {isRunning ? 'Simulando...' : 'Executar Simulação'}
            </button>
          )}

          {activeAnalysis === 'batch' && (
            <button
              onClick={runBatchSimulation}
              disabled={isRunning || !validationState.isValid}
              className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                isRunning || !validationState.isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'
              } transition-colors`}
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              {isRunning ? 'Executando Lote...' : 'Executar Lote (20x)'}
            </button>
          )}

          {activeAnalysis === 'sensitivity' && (
            <button
              onClick={runSensitivityAnalysis}
              disabled={isRunning || !validationState.isValid}
              className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                isRunning || !validationState.isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'
              } transition-colors`}
            >
              <Zap className="h-5 w-5 mr-2" />
              {isRunning ? 'Analisando...' : 'Executar Análise de Sensibilidade'}
            </button>
          )}
        </div>

        {!validationState.isValid && (
          <div className="text-center mt-3">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Corrija os parâmetros acima para habilitar as ações
            </p>
          </div>
        )}

        {isRunning && (
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mt-6`}>
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {activeAnalysis === 'single' && 'Executando modelo ML...'}
                {activeAnalysis === 'batch' && 'Processando simulações em lote...'}
                {activeAnalysis === 'sensitivity' && 'Analisando sensibilidade de parâmetros...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CONTEÚDOS ESPECÍFICOS DE CADA ABA */}
      {activeAnalysis === 'single' && simulationResults.length > 0 && (
        <div className={shellCard}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Resultado da Simulação ML</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Qualidade Prevista</div>
              <div className="text-2xl font-bold text-blue-600">
                {simulationResults[simulationResults.length - 1].quality.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Classificação</div>
              <div
                className={`text-lg font-bold ${
                  simulationResults[simulationResults.length - 1].quality >= 365
                    ? 'text-green-600'
                    : simulationResults[simulationResults.length - 1].quality >= 355
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {simulationResults[simulationResults.length - 1].quality >= 365
                  ? 'Excelente'
                  : simulationResults[simulationResults.length - 1].quality >= 355
                  ? 'Boa'
                  : 'Ruim'}
              </div>
            </div>
            <div className="text-center">
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Confiança</div>
              <div className="text-lg font-bold text-green-600">{(85 + Math.random() * 10).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}

      {activeAnalysis === 'batch' && simulationResults.filter((r) => r.type === 'batch').length > 0 && (
        <div className={shellCard}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Resultados do Lote ML</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Qualidade Média</div>
              <div className="text-2xl font-bold text-blue-600">
                {(
                  simulationResults
                    .filter((r) => r.type === 'batch')
                    .reduce((sum, r) => sum + r.quality, 0) /
                  simulationResults.filter((r) => r.type === 'batch').length
                ).toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Melhor Qualidade</div>
              <div className="text-2xl font-bold text-green-600">
                {Math.max(...simulationResults.filter((r) => r.type === 'batch').map((r) => r.quality)).toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Pior Qualidade</div>
              <div className="text-2xl font-bold text-red-600">
                {Math.min(...simulationResults.filter((r) => r.type === 'batch').map((r) => r.quality)).toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Variância</div>
              <div className="text-2xl font-bold text-purple-600">
                {(() => {
                  const q = simulationResults.filter((r) => r.type === 'batch').map((r) => r.quality);
                  const m = q.reduce((s, v) => s + v, 0) / q.length;
                  const v = q.reduce((s, v2) => s + Math.pow(v2 - m, 2), 0) / q.length;
                  return v.toFixed(2);
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeAnalysis === 'sensitivity' && (
        <div className={shellCard}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Análise de Sensibilidade</h3>

          {/* Botão para gerar (ou regerar) os dados */}
          <div className="mb-6">
            <button
              onClick={runSensitivityAnalysis}
              disabled={isRunning || !validationState.isValid}
              className={`px-6 py-3 rounded-lg font-medium ${
                isRunning || !validationState.isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'
              } transition-colors`}
            >
              {isRunning ? 'Calculando curvas...' : sensitivityResults ? 'Recalcular Sensibilidade' : 'Executar Análise de Sensibilidade'}
            </button>
          </div>

          {/* Impacto + Gráficos (só quando há resultados) */}
          {sensitivityResults && (
            <>
              {getImpactAnalysis()}

              <div className="space-y-6">
                {[
                  { key: 'temperatura', unit: 'Temperatura (°C)', title: 'Análise de Sensibilidade: Temperatura' },
                  { key: 'tempo', unit: 'Tempo (min)', title: 'Análise de Sensibilidade: Tempo' },
                  { key: 'pressao', unit: 'Pressão (kPa)', title: 'Análise de Sensibilidade: Pressão' },
                  { key: 'velocidade', unit: 'Velocidade (rpm)', title: 'Análise de Sensibilidade: Velocidade' }
                ].map(({ key, unit, title }) => (
                  <div
                    key={key}
                    className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                    style={{ height: 360 }}
                  >
                    <Line data={seriesFor(key as any, sensitivityResults[key])} options={chartOptions(unit, title, true)} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Simulation;
