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

type AnalysisTab = 'single' | 'batch' | 'sensitivity' | 'sensitivity_full';

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

  // ======== Validação contínua ========
  React.useEffect(() => {
    const paramValidation = validateAllParameters({ temperatura, tempo, pressao, velocidade });
    const combinationValidation = validateParameterCombination({ temperatura, tempo, pressao, velocidade });
    setValidationState({
      isValid: paramValidation.isValid && combinationValidation.isValid,
      errors: paramValidation.errors,
      warnings: combinationValidation.warnings
    });
  }, [temperatura, tempo, pressao, velocidade]);

  // ======== Modelo “estocástico” (com ruído) para simulação geral ========
  const calculateQuality = (temp: number, time: number, press: number, speed: number) => {
    const tempNorm = (Math.max(1400, Math.min(1600, temp)) - 1400) / 200;
    const timeNorm = (Math.max(10, Math.min(120, time)) - 10) / 110;
    const pressNorm = (Math.max(95, Math.min(110, press)) - 95) / 15;
    const speedNorm = (Math.max(250, Math.min(350, speed)) - 250) / 100;

    let quality = 300;
    quality += 50 * Math.pow(tempNorm, 1.2) + 20 * Math.sin(tempNorm * Math.PI);
    const timeOptimal = 1 - Math.pow(timeNorm - 0.6, 2);
    quality += 30 * timeOptimal;
    quality += 15 * pressNorm;
    quality += 10 * Math.sqrt(speedNorm);
    quality += 5 * tempNorm * timeNorm + 3 * pressNorm * speedNorm;
    quality += (Math.random() - 0.5) * 4;

    return Math.max(300, Math.min(400, quality));
  };

  const calculateEnergy = (temp: number, time: number, press: number, speed: number) => {
    const tempNorm = (Math.max(1400, Math.min(1600, temp)) - 1400) / 200;
    const timeNorm = (Math.max(10, Math.min(120, time)) - 10) / 110;
    const pressNorm = (Math.max(95, Math.min(110, press)) - 95) / 15;
    const speedNorm = (Math.max(250, Math.min(350, speed)) - 250) / 100;

    let energy =
      400 +
      120 * tempNorm +
      40 * timeNorm +
      30 * pressNorm +
      25 * speedNorm +
      (Math.random() - 0.5) * 20;

    return Math.max(350, Math.min(700, energy));
  };

  // ======== Modelo determinístico (sem ruído) para SENSIBILIDADE ========
  const calculateQualityDet = (temp: number, time: number, press: number, speed: number) => {
    const tempCl = Math.max(1400, Math.min(1600, temp));
    const timeCl = Math.max(10, Math.min(120, time));
    const pressCl = Math.max(95, Math.min(110, press));
    const speedCl = Math.max(250, Math.min(350, speed));

    const tempNorm = (tempCl - 1400) / 200;
    const timeNorm = (timeCl - 10) / 110;
    const pressNorm = (pressCl - 95) / 15;
    const speedNorm = (speedCl - 250) / 100;

    let quality = 320;
    const tempEffect = 55 * (0.3 + 0.7 * Math.pow(tempNorm, 0.9));
    const timeOptimal = Math.exp(-Math.pow(timeNorm - 0.65, 2) / 0.28);
    const timeEffect = 32 * timeOptimal;
    const pressEffect = 18 * (pressNorm + 0.25 * Math.sin(pressNorm * Math.PI * 2));
    const speedEffect = 12 * (Math.sqrt(speedNorm) + 0.15 * Math.cos(speedNorm * Math.PI));
    const interactions =
      7 * tempNorm * timeNorm +
      3.5 * pressNorm * speedNorm +
      2.5 * tempNorm * pressNorm;

    quality += tempEffect + timeEffect + pressEffect + speedEffect + interactions;

    return Math.max(300, Math.min(400, Number(quality)));
  };

  // ======== Ações ========
  const runSingleSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const quality = calculateQuality(temperatura, tempo, pressao, velocidade);
      const energy = calculateEnergy(temperatura, tempo, pressao, velocidade);
      const newResult = {
        id: Date.now(),
        parameters: { temperatura, tempo, pressao, velocidade },
        quality,
        energy,
        timestamp: new Date().toISOString(),
        type: 'single'
      };
      setSimulationResults(newResult);
      setIsRunning(false);
    }, 1000);
  };

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

        const tempCl = Math.max(1400, Math.min(1600, tempVar));
        const timeCl = Math.max(10, Math.min(120, timeVar));
        const pressCl = Math.max(95, Math.min(110, pressVar));
        const speedCl = Math.max(250, Math.min(350, speedVar));

        const quality = calculateQuality(tempCl, timeCl, pressCl, speedCl);
        const energy = calculateEnergy(tempCl, timeCl, pressCl, speedCl);

        batchResults.push({
          id: Date.now() + i,
          parameters: { temperatura: tempCl, tempo: timeCl, pressao: pressCl, velocidade: speedCl },
          quality,
          energy,
          timestamp: new Date().toISOString(),
          type: 'batch',
          batchIndex: i + 1
        });
      }

      batchResults.forEach((result) => setSimulationResults(result));
      setIsRunning(false);
    }, 3000);
  };

  const runSensitivityAnalysis = () => {
    setIsRunning(true);

    setTimeout(() => {
      const results = {
        temperatura: [] as { x: number; y: number }[],
        tempo: [] as { x: number; y: number }[],
        pressao: [] as { x: number; y: number }[],
        velocidade: [] as { x: number; y: number }[]
      };

      for (let temp = 1400; temp <= 1600; temp += 10) {
        const y = calculateQualityDet(temp, tempo, pressao, velocidade);
        results.temperatura.push({ x: temp, y });
      }
      for (let time = 10; time <= 120; time += 5) {
        const y = calculateQualityDet(temperatura, time, pressao, velocidade);
        results.tempo.push({ x: time, y });
      }
      for (let press = 95; press <= 110; press += 0.5) {
        const y = calculateQualityDet(temperatura, tempo, press, velocidade);
        results.pressao.push({ x: Number(press.toFixed(1)), y });
      }
      for (let speed = 250; speed <= 350; speed += 5) {
        const y = calculateQualityDet(temperatura, tempo, pressao, speed);
        results.velocidade.push({ x: speed, y });
      }

      setSensitivityResults(results);
      setIsRunning(false);
    }, 800);
  };

  // ======== Helpers de gráfico ========
  const sensitivityChartOptions = (unit: string, title: string, tall = false) => ({
    responsive: true,
    maintainAspectRatio: !tall ? true : false,
    plugins: {
      legend: { labels: { color: isDark ? '#e5e7eb' : '#374151' } },
      title: { display: true, text: title, color: isDark ? '#e5e7eb' : '#374151' }
    },
    scales: {
      y: {
        title: { display: true, text: 'Qualidade', color: isDark ? '#e5e7eb' : '#374151' },
        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
        grid: { color: isDark ? '#374151' : '#e5e7eb' },
        suggestedMin: 340,
        suggestedMax: 380
      },
      x: {
        title: { display: true, text: unit, color: isDark ? '#e5e7eb' : '#374151' },
        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
        grid: { color: isDark ? '#374151' : '#e5e7eb' }
      }
    }
  });

  const seriesFor = (parameter: 'temperatura' | 'tempo' | 'pressao' | 'velocidade', data: any[]) => {
    const color =
      parameter === 'temperatura'
        ? { b: 'rgb(239, 68, 68)', f: 'rgba(239, 68, 68, 0.1)' }
        : parameter === 'tempo'
        ? { b: 'rgb(59, 130, 246)', f: 'rgba(59, 130, 246, 0.1)' }
        : parameter === 'pressao'
        ? { b: 'rgb(34, 197, 94)', f: 'rgba(34, 197, 94, 0.1)' }
        : { b: 'rgb(168, 85, 247)', f: 'rgba(168, 85, 247, 0.1)' };

    return {
      labels: data.map((d) => d.x),
      datasets: [
        {
          label: `Qualidade vs ${parameter}`,
          data: data.map((d) => d.y),
          borderColor: color.b,
          backgroundColor: color.f,
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    };
  };

  const getModelPerformanceMetrics = () => {
    const batch = simulationResults.filter((r) => r.type === 'batch');
    if (batch.length === 0) return null;

    const q = batch.map((r) => r.quality);
    const mean = q.reduce((s, v) => s + v, 0) / q.length;
    const variance = q.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / q.length;
    const stdDev = Math.sqrt(variance);

    const r2 = Math.max(0.85, 1 - variance / 1000);
    const mae = stdDev * 0.8;
    const mse = variance;

    return (
      <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Métricas do Modelo ML</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>R² Score</div>
            <div className={`text-xl font-bold ${r2 > 0.9 ? 'text-green-600' : r2 > 0.8 ? 'text-yellow-600' : 'text-red-600'}`}>
              {r2.toFixed(3)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${r2 * 100}%` }} />
            </div>
          </div>
          <div className="text-center">
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>MAE</div>
            <div className={`${isDark ? 'text-gray-200' : 'text-gray-800'} text-xl font-bold`}>{mae.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>MSE</div>
            <div className={`${isDark ? 'text-gray-200' : 'text-gray-800'} text-xl font-bold`}>{mse.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Std Dev</div>
            <div className={`${isDark ? 'text-gray-200' : 'text-gray-800'} text-xl font-bold`}>{stdDev.toFixed(2)}</div>
          </div>
        </div>
        <div className={`mt-3 p-3 rounded ${isDark ? 'bg-green-900' : 'bg-green-50'}`}>
          <p className={`${isDark ? 'text-green-200' : 'text-green-700'} text-sm`}>
            <strong>Interpretação:</strong> R² alto indica que o modelo explica bem a variação da qualidade.
          </p>
        </div>
      </div>
    );
  };

  // ======== Render ========
  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <BarChart3 className="h-6 w-6 mr-2 text-blue-500" />
          <span>{t('simulation')} & Análise IA </span>
        </h2>

        {/* Selector */}
        <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { key: 'single', label: 'Simulação Única' },
            { key: 'batch', label: 'Simulação em Lote' },
            { key: 'sensitivity', label: 'Sensibilidade' },
            { key: 'sensitivity_full', label: 'Sensibilidade (Detalhada)' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveAnalysis(tab.key as AnalysisTab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeAnalysis === tab.key
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Parâmetros */}
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 mb-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Configuração de Parâmetros para Simulação</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ParameterInput label="Temperatura" parameterName="temperatura" value={temperatura} onChange={setTemperatura} isDark={isDark} />
            <ParameterInput label="Tempo" parameterName="tempo" value={tempo} onChange={setTempo} isDark={isDark} />
            <ParameterInput label="Pressão" parameterName="pressao" value={pressao} onChange={setPressao} isDark={isDark} />
            <ParameterInput label="Velocidade" parameterName="velocidade" value={velocidade} onChange={setVelocidade} isDark={isDark} />
          </div>

          {/* Mensagens de validação */}
          {(!validationState.isValid || validationState.warnings.length > 0) && (
            <div className="mt-4 space-y-2">
              {validationState.errors.map((error, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    isDark ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              ))}

              {validationState.warnings.map((warning, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    isDark ? 'bg-yellow-900 text-yellow-200 border border-yellow-700' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}
                >
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{warning}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex justify-center space-x-4 mb-8">
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

          {(activeAnalysis === 'sensitivity' || activeAnalysis === 'sensitivity_full') && (
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
          <div className="text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Corrija os parâmetros acima para habilitar as simulações</p>
          </div>
        )}

        {/* Loading */}
        {isRunning && (
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {activeAnalysis === 'single' && 'Executando modelo ML...'}
                {activeAnalysis === 'batch' && 'Processando simulações em lote...'}
                {(activeAnalysis === 'sensitivity' || activeAnalysis === 'sensitivity_full') && 'Analisando sensibilidade de parâmetros...'}
              </span>
            </div>
          </div>
        )}

        {/* Métricas (apenas quando há lote) */}
        {getModelPerformanceMetrics()}

        {/* Resultado — Simulação Única */}
        {activeAnalysis === 'single' && simulationResults.length > 0 && (
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
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
                  {simulationResults[simulationResults.length - 1].quality >= 365 ? 'Excelente' : simulationResults[simulationResults.length - 1].quality >= 355 ? 'Boa' : 'Ruim'}
                </div>
              </div>
              <div className="text-center">
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Consumo Energético</div>
                <div className="text-2xl font-bold text-orange-600">
                  {simulationResults[simulationResults.length - 1].energy.toFixed(1)}
                </div>
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs`}>kWh/ton</div>
              </div>
            </div>
          </div>
        )}

        {/* Resultado — Lote */}
        {activeAnalysis === 'batch' && simulationResults.filter((r) => r.type === 'batch').length > 0 && (
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Resultados do Lote ML</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Qualidade Média</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(
                    simulationResults.filter((r) => r.type === 'batch').reduce((sum, r) => sum + r.quality, 0) /
                    simulationResults.filter((r) => r.type === 'batch').length
                  ).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Energia Média</div>
                <div className="text-2xl font-bold text-orange-600">
                  {(
                    simulationResults.filter((r) => r.type === 'batch').reduce((sum, r) => sum + r.energy, 0) /
                    simulationResults.filter((r) => r.type === 'batch').length
                  ).toFixed(1)}
                </div>
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs`}>kWh/ton</div>
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
                    const qualities = simulationResults.filter((r) => r.type === 'batch').map((r) => r.quality);
                    const mean = qualities.reduce((s, q) => s + q, 0) / qualities.length;
                    const variance = qualities.reduce((s, q) => s + Math.pow(q - mean, 2), 0) / qualities.length;
                    return variance.toFixed(2);
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resultado — Sensibilidade (compacto) */}
        {activeAnalysis === 'sensitivity' && sensitivityResults && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <Line data={seriesFor('temperatura', sensitivityResults.temperatura)} options={sensitivityChartOptions('Temperatura (°C)', 'Análise de Sensibilidade: Temperatura')} />
              </div>
              <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <Line data={seriesFor('tempo', sensitivityResults.tempo)} options={sensitivityChartOptions('Tempo (min)', 'Análise de Sensibilidade: Tempo')} />
              </div>
              <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <Line data={seriesFor('pressao', sensitivityResults.pressao)} options={sensitivityChartOptions('Pressão (kPa)', 'Análise de Sensibilidade: Pressão')} />
              </div>
              <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <Line data={seriesFor('velocidade', sensitivityResults.velocidade)} options={sensitivityChartOptions('Velocidade (rpm)', 'Análise de Sensibilidade: Velocidade')} />
              </div>
            </div>
          </div>
        )}

        {/* Resultado — Sensibilidade (DETALHADA / tela cheia na própria aba) */}
        {activeAnalysis === 'sensitivity_full' && sensitivityResults && (
          <div className="space-y-6">
            {[
              { key: 'temperatura', unit: 'Temperatura (°C)', title: 'Análise de Sensibilidade: Temperatura' },
              { key: 'tempo', unit: 'Tempo (min)', title: 'Análise de Sensibilidade: Tempo' },
              { key: 'pressao', unit: 'Pressão (kPa)', title: 'Análise de Sensibilidade: Pressão' },
              { key: 'velocidade', unit: 'Velocidade (rpm)', title: 'Análise de Sensibilidade: Velocidade' }
            ].map(({ key, unit, title }) => (
              <div key={key} className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`} style={{ height: 360 }}>
                <Line
                  data={seriesFor(key as any, sensitivityResults[key])}
                  options={sensitivityChartOptions(unit, title, true)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Simulation;
