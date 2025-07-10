import React, { useState } from 'react';
import { PieChart, BarChart, ArrowRight, Check, Settings, Award } from 'lucide-react';
import { useDataContext } from '../context/DataContext';

export const ModelTraining: React.FC = () => {
  const { addNotification } = useDataContext();
  const [modelType, setModelType] = useState<string>('linear');
  const [testSize, setTestSize] = useState<number>(20);
  const [cvFolds, setCvFolds] = useState<number>(5);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [isModelTrained, setIsModelTrained] = useState<boolean>(false);
  
  // These would normally come from the backend
  const modelMetrics = {
    r2: 0.98,
    mae: 1.2,
    mse: 2.5,
    featureImportance: [
      { feature: 'Temperature', importance: 0.45 },
      { feature: 'Time', importance: 0.30 },
      { feature: 'Pressure', importance: 0.15 },
      { feature: 'Speed', importance: 0.10 }
    ]
  };

  const handleTrainModel = () => {
    setIsTraining(true);
    // Simulate model training
    setTimeout(() => {
      setIsTraining(false);
      setIsModelTrained(true);
      addNotification('Model trained successfully', 'success');
    }, 2000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Model Training</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-4 text-gray-800">1. Select Model Type</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 rounded border hover:bg-gray-50 cursor-pointer">
              <input 
                type="radio" 
                name="modelType" 
                value="linear" 
                checked={modelType === 'linear'} 
                onChange={() => setModelType('linear')}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">Linear Regression</span>
            </label>
            
            <label className="flex items-center space-x-3 p-3 rounded border hover:bg-gray-50 cursor-pointer">
              <input 
                type="radio" 
                name="modelType" 
                value="randomforest" 
                checked={modelType === 'randomforest'} 
                onChange={() => setModelType('randomforest')}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">Random Forest</span>
            </label>
            
            <label className="flex items-center space-x-3 p-3 rounded border hover:bg-gray-50 cursor-pointer">
              <input 
                type="radio" 
                name="modelType" 
                value="svm" 
                checked={modelType === 'svm'} 
                onChange={() => setModelType('svm')}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">Support Vector Machine</span>
            </label>
            
            <label className="flex items-center space-x-3 p-3 rounded border hover:bg-gray-50 cursor-pointer">
              <input 
                type="radio" 
                name="modelType" 
                value="neural" 
                checked={modelType === 'neural'} 
                onChange={() => setModelType('neural')}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">Neural Network</span>
            </label>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-4 text-gray-800">2. Configure Validation</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Size (%)
            </label>
            <input 
              type="range" 
              min="10" 
              max="40" 
              value={testSize} 
              onChange={(e) => setTestSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10%</span>
              <span>{testSize}%</span>
              <span>40%</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cross-Validation Folds
            </label>
            <select 
              value={cvFolds} 
              onChange={(e) => setCvFolds(parseInt(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value={3}>3-Fold CV</option>
              <option value={5}>5-Fold CV</option>
              <option value={10}>10-Fold CV</option>
            </select>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-4 text-gray-800">3. Advanced Options</h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center justify-between text-sm text-gray-700">
                <span>Feature Normalization</span>
                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" defaultChecked />
              </label>
            </div>
            
            <div>
              <label className="flex items-center justify-between text-sm text-gray-700">
                <span>Handle Missing Values</span>
                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" defaultChecked />
              </label>
            </div>
            
            <div>
              <label className="flex items-center justify-between text-sm text-gray-700">
                <span>Feature Selection</span>
                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" defaultChecked />
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Random Seed
              </label>
              <input 
                type="number" 
                min="0" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                defaultValue={42}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mb-8">
        <button 
          className={`flex items-center px-6 py-3 rounded-md text-white font-medium ${
            isTraining ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
          onClick={handleTrainModel}
          disabled={isTraining}
        >
          {isTraining ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Training Model...
            </>
          ) : (
            <>
              {isModelTrained ? <Check className="mr-2 h-5 w-5" /> : <Settings className="mr-2 h-5 w-5" />}
              {isModelTrained ? 'Model Trained' : 'Train Model'}
            </>
          )}
        </button>
      </div>
      
      {isModelTrained && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Award className="text-green-600 h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold text-green-800">Model Training Results</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">R² Score:</span>
                  <span className="font-medium">{modelMetrics.r2.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${modelMetrics.r2 * 100}%` }}></div>
                </div>
                
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Mean Absolute Error:</span>
                  <span className="font-medium">{modelMetrics.mae.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Mean Squared Error:</span>
                  <span className="font-medium">{modelMetrics.mse.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Feature Importance</h4>
              <div className="space-y-2">
                {modelMetrics.featureImportance.map((feature, index) => (
                  <div key={index}>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{feature.feature}:</span>
                      <span className="font-medium">{(feature.importance * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${feature.importance * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button 
          className={`flex items-center px-4 py-2 rounded-md ${
            isModelTrained 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } transition-colors`}
          disabled={!isModelTrained}
        >
          Continue to Optimization <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};