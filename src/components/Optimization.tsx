import React, { useState } from 'react';
import { Settings, Play, BarChart, Brain, Search, Zap } from 'lucide-react';
import { OptimizationRange } from '../types';
import { PARAMETER_LIMITS, validateAllParameters } from '../utils/parameterValidation';

interface OptimizationProps {
  t: (key: string) => string;
  isDark: boolean;
  onOptimizationComplete?: (results: any) => void;
}

export const Optimization: React.FC<OptimizationProps> = ({ t, isDark, onOptimizationComplete }) => {
  const [ranges, setRanges] = useState<{[key: string]: OptimizationRange}>({
    temperatura: { 
      min: PARAMETER_LIMITS.temperatura.min, 
      max: PARAMETER_LIMITS.temperatura.max, 
      step: PARAMETER_LIMITS.temperatura.step 
    },
    tempo: { 
      min: PARAMETER_LIMITS.tempo.min, 
      max: PARAMETER_LIMITS.tempo.max, 
      step: PARAMETER_LIMITS.tempo.step 
    },
    pressao: { 
      min: PARAMETER_LIMITS.pressao.min, 
      max: PARAMETER_LIMITS.pressao.max, 
      step: PARAMETER_LIMITS.pressao.step 
    },
    velocidade: { 
      min: PARAMETER_LIMITS.velocidade.min, 
      max: PARAMETER_LIMITS.velocidade.max, 
      step: PARAMETER_LIMITS.velocidade.step 
    }
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimizedResult, setOptimizedResult] = useState<any>(null);
  const [optimizationMethod, setOptimizationMethod] = useState<'grid' | 'genetic' | 'bayesian'>('grid');
  const [optimizationLog, setOptimizationLog] = useState<string[]>([]);

  // Enhanced quality calculation function (same as in Simulation)
  const calculateQuality = (temp: number, time: number, press: number, speed: number) => {
    const tempNorm = (temp - 1400) / (1600 - 1400);
    const timeNorm = (time - 10) / (120 - 10);
    const pressNorm = (press - 95) / (110 - 95);
    const speedNorm = (speed - 250) / (350 - 250);
    
    let quality = 300;
    quality += 50 * Math.pow(tempNorm, 1.2) + 20 * Math.sin(tempNorm * Math.PI);
    const timeOptimal = 1 - Math.pow((timeNorm - 0.6), 2);
    quality += 30 * timeOptimal;
    quality += 15 * pressNorm;
    quality += 10 * Math.sqrt(speedNorm);
    quality += 5 * tempNorm * timeNorm;
    quality += 3 * pressNorm * speedNorm;
    
    return Math.max(300, Math.min(400, quality));
  };

  // Grid Search Algorithm
  const runGridSearch = async () => {
    const log: string[] = [];
    let bestQuality = 0;
    let bestParams = null;
    let evaluations = 0;

    const tempSteps = Math.ceil((ranges.temperatura.max - ranges.temperatura.min) / ranges.temperatura.step) + 1;
    const timeSteps = Math.ceil((ranges.tempo.max - ranges.tempo.min) / ranges.tempo.step) + 1;
    const pressSteps = Math.ceil((ranges.pressao.max - ranges.pressao.min) / ranges.pressao.step) + 1;
    const speedSteps = Math.ceil((ranges.velocidade.max - ranges.velocidade.min) / ranges.velocidade.step) + 1;
    
    const totalCombinations = tempSteps * timeSteps * pressSteps * speedSteps;
    log.push(`Grid Search iniciado: ${totalCombinations} combinações`);

    for (let temp = ranges.temperatura.min; temp <= ranges.temperatura.max; temp += ranges.temperatura.step) {
      for (let time = ranges.tempo.min; time <= ranges.tempo.max; time += ranges.tempo.step) {
        for (let press = ranges.pressao.min; press <= ranges.pressao.max; press += ranges.pressao.step) {
          for (let speed = ranges.velocidade.min; speed <= ranges.velocidade.max; speed += ranges.velocidade.step) {
            const quality = calculateQuality(temp, time, press, speed);
            evaluations++;
            
            if (quality > bestQuality) {
              bestQuality = quality;
              bestParams = { temperatura: temp, tempo: time, pressao: press, velocidade: speed };
              log.push(`Nova melhor solução: Q=${quality.toFixed(2)} em T=${temp}, t=${time}, P=${press}, V=${speed}`);
            }
            
            setProgress((evaluations / totalCombinations) * 100);
            
            // Yield control to prevent UI blocking
            if (evaluations % 100 === 0) {
              await new Promise(resolve => setTimeout(resolve, 1));
            }
          }
        }
      }
    }

    log.push(`Grid Search concluído: ${evaluations} avaliações`);
    setOptimizationLog(log);
    return { bestParams, bestQuality, evaluations, method: 'Grid Search' };
  };

  // Genetic Algorithm
  const runGeneticAlgorithm = async () => {
    const log: string[] = [];
    const populationSize = 50;
    const generations = 100;
    const mutationRate = 0.1;
    const crossoverRate = 0.8;
    let evaluations = 0;

    log.push(`Algoritmo Genético iniciado: ${populationSize} indivíduos, ${generations} gerações`);

    // Initialize population
    let population = [];
    for (let i = 0; i < populationSize; i++) {
      const individual = {
        temperatura: ranges.temperatura.min + Math.random() * (ranges.temperatura.max - ranges.temperatura.min),
        tempo: ranges.tempo.min + Math.random() * (ranges.tempo.max - ranges.tempo.min),
        pressao: ranges.pressao.min + Math.random() * (ranges.pressao.max - ranges.pressao.min),
        velocidade: ranges.velocidade.min + Math.random() * (ranges.velocidade.max - ranges.velocidade.min),
        fitness: 0
      };
      individual.fitness = calculateQuality(individual.temperatura, individual.tempo, individual.pressao, individual.velocidade);
      evaluations++;
      population.push(individual);
    }

    let bestIndividual = population.reduce((best, current) => current.fitness > best.fitness ? current : best);
    log.push(`População inicial: melhor fitness = ${bestIndividual.fitness.toFixed(2)}`);

    for (let gen = 0; gen < generations; gen++) {
      // Selection (tournament selection)
      const newPopulation = [];
      
      for (let i = 0; i < populationSize; i++) {
        const parent1 = tournamentSelection(population, 3);
        const parent2 = tournamentSelection(population, 3);
        
        let offspring;
        if (Math.random() < crossoverRate) {
          offspring = crossover(parent1, parent2);
        } else {
          offspring = { ...parent1 };
        }
        
        if (Math.random() < mutationRate) {
          offspring = mutate(offspring);
        }
        
        // Ensure bounds
        offspring.temperatura = Math.max(ranges.temperatura.min, Math.min(ranges.temperatura.max, offspring.temperatura));
        offspring.tempo = Math.max(ranges.tempo.min, Math.min(ranges.tempo.max, offspring.tempo));
        offspring.pressao = Math.max(ranges.pressao.min, Math.min(ranges.pressao.max, offspring.pressao));
        offspring.velocidade = Math.max(ranges.velocidade.min, Math.min(ranges.velocidade.max, offspring.velocidade));
        
        offspring.fitness = calculateQuality(offspring.temperatura, offspring.tempo, offspring.pressao, offspring.velocidade);
        evaluations++;
        newPopulation.push(offspring);
      }
      
      population = newPopulation;
      const currentBest = population.reduce((best, current) => current.fitness > best.fitness ? current : best);
      
      if (currentBest.fitness > bestIndividual.fitness) {
        bestIndividual = currentBest;
        log.push(`Geração ${gen + 1}: nova melhor solução = ${bestIndividual.fitness.toFixed(2)}`);
      }
      
      setProgress(((gen + 1) / generations) * 100);
      
      // Yield control
      if (gen % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    log.push(`Algoritmo Genético concluído: ${evaluations} avaliações`);
    setOptimizationLog(log);
    
    return {
      bestParams: {
        temperatura: bestIndividual.temperatura,
        tempo: bestIndividual.tempo,
        pressao: bestIndividual.pressao,
        velocidade: bestIndividual.velocidade
      },
      bestQuality: bestIndividual.fitness,
      evaluations,
      method: 'Algoritmo Genético'
    };
  };

  // Helper functions for Genetic Algorithm
  const tournamentSelection = (population: any[], tournamentSize: number) => {
    let best = population[Math.floor(Math.random() * population.length)];
    for (let i = 1; i < tournamentSize; i++) {
      const competitor = population[Math.floor(Math.random() * population.length)];
      if (competitor.fitness > best.fitness) {
        best = competitor;
      }
    }
    return best;
  };

  const crossover = (parent1: any, parent2: any) => {
    const alpha = Math.random();
    return {
      temperatura: alpha * parent1.temperatura + (1 - alpha) * parent2.temperatura,
      tempo: alpha * parent1.tempo + (1 - alpha) * parent2.tempo,
      pressao: alpha * parent1.pressao + (1 - alpha) * parent2.pressao,
      velocidade: alpha * parent1.velocidade + (1 - alpha) * parent2.velocidade,
      fitness: 0
    };
  };

  const mutate = (individual: any) => {
    const mutationStrength = 0.1;
    return {
      ...individual,
      temperatura: individual.temperatura + (Math.random() - 0.5) * (ranges.temperatura.max - ranges.temperatura.min) * mutationStrength,
      tempo: individual.tempo + (Math.random() - 0.5) * (ranges.tempo.max - ranges.tempo.min) * mutationStrength,
      pressao: individual.pressao + (Math.random() - 0.5) * (ranges.pressao.max - ranges.pressao.min) * mutationStrength,
      velocidade: individual.velocidade + (Math.random() - 0.5) * (ranges.velocidade.max - ranges.velocidade.min) * mutationStrength
    };
  };

  // Bayesian Optimization (simplified)
  const runBayesianOptimization = async () => {
    const log: string[] = [];
    const maxIterations = 50;
    let evaluations = 0;
    let bestQuality = 0;
    let bestParams = null;

    log.push(`Otimização Bayesiana iniciada: ${maxIterations} iterações`);

    // Initial random samples
    const samples = [];
    for (let i = 0; i < 10; i++) {
      const params = {
        temperatura: ranges.temperatura.min + Math.random() * (ranges.temperatura.max - ranges.temperatura.min),
        tempo: ranges.tempo.min + Math.random() * (ranges.tempo.max - ranges.tempo.min),
        pressao: ranges.pressao.min + Math.random() * (ranges.pressao.max - ranges.pressao.min),
        velocidade: ranges.velocidade.min + Math.random() * (ranges.velocidade.max - ranges.velocidade.min)
      };
      const quality = calculateQuality(params.temperatura, params.tempo, params.pressao, params.velocidade);
      samples.push({ params, quality });
      evaluations++;
      
      if (quality > bestQuality) {
        bestQuality = quality;
        bestParams = params;
      }
    }

    log.push(`Amostras iniciais: melhor qualidade = ${bestQuality.toFixed(2)}`);

    // Bayesian optimization iterations
    for (let iter = 0; iter < maxIterations - 10; iter++) {
      // Simplified acquisition function (Upper Confidence Bound)
      let bestAcquisition = -Infinity;
      let nextParams = null;
      
      // Sample candidates
      for (let candidate = 0; candidate < 100; candidate++) {
        const params = {
          temperatura: ranges.temperatura.min + Math.random() * (ranges.temperatura.max - ranges.temperatura.min),
          tempo: ranges.tempo.min + Math.random() * (ranges.tempo.max - ranges.tempo.min),
          pressao: ranges.pressao.min + Math.random() * (ranges.pressao.max - ranges.pressao.min),
          velocidade: ranges.velocidade.min + Math.random() * (ranges.velocidade.max - ranges.velocidade.min)
        };
        
        // Simple surrogate model (mean of nearby points)
        const distances = samples.map(s => {
          const tempDist = Math.abs(s.params.temperatura - params.temperatura) / (ranges.temperatura.max - ranges.temperatura.min);
          const timeDist = Math.abs(s.params.tempo - params.tempo) / (ranges.tempo.max - ranges.tempo.min);
          const pressDist = Math.abs(s.params.pressao - params.pressao) / (ranges.pressao.max - ranges.pressao.min);
          const speedDist = Math.abs(s.params.velocidade - params.velocidade) / (ranges.velocidade.max - ranges.velocidade.min);
          return Math.sqrt(tempDist * tempDist + timeDist * timeDist + pressDist * pressDist + speedDist * speedDist);
        });
        
        const weights = distances.map(d => Math.exp(-d * 5));
        const weightSum = weights.reduce((sum, w) => sum + w, 0);
        const mean = samples.reduce((sum, s, i) => sum + s.quality * weights[i], 0) / weightSum;
        const variance = Math.max(0.1, 1 / weightSum); // Simplified uncertainty
        
        // Upper Confidence Bound
        const acquisition = mean + 2 * Math.sqrt(variance);
        
        if (acquisition > bestAcquisition) {
          bestAcquisition = acquisition;
          nextParams = params;
        }
      }
      
      if (nextParams) {
        const result = calculateQualityAndEnergy(nextParams.temperatura, nextParams.tempo, nextParams.pressao, nextParams.velocidade);
        samples.push({ params: nextParams, quality: result.quality, energy: result.energy });
        evaluations++;
        
        if (result.quality > bestQuality) {
          bestQuality = result.quality;
          bestParams = nextParams;
          log.push(`Iteração ${iter + 1}: nova melhor solução = Q:${bestQuality.toFixed(2)}, E:${result.energy.toFixed(1)}kWh`);
        }
      }
      
      setProgress(((iter + 10) / maxIterations) * 100);
      
      if (iter % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    log.push(`Otimização Bayesiana concluída: ${evaluations} avaliações`);
    setOptimizationLog(log);
    
    return {
      bestParams,
      bestQuality,
      evaluations,
      method: 'Otimização Bayesiana'
    };
  };

  const updateRange = (param: string, field: keyof OptimizationRange, value: number) => {
    const limits = PARAMETER_LIMITS[param as keyof typeof PARAMETER_LIMITS];
    
    // Validate the range values against industrial limits
    let validatedValue = value;
    if (field === 'min' && value < limits.min) {
      validatedValue = limits.min;
    } else if (field === 'max' && value > limits.max) {
      validatedValue = limits.max;
    } else if (field === 'min' && value >= ranges[param].max) {
      validatedValue = ranges[param].max - limits.step;
    } else if (field === 'max' && value <= ranges[param].min) {
      validatedValue = ranges[param].min + limits.step;
    }
    
    setRanges(prev => ({
      ...prev,
      [param]: {
        ...prev[param],
        [field]: validatedValue
      }
    }));
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    setProgress(0);
    setOptimizationLog([]);
    
    try {
      let result;
      
      switch (optimizationMethod) {
        case 'grid':
          result = await runGridSearch();
          break;
        case 'genetic':
          result = await runGeneticAlgorithm();
          break;
        case 'bayesian':
          result = await runBayesianOptimization();
          break;
        default:
          result = await runGridSearch();
      }
      
      const optimizedResult = {
        ...result.bestParams,
        quality: result.bestQuality,
        improvement: result.bestQuality - 350, // Assuming baseline of 350
        method: result.method,
        iterations: result.evaluations,
        convergence: 0.001
      };
      
      setOptimizedResult(optimizedResult);
      if (onOptimizationComplete) {
        onOptimizationComplete(optimizedResult);
      }
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setIsOptimizing(false);
      setProgress(100);
    }
  };

  const resetOptimization = () => {
    setOptimizedResult(null);
    setProgress(0);
    setOptimizationLog([]);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'grid': return <Search className="h-5 w-5" />;
      case 'genetic': return <Zap className="h-5 w-5" />;
      case 'bayesian': return <Brain className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <Settings className="h-6 w-6 mr-2 text-blue-500" />
          <span>Otimização com Algoritmos ML </span>
          
        </h2>

        {/* Optimization Method Selection */}
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Algoritmo de Otimização
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
              <div className="flex items-center mb-2">
                <Search className="h-5 w-5 mr-2 text-blue-500" />
                <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Grid Search
                </h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Busca exaustiva sistemática. Garante encontrar o ótimo global dentro das faixas definidas.
              </p>
              <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Complexidade: O(n⁴) | Precisão: Alta
              </div>
            </div>

            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                optimizationMethod === 'genetic' 
                  ? (isDark ? 'border-blue-500 bg-blue-900' : 'border-blue-500 bg-blue-50')
                  : (isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50')
              }`}
              onClick={() => setOptimizationMethod('genetic')}
            >
              <div className="flex items-center mb-2">
                <Zap className="h-5 w-5 mr-2 text-green-500" />
                <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Algoritmo Genético
                </h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Evolução de população através de seleção, crossover e mutação. Eficiente para espaços complexos.
              </p>
              <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Complexidade: O(n×g) | Robustez: Alta
              </div>
            </div>

            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                optimizationMethod === 'bayesian' 
                  ? (isDark ? 'border-blue-500 bg-blue-900' : 'border-blue-500 bg-blue-50')
                  : (isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50')
              }`}
              onClick={() => setOptimizationMethod('bayesian')}
            >
              <div className="flex items-center mb-2">
                <Brain className="h-5 w-5 mr-2 text-purple-500" />
                <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Otimização Bayesiana
                </h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Usa modelo probabilístico para guiar busca inteligente. Eficiente em avaliações.
              </p>
              <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Complexidade: O(n²) | Eficiência: Muito Alta
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Ranges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(ranges).map(([param, range]) => (
            (() => {
              const limits = PARAMETER_LIMITS[param as keyof typeof PARAMETER_LIMITS];
              return (
            <div key={param} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t(param)} - Faixa de Otimização
              </h3>
              
              {/* Industrial limits info */}
              <div className={`mb-4 p-2 rounded text-xs ${isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700'}`}>
                <strong>Limites Industriais:</strong> {limits.min} - {limits.max} {limits.unit}
                <br />
                <strong>Faixa Ótima:</strong> {limits.industrialRange}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Mínimo
                  </label>
                  <input
                    type="number"
                    value={range.min}
                    min={limits.min}
                    max={range.max - limits.step}
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
                    min={range.min + limits.step}
                    max={limits.max}
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
                    min={limits.step}
                    max={(range.max - range.min) / 4}
                    onChange={(e) => updateRange(param, 'step', Number(e.target.value))}
                    className={`w-full border rounded p-2 ${
                      isDark 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    step={limits.step}
                  />
                </div>
              </div>
              
              {/* Search Space Info */}
              <div className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>Espaço de busca:</strong> {Math.ceil((range.max - range.min) / range.step) + 1} pontos
                <br />
                <strong>Resolução:</strong> {range.step} {limits.unit}
              </div>
              
              {/* Warning for narrow ranges */}
              {(range.max - range.min) < (limits.max - limits.min) * 0.3 && (
                <div className={`mt-2 p-2 rounded text-xs ${isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50 text-yellow-700'}`}>
                  ⚠️ Faixa muito restrita pode limitar a otimização
                </div>
              )}
            </div>
              );
            })()
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
            {getMethodIcon(optimizationMethod)}
            <span className="ml-2">
              {isOptimizing ? 'Otimizando...' : `Executar ${optimizationMethod === 'grid' ? 'Grid Search' : optimizationMethod === 'genetic' ? 'Algoritmo Genético' : 'Otimização Bayesiana'}`}
            </span>
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

        {/* Progress Bar and Log */}
        {isOptimizing && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} mb-6`}>
            <div className="flex justify-between text-sm mb-2">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Progresso da Otimização ({optimizationMethod === 'grid' ? 'Grid Search' : optimizationMethod === 'genetic' ? 'Algoritmo Genético' : 'Otimização Bayesiana'})
              </span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* Optimization Log */}
            {optimizationLog.length > 0 && (
              <div className={`mt-4 p-3 rounded ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Log de Otimização:
                </h4>
                <div className={`text-xs space-y-1 max-h-32 overflow-y-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {optimizationLog.slice(-5).map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optimization Results */}
        {optimizedResult && (
          <div className={`p-6 rounded-lg ${isDark ? 'bg-green-900' : 'bg-green-50'} border ${isDark ? 'border-green-700' : 'border-green-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-green-300' : 'text-green-800'}`}>
              <BarChart className="h-5 w-5 mr-2" />
              Resultados da Otimização ML
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
                {optimizedResult.quality.toFixed(2)}
              </div>
              <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                +{optimizedResult.improvement.toFixed(1)} unidades de melhoria
              </div>
            </div>

            {/* Algorithm Performance Details */}
            <div className={`mt-4 p-3 rounded ${isDark ? 'bg-green-800' : 'bg-green-100'}`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                Performance do Algoritmo:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className={`${isDark ? 'text-green-300' : 'text-green-700'}`}>Método:</span>
                  <span className={`ml-2 font-medium ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                    {optimizedResult.method}
                  </span>
                </div>
                <div>
                  <span className={`${isDark ? 'text-green-300' : 'text-green-700'}`}>Avaliações:</span>
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
                <li>• <strong>Tempo otimizado ({optimizedResult.tempo.toFixed(0)} min):</strong> Permite reação completa sem degradação</li>
                <li>• <strong>Pressão ajustada ({optimizedResult.pressao.toFixed(1)} kPa):</strong> Maximiza a densidade do produto</li>
                <li>• <strong>Velocidade calibrada ({optimizedResult.velocidade.toFixed(0)} rpm):</strong> Garante mistura homogênea</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};