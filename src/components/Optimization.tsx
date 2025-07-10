import React, { useState } from 'react';
import { Settings, Play, BarChart } from 'lucide-react';
import { OptimizationRange } from '../types';

interface OptimizationProps {
  t: (key: string) => string;
  isDark: boolean;
  onOptimizationComplete?: (results: any) => void;
}

export const Optimization: React.FC<OptimizationProps> = ({ t, isDark, onOptimizationComplete }) => {
  const [ranges, setRanges] = useState<{[key: string]: OptimizationRange}>({
    temperatura: { min: 1450, max: 1520, step: 5 },
    tempo: { min: 30, max: 90, step: 5 },
    pressao: { min: 100, max: 102, step: 0.1 },
    velocidade: { min: 290, max: 310, step: 1 }
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimizedResult, setOptimizedResult] = useState<any>(null);
  const [optimizationMethod, setOptimizationMethod] = useState<'grid' | 'genetic' | 'bayesian'>('grid');

  const updateRange = (param: string, field: keyof OptimizationRange, value: number) => {
    setRanges(prev => ({
      ...prev,
      [param]: {
        ...prev[param],
        [field]: value
      }
    }));
  };

  const runOptimization = () => {
    setIsOptimizing(true);
    setProgress(0);
    
    // Simulate optimization process
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsOptimizing(false);
          
          // Generate optimized results based on ranges
          const result = {
            temperatura: ranges.temperatura.min + (ranges.temperatura.max - ranges.temperatura.min) * 0.8,
            tempo: ranges.tempo.min + (ranges.tempo.max - ranges.tempo.min) * 0.7,
            pressao: ranges.pressao.max,
            velocidade: ranges.velocidade.min + (ranges.velocidade.max - ranges.velocidade.min) * 0.9,
            quality: 370,
            improvement: 20,
            method: optimizationMethod,
            iterations: Math.floor(Math.random() * 1000) + 500,
            convergence: 0.001
          };
          
          setOptimizedResult(result);
          if (onOptimizationComplete) {
            onOptimizationComplete(result);
          }
          return 100;
        }
        return newProgress;
      });
    }, 200);
  };

  const resetOptimization = () => {
    setOptimizedResult(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <Settings className="h-6 w-6 mr-2 text-blue-500" />
          {t('optimizationTitle')}
        </h2>

        {/* Optimization Method Selection */}
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Método de Otimização
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                optimizationMethod === 'grid' 
                  ? (isDark ? 'border-blue-500 bg-blue-900' : 'border-blue-500 bg-blue-50')
                  : (isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50')
              }`}
              onClick={() => setOptimizationMethod('grid')}
            >
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                Busca em Grade
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Testa todas as combinações possíveis sistematicamente
              </p>
            </div>

            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                optimizationMethod === 'genetic' 
                  ? (isDark ? 'border-blue-500 bg-blue-900' : 'border-blue-500 bg-blue-50')
                  : (isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50')
              }`}
              onClick={() => setOptimizationMethod('genetic')}
            >
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                Algoritmo Genético
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Evolui soluções através de gerações sucessivas
              </p>
            </div>

            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                optimizationMethod === 'bayesian' 
                  ? (isDark ? 'border-blue-500 bg-blue-900' : 'border-blue-500 bg-blue-50')
                  : (isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50')
              }`}
              onClick={() => setOptimizationMethod('bayesian')}
            >
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                Otimização Bayesiana
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Usa probabilidades para guiar a busca eficientemente
              </p>
            </div>
          </div>
        </div>

        {/* Optimization Ranges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(ranges).map(([param, range]) => (
            <div key={param} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t(param)} {t('optimizationRanges')}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Mínimo
                  </label>
                  <input
                    type="number"
                    value={range.min}
                    onChange={(e) => updateRange(param, 'min', Number(e.target.value))}
                    className={`w-full border rounded p-2 ${
                      isDark 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    step={range.step}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Máximo
                  </label>
                  <input
                    type="number"
                    value={range.max}
                    onChange={(e) => updateRange(param, 'max', Number(e.target.value))}
                    className={`w-full border rounded p-2 ${
                      isDark 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    step={range.step}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Passo
                  </label>
                  <input
                    type="number"
                    value={range.step}
                    onChange={(e) => updateRange(param, 'step', Number(e.target.value))}
                    className={`w-full border rounded p-2 ${
                      isDark 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    step={param === 'pressao' ? 0.01 : 0.1}
                  />
                </div>
              </div>
              
              {/* Range Preview */}
              <div className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Combinações possíveis: {Math.ceil((range.max - range.min) / range.step) + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Optimization Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={runOptimization}
            disabled={isOptimizing}
            className={`flex items-center px-6 py-3 rounded-lg font-medium ${
              isOptimizing
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } transition-colors`}
          >
            <Play className="h-5 w-5 mr-2" />
            {isOptimizing ? t('optimizing') : t('runOptimization')}
          </button>

          {optimizedResult && (
            <button
              onClick={resetOptimization}
              className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                isDark 
                  ? 'bg-gray-600 text-white hover:bg-gray-500' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors`}
            >
              Nova Otimização
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {isOptimizing && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} mb-6`}>
            <div className="flex justify-between text-sm mb-2">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Progresso da Otimização ({optimizationMethod})
              </span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Combinações testadas:</span>
                <span className={`ml-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {Math.floor(progress * 50)}
                </span>
              </div>
              <div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Melhor qualidade:</span>
                <span className={`ml-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {(360 + Math.floor(progress / 10)).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Optimization Results */}
        {optimizedResult && (
          <div className={`p-6 rounded-lg ${isDark ? 'bg-green-900' : 'bg-green-50'} border ${isDark ? 'border-green-700' : 'border-green-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-green-300' : 'text-green-800'}`}>
              <BarChart className="h-5 w-5 mr-2" />
              Resultados da Otimização
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {t('temperature')}
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                  {optimizedResult.temperatura.toFixed(0)}°C
                </div>
              </div>
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {t('time')}
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                  {optimizedResult.tempo.toFixed(0)} min
                </div>
              </div>
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {t('pressure')}
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                  {optimizedResult.pressao.toFixed(1)} kPa
                </div>
              </div>
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {t('speed')}
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                  {optimizedResult.velocidade.toFixed(0)} rpm
                </div>
              </div>
            </div>

            <div className="text-center mb-4">
              <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'} mb-1`}>
                Qualidade Otimizada
              </div>
              <div className={`text-3xl font-bold ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                {optimizedResult.quality}
              </div>
              <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                +{optimizedResult.improvement} unidades de melhoria
              </div>
            </div>

            {/* Optimization Details */}
            <div className={`mt-4 p-3 rounded ${isDark ? 'bg-green-800' : 'bg-green-100'}`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                Detalhes da Otimização:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className={`${isDark ? 'text-green-300' : 'text-green-700'}`}>Método:</span>
                  <span className={`ml-2 font-medium ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                    {optimizationMethod === 'grid' ? 'Busca em Grade' :
                     optimizationMethod === 'genetic' ? 'Algoritmo Genético' :
                     'Otimização Bayesiana'}
                  </span>
                </div>
                <div>
                  <span className={`${isDark ? 'text-green-300' : 'text-green-700'}`}>Iterações:</span>
                  <span className={`ml-2 font-medium ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                    {optimizedResult.iterations}
                  </span>
                </div>
                <div>
                  <span className={`${isDark ? 'text-green-300' : 'text-green-700'}`}>Convergência:</span>
                  <span className={`ml-2 font-medium ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                    {optimizedResult.convergence}
                  </span>
                </div>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded ${isDark ? 'bg-green-800' : 'bg-green-100'}`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                Explicação dos Parâmetros Otimizados:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                <li>• <strong>Temperatura elevada ({optimizedResult.temperatura.toFixed(0)}°C):</strong> Melhora a reação química e aumenta a qualidade</li>
                <li>• <strong>Tempo moderado ({optimizedResult.tempo.toFixed(0)} min):</strong> Permite reação completa sem degradação</li>
                <li>• <strong>Pressão otimizada ({optimizedResult.pressao.toFixed(1)} kPa):</strong> Maximiza a densidade do produto</li>
                <li>• <strong>Velocidade alta ({optimizedResult.velocidade.toFixed(0)} rpm):</strong> Garante mistura homogênea</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};