import React, { useState, useEffect } from 'react';
import { Sliders, Maximize, ArrowRight, CheckSquare } from 'lucide-react';
import { useDataContext } from '../context/DataContext';

interface ModelOptimizationProps {
  onOptimizationComplete: () => void;
}

export const ModelOptimization: React.FC<ModelOptimizationProps> = ({ onOptimizationComplete }) => {
  const { addNotification } = useDataContext();
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [parameters, setParameters] = useState({
    temperature: { min: 1450, max: 1520, step: 5 },
    time: { min: 30, max: 90, step: 5 },
    pressure: { min: 100, max: 102, step: 0.1 },
    speed: { min: 290, max: 310, step: 1 }
  });
  
  const handleStartOptimization = () => {
    setIsOptimizing(true);
    setProgress(0);
    addNotification('Optimization started', 'info');
  };
  
  useEffect(() => {
    if (isOptimizing) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsOptimizing(false);
            onOptimizationComplete();
            return 100;
          }
          return newProgress;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [isOptimizing, onOptimizationComplete]);
  
  const handleParameterChange = (
    param: 'temperature' | 'time' | 'pressure' | 'speed',
    field: 'min' | 'max' | 'step',
    value: number
  ) => {
    setParameters(prev => ({
      ...prev,
      [param]: {
        ...prev[param],
        [field]: value
      }
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Parameter Optimization</h2>
      
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
          <Sliders className="mr-2 h-5 w-5 text-blue-600" />
          Parameter Ranges
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature Range (°C)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input 
                  type="number"
                  value={parameters.temperature.min}
                  onChange={(e) => handleParameterChange('temperature', 'min', parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input 
                  type="number"
                  value={parameters.temperature.max}
                  onChange={(e) => handleParameterChange('temperature', 'max', parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Step</label>
                <input 
                  type="number"
                  value={parameters.temperature.step}
                  onChange={(e) => handleParameterChange('temperature', 'step', parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range (min)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input 
                  type="number"
                  value={parameters.time.min}
                  onChange={(e) => handleParameterChange('time', 'min', parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input 
                  type="number"
                  value={parameters.time.max}
                  onChange={(e) => handleParameterChange('time', 'max', parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Step</label>
                <input 
                  type="number"
                  value={parameters.time.step}
                  onChange={(e) => handleParameterChange('time', 'step', parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pressure Range (kPa)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input 
                  type="number"
                  value={parameters.pressure.min}
                  onChange={(e) => handleParameterChange('pressure', 'min', parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input 
                  type="number"
                  value={parameters.pressure.max}
                  onChange={(e) => handleParameterChange('pressure', 'max', parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Step</label>
                <input 
                  type="number"
                  value={parameters.pressure.step}
                  onChange={(e) => handleParameterChange('pressure', 'step', parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  step="0.1"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speed Range (rpm)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input 
                  type="number"
                  value={parameters.speed.min}
                  onChange={(e) => handleParameterChange('speed', 'min', parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input 
                  type="number"
                  value={parameters.speed.max}
                  onChange={(e) => handleParameterChange('speed', 'max', parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Step</label>
                <input 
                  type="number"
                  value={parameters.speed.step}
                  onChange={(e) => handleParameterChange('speed', 'step', parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <div className="flex space-x-4 items-center mb-4">
            <h4 className="text-sm font-medium text-gray-700">Optimization Method:</h4>
            <select className="block w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="grid">Grid Search</option>
              <option value="bayes">Bayesian Optimization</option>
              <option value="genetic">Genetic Algorithm</option>
              <option value="particle">Particle Swarm</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="constraints" 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="constraints" className="ml-2 block text-sm text-gray-700">
              Add parameter constraints
            </label>
          </div>
        </div>
      </div>
      
      {isOptimizing && (
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-8 animate-pulse">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Optimization Progress</h3>
          
          <div className="mb-2 flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Parameters evaluated:</span>
              <span className="ml-2 font-medium">{Math.floor(progress * 50)}</span>
            </div>
            <div>
              <span className="text-gray-500">Best quality found:</span>
              <span className="ml-2 font-medium">{360 + Math.floor(progress / 10)}</span>
            </div>
            <div>
              <span className="text-gray-500">Time elapsed:</span>
              <span className="ml-2 font-medium">{Math.floor(progress / 5)}s</span>
            </div>
            <div>
              <span className="text-gray-500">Estimated time remaining:</span>
              <span className="ml-2 font-medium">{Math.floor((100 - progress) / 5)}s</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-center">
        <button 
          className={`flex items-center px-6 py-3 rounded-md font-medium ${
            isOptimizing 
              ? 'bg-blue-400 text-white cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } transition-colors`}
          onClick={handleStartOptimization}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Optimizing...
            </>
          ) : (
            <>
              <Maximize className="mr-2 h-5 w-5" />
              Start Optimization
            </>
          )}
        </button>
      </div>
    </div>
  );
};