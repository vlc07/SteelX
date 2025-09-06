import React, { useState, useEffect } from 'react';
import { Play, TrendingUp, Zap, AlertCircle, BarChart3 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
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

interface SimulationPanelProps {
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
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'sensitivity'>('single');
  const [isRunning, setIsRunning] = useState(false);
  const [sensitivityResults, setSensitivityResults] = useState<any>(null);
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
  });

  // validação
  useEffect(() => {
    const paramValidation = validateAllParameters({ temperatura, tempo, pressao, velocidade });
    const combinationValidation = validateParameterCombination({ temperatura, tempo, pressao, velocidade });

    setValidationState({
      isValid: paramValidation.isValid && combinationValidation.isValid,
      errors: paramValidation.errors,
      warnings: combinationValidation.warnings,
    });
  }, [temperatura, tempo, pressao, velocidade]);

  // cálculo de qualidade fictício (simulação ML)
  const calculateQuality = (temp: number, time: number, press: number, speed: number) => {
    let quality = 300;
    const tempNorm = (temp - 1400) / 200;
    const timeNorm = (time - 10) / 110;
    const pressNorm = (press - 95) / 15;
    const speedNorm = (speed - 250) / 100;

    quality += 50 * Math.pow(tempNorm, 1.2);
    quality += 30 * (1 - Math.pow(timeNorm - 0.6, 2));
    quality += 15 * pressNorm;
    quality += 10 * Math.sqrt(speedNorm);
    quality += 5 * tempNorm * timeNorm + 3 * pressNorm * speedNorm;
    quality += (Math.random() - 0.5) * 4;

    return Math.max(300, Math.min(400, quality));
  };

  const runSingleSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const quality = calculateQuality(temperatura, tempo, pressao, velocidade);
      const newResult = {
        id: Date.now(),
        parameters: { temperatura, tempo, pressao, velocidade },
        quality,
        timestamp: new Date().toISOString(),
        type: 'single',
      };
      setSimulationResults(newResult);
      setIsRunning(false);
    }, 1000);
  };

  const runBatchSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const batchResults = [];
      for (let i = 0; i < 20; i++) {
        const tempVar = temperatura + (Math.random() - 0.5) * 30;
        const timeVar = tempo + (Math.random() - 0.5) * 20;
        const pressVar = pressao + (Math.random() - 0.5) * 2;
        const speedVar = velocidade + (Math.random() - 0.5) * 20;

        const quality = calculateQuality(tempVar, timeVar, pressVar, speedVar);
        batchResults.push({
          id: Date.now() + i,
          parameters: { temperatura: tempVar, tempo: timeVar, pressao: pressVar, velocidade: speedVar },
          quality,
          timestamp: new Date().toISOString(),
          type: 'batch',
        });
      }
      batchResults.forEach((r) => setSimulationResults(r));
      setIsRunning(false);
    }, 3000);
  };

  const runSensitivityAnalysis = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = {
        temperatura: [] as any[],
        tempo: [] as any[],
        pressao: [] as any[],
        velocidade: [] as any[],
      };
      for (let temp = 1400; temp <= 1600; temp += 20) {
        results.temperatura.push({ x: temp, y: calculateQuality(temp, tempo, pressao, velocidade) });
      }
      for (let time = 10; time <= 120; time += 10) {
        results.tempo.push({ x: time, y: calculateQuality(temperatura, time, pressao, velocidade) });
      }
      for (let press = 95; press <= 110; press += 1) {
        results.pressao.push({ x: press, y: calculateQuality(temperatura, tempo, press, velocidade) });
      }
      for (let speed = 250; speed <= 350; speed += 10) {
        results.velocidade.push({ x: speed, y: calculateQuality(temperatura, tempo, pressao, speed) });
      }
      setSensitivityResults(results);
      setIsRunning(false);
    }, 3000);
  };

  // gráfico de sensibilidade
  const getSensitivityChart = (parameter: string, data: any[], unit: string) => {
    const chartData = {
      labels: data.map((d) => d.x),
      datasets: [
        {
          label: `Qualidade vs ${parameter}`,
          data: data.map((d) => d.y),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
    return <Line data={chartData} />;
  };

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <BarChart3 className="h-6 w-6 mr-2 text-blue-500" />
          <span>Painel de Simulação</span>
        </h2>

        {/* Abas no topo */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'single' ? 'bg-white dark:bg-gray-600 text-blue-600' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Simulação Única
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'batch' ? 'bg-white dark:bg-gray-600 text-blue-600' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Simulação em Lote
          </button>
          <button
            onClick={() => setActiveTab('sensitivity')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'sensitivity' ? 'bg-white dark:bg-gray-600 text-blue-600' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Análise de Sensibilidade
          </button>
        </div>

        {/* Conteúdo de cada aba */}
        {activeTab === 'single' && (
          <div>
            <ParameterInput label="Temperatura" parameterName="temperatura" value={temperatura} onChange={setTemperatura} isDark={isDark} />
            <ParameterInput label="Tempo" parameterName="tempo" value={tempo} onChange={setTempo} isDark={isDark} />
            <ParameterInput label="Pressão" parameterName="pressao" value={pressao} onChange={setPressao} isDark={isDark} />
            <ParameterInput label="Velocidade" parameterName="velocidade" value={velocidade} onChange={setVelocidade} isDark={isDark} />
            <button onClick={runSingleSimulation} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center">
              <Play className="h-5 w-5 mr-2" /> Executar
            </button>
          </div>
        )}

        {activeTab === 'batch' && (
          <div>
            <button onClick={runBatchSimulation} className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" /> Executar Lote
            </button>
          </div>
        )}

        {activeTab === 'sensitivity' && (
          <div>
            <button onClick={runSensitivityAnalysis} className="px-6 py-3 bg-purple-600 text-white rounded-lg flex items-center">
              <Zap className="h-5 w-5 mr-2" /> Executar Análise
            </button>
            {sensitivityResults && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {getSensitivityChart('temperatura', sensitivityResults.temperatura, '°C')}
                {getSensitivityChart('tempo', sensitivityResults.tempo, 'min')}
                {getSensitivityChart('pressao', sensitivityResults.pressao, 'kPa')}
                {getSensitivityChart('velocidade', sensitivityResults.velocidade, 'rpm')}
              </div>
            )}
          </div>
        )}

        {/* Validações */}
        {(!validationState.isValid || validationState.warnings.length > 0) && (
          <div className="mt-4 space-y-2">
            {validationState.errors.map((e, i) => (
              <div key={i} className="p-2 bg-red-100 text-red-700 rounded">{e}</div>
            ))}
            {validationState.warnings.map((w, i) => (
              <div key={i} className="p-2 bg-yellow-100 text-yellow-700 rounded">{w}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationPanel;



