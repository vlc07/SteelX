import React, { useState } from 'react';
import { Play, BarChart3, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

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

  // Simulate quality calculation based on parameters
  const calculateQuality = (temp: number, time: number, press: number, speed: number) => {
    // Base quality calculation with some realistic relationships
    const baseQuality = 350;
    const tempEffect = (temp - 1450) * 0.1;
    const timeEffect = (time - 30) * 0.2;
    const pressEffect = (press - 101) * 2;
    const speedEffect = (speed - 300) * 0.05;
    
    // Add some non-linear effects for realism
    const tempBonus = temp > 1500 ? Math.pow((temp - 1500) / 20, 1.5) : 0;
    const timeOptimal = Math.abs(time - 60) < 20 ? 5 : 0;
    
    return baseQuality + tempEffect + timeEffect + pressEffect + speedEffect + tempBonus + timeOptimal + (Math.random() - 0.5) * 2;
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
      const variations = 10;
      
      for (let i = 0; i < variations; i++) {
        // Add small random variations to current parameters
        const tempVar = temperatura + (Math.random() - 0.5) * 20;
        const timeVar = tempo + (Math.random() - 0.5) * 10;
        const pressVar = pressao + (Math.random() - 0.5) * 1;
        const speedVar = velocidade + (Math.random() - 0.5) * 10;
        
        const quality = calculateQuality(tempVar, timeVar, pressVar, speedVar);
        
        batchResults.push({
          id: Date.now() + i,
          parameters: { 
            temperatura: tempVar, 
            tempo: timeVar, 
            pressao: pressVar, 
            velocidade: speedVar 
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
    }, 2000);
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

      // Temperature sensitivity (1430°C to 1530°C)
      for (let temp = 1430; temp <= 1530; temp += 10) {
        const quality = calculateQuality(temp, tempo, pressao, velocidade);
        results.temperatura.push({ x: temp, y: quality });
      }

      // Time sensitivity (20 to 100 minutes)
      for (let time = 20; time <= 100; time += 10) {
        const quality = calculateQuality(temperatura, time, pressao, velocidade);
        results.tempo.push({ x: time, y: quality });
      }

      // Pressure sensitivity (98 to 105 kPa)
      for (let press = 98; press <= 105; press += 0.5) {
        const quality = calculateQuality(temperatura, tempo, press, velocidade);
        results.pressao.push({ x: press, y: quality });
      }

      // Speed sensitivity (270 to 330 rpm)
      for (let speed = 270; speed <= 330; speed += 5) {
        const quality = calculateQuality(temperatura, tempo, pressao, speed);
        results.velocidade.push({ x: speed, y: quality });
      }

      setSensitivityResults(results);
      setIsRunning(false);
    }, 3000);
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
          fill: true
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
                    style={{ width: `${(impact / Math.max(...Object.values(impacts))) * 100}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Δ{impact.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className={`mt-4 p-3 rounded ${isDark ? 'bg-blue-900' : 'bg-blue-50'}`}>
          <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
            <strong>Interpretação:</strong> Quanto maior o valor Δ (delta), maior a influência do parâmetro na qualidade final. 
            O parâmetro com maior Δ deve ser controlado com mais precisão.
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
          {t('simulation')}
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
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
          <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Parâmetros Atuais
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Temperatura</div>
              <div className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {temperatura}°C
              </div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tempo</div>
              <div className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {tempo} min
              </div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pressão</div>
              <div className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {pressao} kPa
              </div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Velocidade</div>
              <div className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {velocidade} rpm
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          {activeAnalysis === 'single' && (
            <button
              onClick={runSingleSimulation}
              disabled={isRunning}
              className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                isRunning
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
              disabled={isRunning}
              className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                isRunning
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              } transition-colors`}
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              {isRunning ? 'Executando Lote...' : 'Executar Lote (10x)'}
            </button>
          )}

          {activeAnalysis === 'sensitivity' && (
            <button
              onClick={runSensitivityAnalysis}
              disabled={isRunning}
              className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                isRunning
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              } transition-colors`}
            >
              <Zap className="h-5 w-5 mr-2" />
              {isRunning ? 'Analisando...' : 'Executar Análise de Sensibilidade'}
            </button>
          )}
        </div>

        {/* Results Section */}
        {activeAnalysis === 'single' && simulationResults.length > 0 && (
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Resultado da Simulação
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
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Timestamp</div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {new Date(simulationResults[simulationResults.length - 1].timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeAnalysis === 'batch' && simulationResults.filter(r => r.type === 'batch').length > 0 && (
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Resultados do Lote
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
            </div>
            <div className={`p-3 rounded ${isDark ? 'bg-blue-900' : 'bg-blue-50'}`}>
              <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                <strong>Análise:</strong> A variação de qualidade no lote indica a robustez do processo. 
                Menor variação significa processo mais estável.
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
                    Como Interpretar a Análise de Sensibilidade:
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>
                    <li>• <strong>Curvas Inclinadas:</strong> Parâmetro tem grande impacto na qualidade</li>
                    <li>• <strong>Curvas Planas:</strong> Parâmetro tem pouco impacto na qualidade</li>
                    <li>• <strong>Curvas Não-Lineares:</strong> Existem pontos ótimos específicos</li>
                    <li>• <strong>Ranking de Impacto:</strong> Mostra quais parâmetros priorizar no controle</li>
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