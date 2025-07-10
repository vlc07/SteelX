import React, { useState } from 'react';
import { ModelTraining } from './ModelTraining';
import { ModelOptimization } from './ModelOptimization';
import { DataInput } from './DataInput';
import { ResultsVisualization } from './ResultsVisualization';
import { useDataContext } from '../context/DataContext';

export const Home: React.FC = () => {
  const { addNotification } = useDataContext();
  const [activeTab, setActiveTab] = useState<'data' | 'training' | 'optimization' | 'results'>('data');
  
  // Simulate the optimized parameters from Python code
  const [optimizedParams, setOptimizedParams] = useState({
    temperature: 1510,
    time: 80,
    pressure: 102,
    speed: 310,
    predictedQuality: 370
  });

  const handleTabChange = (tab: 'data' | 'training' | 'optimization' | 'results') => {
    setActiveTab(tab);
    addNotification(`Switched to ${tab} tab`, 'info');
  };

  const handleOptimizationComplete = () => {
    // This would normally come from the backend
    addNotification('Optimization completed successfully!', 'success');
    setActiveTab('results');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="flex border-b">
          <button
            className={`px-4 py-3 font-medium text-sm flex-1 ${
              activeTab === 'data' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => handleTabChange('data')}
          >
            1. Data Input
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm flex-1 ${
              activeTab === 'training' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => handleTabChange('training')}
          >
            2. Model Training
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm flex-1 ${
              activeTab === 'optimization' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => handleTabChange('optimization')}
          >
            3. Optimization
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm flex-1 ${
              activeTab === 'results' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => handleTabChange('results')}
          >
            4. Results
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'data' && <DataInput />}
          {activeTab === 'training' && <ModelTraining />}
          {activeTab === 'optimization' && (
            <ModelOptimization onOptimizationComplete={handleOptimizationComplete} />
          )}
          {activeTab === 'results' && <ResultsVisualization optimizedParams={optimizedParams} />}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">About This Tool</h2>
          <p className="text-gray-700 mb-4">
            ProcessOptimizer helps you find the optimal parameters for manufacturing processes using advanced 
            machine learning techniques. Upload your process data, train a model, and discover the optimal 
            settings for maximum quality.
          </p>
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h3 className="text-blue-700 font-medium mb-2">Key Benefits</h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Save time and resources through intelligent optimization</li>
              <li>Visualize parameter relationships and impacts</li>
              <li>Eliminate trial-and-error approaches</li>
              <li>Improve product quality consistency</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Getting Started</h2>
          <ol className="list-decimal pl-5 text-gray-700 space-y-3">
            <li>
              <strong>Prepare Your Data</strong>
              <p className="text-sm text-gray-600 mt-1">
                Organize process parameters and quality measurements in a tabular format.
              </p>
            </li>
            <li>
              <strong>Upload and Configure</strong>
              <p className="text-sm text-gray-600 mt-1">
                Import your data and select the target quality variable and input parameters.
              </p>
            </li>
            <li>
              <strong>Train Model</strong>
              <p className="text-sm text-gray-600 mt-1">
                Select a machine learning model and train it on your process data.
              </p>
            </li>
            <li>
              <strong>Optimize Parameters</strong>
              <p className="text-sm text-gray-600 mt-1">
                Define parameter ranges and constraints, then run the optimization.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};