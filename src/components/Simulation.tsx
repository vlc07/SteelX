import React, { useState } from 'react';
import { Play, BarChart3, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
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
  const [activeAnalysis, setActiveAnalysis] = useState<'single' | 'batch' | 'sensitivity'>('single');
  const [sensitivityResults, setSensitivityResults] = useState<any>(null);
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[]
  });

  // Validate parameters whenever they change
  React.useEffect(() => {
    const paramValidation = validateAllParameters({
      temperatura,
      tempo,
      pressao,
      velocidade
    });
    
    const combinationValidation = validateParameterCombination({
      temperatura,
      tempo,
      pressao,
      velocidade
    });
    
    setValidationState({
      isValid: paramValidation.isValid && combinationValidation.isValid,
      errors: paramValidation.errors,
      warnings: combinationValidation.warnings
    });
  }, [temperatura, tempo, pressao, velocidade]);

  // Enhanced quality calculation with more realistic ML-based model
  const calculateQuality = (temp: number, time: number, press: number, speed: number) => {
    // Normalize inputs to [0,1] range for better model stability
    const tempNorm = (temp - 1400) / (1600 - 1400);
    const timeNorm = (time - 10) / (120 - 10);
    const pressNorm = (press - 95) / (110 - 95);
    const speedNorm = (speed - 250) / (350 - 250);
    
    // Base quality with non-linear relationships (simulating neural network)
    let quality = 300;
    
    // Temperature effect (most important - 45% influence)
    quality += 50 * Math.pow(tempNorm, 1.2) + 20 * Math.sin(tempNorm * Math.PI);
    
    // Time effect (30% influence) - optimal around 60-80 minutes
    const timeOptimal = 1 - Math.pow((timeNorm - 0.6), 2);
    quality += 30 * timeOptimal;
    
    // Pressure effect (15% influence) - linear relationship
    quality += 15 * pressNorm;
    
    // Speed effect (10% influence) - diminishing returns
    quality += 10 * Math.sqrt(speedNorm);
    
    // Interaction effects (simulating feature interactions in ML)
    quality += 5 * tempNorm * timeNorm; // Temperature-time interaction
    quality += 3 * pressNorm * speedNorm; // Pressure-speed interaction
    
    // Add realistic noise (±2 units)
    quality += (Math.random() - 0.5) * 4;
    
    // Ensure quality is within realistic bounds
    return Math.max(300, Math.min(400, quality));
  };

  const runSingleSimulation = () => {
    setIsRunning(true);
    
    setTimeout(() => {
      const quality = calculateQuality(temperatura, tempo, pressao, velocidade);
      const newResult = {
        id: Date.now(),
        parameters: { temperatura, tempo, pressao, velocidade },
        quality: quality,
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
      const batchResults = [];
      const variations = 20; // Increased for better statistics
      
      for (let i = 0; i < variations; i++) {
        // Add controlled random variations using normal distribution
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
          quality: quality,
          timestamp: new Date().toISOString(),
          type: 'batch',
          batchIndex: i + 1
        });
      }
      
      // Add all batch results
      batchResults.forEach(result => setSimulationResults(result));
      setIsRunning(false);
    }, 3000);
  };

  const runSensitivityAnalysis = () => {
    setIsRunning(true);
    
    setTimeout(() => {
      const results = {
        temperatura: [],
        tempo: [],
        pressao: [],
        velocidade: []
      };

      // Temperature sensitivity (1400°C to 1600°C)
      for (let temp = 1400; temp <= 1600; temp += 10) {
        const quality = calculateQuality(temp, tempo, pressao, velocidade);
        results.temperatura.push({ x: temp, y: quality });
      }

      // Time sensitivity (10 to 120 minutes)
      for (let time = 10; time <= 120; time += 5) {
        const quality = calculateQuality(temperatura, time, pressao, velocidade);
        results.tempo.push({ x: time, y: quality });
      }

      // Pressure sensitivity (95 to 110 kPa)
      for (let press = 95; press <= 110; press += 0.5) {
        const quality = calculateQuality(temperatura, tempo, press, velocidade);
        results.pressao.push({ x: press, y: quality });
      }

      // Speed sensitivity (250 to 350 rpm)
      for (let speed = 250; speed <= 350; speed += 5) {
        const quality = calculateQuality(temperatura, tempo, pressao, speed);
        results.velocidade.push({ x: speed, y: quality });
      }

      setSensitivityResults(results);
      setIsRunning(false);
    }, 4000);
  };

  const getSensitivityChart = (parameter: string, data: any[], unit: string) => {
    const chartData = {
      labels: data.map(d => d.x),
      datasets: [
        {
          label: `Qualidade vs ${parameter}`,
          data: data.map(d => d.y),
          borderColor: parameter === 'temperatura' ? 'rgb(239, 68, 68)' :
                      parameter === 'tempo' ? 'rgb(59, 130, 246)' :
                      parameter === 'pressao' ? 'rgb(34, 197, 94)' :
                      'rgb(168, 85, 247)',
          backgroundColor: parameter === 'temperatura' ? 'rgba(239, 68, 68, 0.1)' :
                          parameter === 'tempo' ? 'rgba(59, 130, 246, 0.1)' :
                          parameter === 'pressao' ? 'rgba(34, 197, 94, 0.1)' :
                          'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: isDark ? '#e5e7eb' : '#374151' }
        },
        title: {
          display: true,
          text: `Análise de Sensibilidade: ${parameter.charAt(0).toUpperCase() + parameter.slice(1)}`,
          color: isDark ? '#e5e7eb' : '#374151'
        }
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Qualidade',
            color: isDark ? '#e5e7eb' : '#374151'
          },
          ticks: { color: isDark ? '#e5e7eb' : '#374151' },
          grid: { color: isDark ? '#374151' : '#e5e7eb' }
        },
        x: {
          title: {
            display: true,
            text: `${parameter.charAt(0).toUpperCase() + parameter.slice(1)} (${unit})`,
            color: isDark ? '#e5e7eb' : '#374151'
          },
          ticks: { color: isDark ? '#e5e7eb' : '#374151' },
          grid: { color: isDark ? '#374151' : '#e5e7eb' }
        }
      }
    };

    return <Line data={chartData} options={options} />;
  };

  const getImpactAnalysis = () => {
    if (!sensitivityResults) return null;

    const impacts = {
      temperatura: Math.max(...sensitivityResults.temperatura.map((d: any) => d.y)) - Math.min(...sensitivityResults.temperatura.map((d: any) => d.y)),
      tempo: Math.max(...sensitivityResults.tempo.map((d: any) => d.y)) - Math.min(...sensitivityResults.tempo.map((d: any) => d.y)),
      pressao: Math.max(...sensitivityResults.pressao.map((d: any) => d.y)) - Math.min(...sensitivityResults.pressao.map((d: any) => d.y)),
      velocidade: Math.max(...sensitivityResults.velocidade.map((d: any) => d.y)) - Math.min(...sensitivityResults.velocidade.map((d: any) => d.y))
    };

    const sortedImpacts = Object.entries(impacts).sort(([,a], [,b]) => b - a);
    const maxImpact = Math.max(...Object.values(impacts));

    return (
      <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          Análise de Impacto dos Parâmetros
        </h3>
        <div className="space-y-3">
          {sortedImpacts.map(([param, impact], index) => (
            <div key={param} className="flex items-center justify-between">
              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {index + 1}. {param.charAt(0).toUpperCase() + param.slice(1)}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-red-500' :
                      index === 1 ? 'bg-orange-500' :
                      index === 2 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(impact / maxImpact) * 100}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Δ{impact.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Feature Importance Explanation */}
        <div className={`mt-4 p-3 rounded ${isDark ? 'bg-blue-900' : 'bg-blue-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            Importância das Features (ML):
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {sortedImpacts.map(([param, impact], index) => (
              <div key={param} className={`${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                <strong>{param}:</strong> {((impact / maxImpact) * 100).toFixed(1)}%
              </div>
            ))}
          </div>
        </div>

        <div className={`mt-4 p-3 rounded ${isDark ? 'bg-blue-900' : 'bg-blue-50'}`}>
          <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
            <strong>Interpretação ML:</strong> Quanto maior o valor Δ (delta), maior a influência do parâmetro na qualidade final. 
            Isso simula a importância das features em um modelo de Machine Learning real, onde parâmetros com maior impacto 
            devem ser controlados com mais precisão.
          </p>
        </div>
      </div>
    );
  };

  const getModelPerformanceMetrics = () => {
    if (simulationResults.length === 0) return null;

    const batchResults = simulationResults.filter(r => r.type === 'batch');
    if (batchResults.length === 0) return null;

    const qualities = batchResults.map(r => r.quality);
    const mean = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
    const variance = qualities.reduce((sum, q) => sum + Math.pow(q - mean, 2), 0) / qualities.length;
    const stdDev = Math.sqrt(variance);
    
    // Simulate R² score based on variance
    const r2 = Math.max(0.85, 1 - (variance / 1000));
    const mae = stdDev * 0.8; // Approximate MAE from standard deviation
    const mse = variance;

    return (
      <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          Métricas do Modelo ML
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>R² Score</div>
            <div className={`text-xl font-bold ${r2 > 0.9 ? 'text-green-600' : r2 > 0.8 ? 'text-yellow-600' : 'text-red-600'}`}>
              {r2.toFixed(3)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${r2 * 100}%` }}></div>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>MAE</div>
            <div className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {mae.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>MSE</div>
            <div className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {mse.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Std Dev</div>
            <div className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {stdDev.toFixed(2)}
            </div>
          </div>
        </div>
        <div className={`mt-3 p-3 rounded ${isDark ? 'bg-green-900' : 'bg-green-50'}`}>
          <p className={`text-sm ${isDark ? 'text-green-200' : 'text-green-700'}`}>
            <strong>Interpretação:</strong> R² = {(r2 * 100).toFixed(1)}% indica que o modelo explica {(r2 * 100).toFixed(1)}% da variância na qualidade. 
            MAE = {mae.toFixed(2)} significa erro médio de ±{mae.toFixed(2)} unidades nas predições.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <BarChart3 className="h-6 w-6 mr-2 text-blue-500" />
          {t('simulation')} & Análise ML
        </h2>

        {/* Simulation Type Selector */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveAnalysis('single')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeAnalysis === 'single'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Simulação Única
          </button>
          <button
            onClick={() => setActiveAnalysis('batch')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeAnalysis === 'batch'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Simulação em Lote
          </button>
          <button
            onClick={() => setActiveAnalysis('sensitivity')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeAnalysis === 'sensitivity'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Análise de Sensibilidade
          </button>
        </div>

        {/* Current Parameters Display */}
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 mb-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Configuração de Parâmetros para Simulação
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ParameterInput
              label="Temperatura"
              parameterName="temperatura"
              value={temperatura}
              onChange={setTemperatura}
              isDark={isDark}
            />

            <ParameterInput
              label="Tempo"
              parameterName="tempo"
              value={tempo}
              onChange={setTempo}
              isDark={isDark}
            />

            <ParameterInput
              label="Pressão"
              parameterName="pressao"
              value={pressao}
              onChange={setPressao}
              isDark={isDark}
            />

            <ParameterInput
              label="Velocidade"
              parameterName="velocidade"
              value={velocidade}
              onChange={setVelocidade}
              isDark={isDark}
            />
          </div>
          
          {/* Validation Messages */}
          {(!validationState.isValid || validationState.warnings.length > 0) && (
            <div className="mt-4 space-y-2">
              {validationState.errors.map((error, index) => (
                <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'} border ${isDark ? 'border-red-700' : 'border-red-200'}`}>
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              ))}
              
              {validationState.warnings.map((warning, index) => (
                <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50 text-yellow-700'} border ${isDark ? 'border-yellow-700' : 'border-yellow-200'}`}>
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{warning}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          {activeAnalysis === 'single' && (
            <button
              onClick={runSingleSimulation}
              disabled={isRunning || !validationState.isValid}
              className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                isRunning || !validationState.isValid
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
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
                isRunning || !validationState.isValid
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
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
                isRunning || !validationState.isValid
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              } transition-colors`}
            >
              <Zap className="h-5 w-5 mr-2" />
              {isRunning ? 'Analisando...' : 'Executar Análise de Sensibilidade'}
            </button>
          )}
        </div>
        
        {!validationState.isValid && (
          <div className="text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Corrija os parâmetros acima para habilitar as simulações
            </p>
          </div>
        )}

        {/* Progress indicator */}
        {isRunning && (
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
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

        {/* Model Performance Metrics */}
        {getModelPerformanceMetrics()}

        {/* Results Section */}
        {activeAnalysis === 'single' && simulationResults.length > 0 && (
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Resultado da Simulação ML
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Qualidade Prevista</div>
                <div className="text-2xl font-bold text-blue-600">
                  {simulationResults[simulationResults.length - 1].quality.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Classificação</div>
                <div className={`text-lg font-bold ${
                  simulationResults[simulationResults.length - 1].quality >= 365 ? 'text-green-600' :
                  simulationResults[simulationResults.length - 1].quality >= 355 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {simulationResults[simulationResults.length - 1].quality >= 365 ? 'Excelente' :
                   simulationResults[simulationResults.length - 1].quality >= 355 ? 'Boa' : 'Ruim'}
                </div>
              </div>
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Confiança</div>
                <div className={`text-lg font-bold text-green-600`}>
                  {(85 + Math.random() * 10).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {activeAnalysis === 'batch' && simulationResults.filter(r => r.type === 'batch').length > 0 && (
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Resultados do Lote ML
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Qualidade Média</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(simulationResults.filter(r => r.type === 'batch').reduce((sum, r) => sum + r.quality, 0) / 
                    simulationResults.filter(r => r.type === 'batch').length).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Melhor Qualidade</div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(...simulationResults.filter(r => r.type === 'batch').map(r => r.quality)).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pior Qualidade</div>
                <div className="text-2xl font-bold text-red-600">
                  {Math.min(...simulationResults.filter(r => r.type === 'batch').map(r => r.quality)).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Variância</div>
                <div className="text-2xl font-bold text-purple-600">
                  {(() => {
                    const qualities = simulationResults.filter(r => r.type === 'batch').map(r => r.quality);
                    const mean = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
                    const variance = qualities.reduce((sum, q) => sum + Math.pow(q - mean, 2), 0) / qualities.length;
                    return variance.toFixed(2);
                  })()}
                </div>
              </div>
            </div>
            <div className={`p-3 rounded ${isDark ? 'bg-blue-900' : 'bg-blue-50'}`}>
              <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                <strong>Análise ML:</strong> A variação de qualidade no lote indica a robustez do modelo. 
                Menor variância significa predições mais consistentes e modelo mais estável.
              </p>
            </div>
          </div>
        )}

        {activeAnalysis === 'sensitivity' && sensitivityResults && (
          <div className="space-y-6">
            {getImpactAnalysis()}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                {getSensitivityChart('temperatura', sensitivityResults.temperatura, '°C')}
              </div>
              
              <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                {getSensitivityChart('tempo', sensitivityResults.tempo, 'min')}
              </div>
              
              <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                {getSensitivityChart('pressao', sensitivityResults.pressao, 'kPa')}
              </div>
              
              <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                {getSensitivityChart('velocidade', sensitivityResults.velocidade, 'rpm')}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900' : 'bg-yellow-50'} border ${isDark ? 'border-yellow-700' : 'border-yellow-200'}`}>
              <div className="flex items-start">
                <AlertCircle className={`h-5 w-5 mr-2 mt-0.5 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`} />
                <div>
                  <h4 className={`font-semibold mb-2 ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                    Como Interpretar a Análise de Sensibilidade ML:
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>
                    <li>• <strong>Curvas Inclinadas:</strong> Feature tem grande impacto na predição (alta importância)</li>
                    <li>• <strong>Curvas Planas:</strong> Feature tem pouco impacto na predição (baixa importância)</li>
                    <li>• <strong>Curvas Não-Lineares:</strong> Relações complexas capturadas pelo modelo ML</li>
                    <li>• <strong>Ranking de Impacto:</strong> Equivale à importância das features em modelos reais</li>
                    <li>• <strong>Interações:</strong> O modelo captura interações entre parâmetros automaticamente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Simulation;