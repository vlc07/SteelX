import React, { useState } from 'react';
import { Download, Share2, Printer, FileText, ArrowUpDown } from 'lucide-react';

interface OptimizedParams {
  temperature: number;
  time: number;
  pressure: number;
  speed: number;
  predictedQuality: number;
}

interface ResultsVisualizationProps {
  optimizedParams: OptimizedParams;
}

export const ResultsVisualization: React.FC<ResultsVisualizationProps> = ({ optimizedParams }) => {
  const [selectedChart, setSelectedChart] = useState<'parameter-impact' | 'response-surface' | 'comparison'>('parameter-impact');
  
  // Quality levels for simulation
  const qualityLevels = [
    { params: { temperature: 1450, time: 30, pressure: 101, speed: 300 }, quality: 350 },
    { params: { temperature: 1470, time: 50, pressure: 100, speed: 290 }, quality: 360 },
    { params: { temperature: 1490, time: 70, pressure: 101, speed: 300 }, quality: 362 },
    { params: { temperature: 1510, time: 80, pressure: 102, speed: 310 }, quality: 370 },
    { params: { temperature: 1520, time: 35, pressure: 101, speed: 300 }, quality: 352 },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Optimization Results</h2>
        
        <div className="flex space-x-2">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            <Download className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            <Share2 className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            <Printer className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <div className="bg-white p-4 rounded-lg shadow-md h-[400px] relative">
            <div className="absolute top-4 right-4 bg-white rounded-md shadow-sm">
              <button 
                className={`px-3 py-1.5 text-sm ${selectedChart === 'parameter-impact' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                onClick={() => setSelectedChart('parameter-impact')}
              >
                Parameter Impact
              </button>
              <button 
                className={`px-3 py-1.5 text-sm ${selectedChart === 'response-surface' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                onClick={() => setSelectedChart('response-surface')}
              >
                Response Surface
              </button>
              <button 
                className={`px-3 py-1.5 text-sm ${selectedChart === 'comparison' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                onClick={() => setSelectedChart('comparison')}
              >
                Comparison
              </button>
            </div>
            
            {selectedChart === 'parameter-impact' && (
              <div className="h-full flex flex-col justify-center items-center">
                <svg width="100%" height="100%" viewBox="0 0 800 350">
                  {/* X and Y axes */}
                  <line x1="100" y1="280" x2="700" y2="280" stroke="#ccc" strokeWidth="2" />
                  <line x1="100" y1="50" x2="100" y2="280" stroke="#ccc" strokeWidth="2" />
                  
                  {/* X-axis labels */}
                  <text x="150" y="300" textAnchor="middle" fill="#666" fontSize="12">Temperature</text>
                  <text x="300" y="300" textAnchor="middle" fill="#666" fontSize="12">Time</text>
                  <text x="450" y="300" textAnchor="middle" fill="#666" fontSize="12">Pressure</text>
                  <text x="600" y="300" textAnchor="middle" fill="#666" fontSize="12">Speed</text>
                  
                  {/* Y-axis labels */}
                  <text x="80" y="280" textAnchor="end" fill="#666" fontSize="12">0%</text>
                  <text x="80" y="165" textAnchor="end" fill="#666" fontSize="12">50%</text>
                  <text x="80" y="50" textAnchor="end" fill="#666" fontSize="12">100%</text>
                  <text x="70" y="170" textAnchor="middle" fill="#666" fontSize="12" transform="rotate(-90 70,170)">Impact on Quality</text>
                  
                  {/* Title */}
                  <text x="400" y="30" textAnchor="middle" fill="#333" fontSize="16" fontWeight="bold">Parameter Impact on Quality</text>
                  
                  {/* Bars */}
                  <rect x="125" y="100" width="50" height="180" fill="#60a5fa" />
                  <rect x="275" y="130" width="50" height="150" fill="#60a5fa" />
                  <rect x="425" y="190" width="50" height="90" fill="#60a5fa" />
                  <rect x="575" y="210" width="50" height="70" fill="#60a5fa" />
                  
                  {/* Percentages */}
                  <text x="150" y="95" textAnchor="middle" fill="#333" fontSize="12">45%</text>
                  <text x="300" y="125" textAnchor="middle" fill="#333" fontSize="12">30%</text>
                  <text x="450" y="185" textAnchor="middle" fill="#333" fontSize="12">15%</text>
                  <text x="600" y="205" textAnchor="middle" fill="#333" fontSize="12">10%</text>
                </svg>
              </div>
            )}
            
            {selectedChart === 'response-surface' && (
              <div className="h-full flex flex-col justify-center items-center">
                <svg width="100%" height="100%" viewBox="0 0 800 350">
                  {/* Gradient background representing response surface */}
                  <defs>
                    <linearGradient id="surfaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fde68a" />
                      <stop offset="50%" stopColor="#fca5a5" />
                      <stop offset="100%" stopColor="#93c5fd" />
                    </linearGradient>
                  </defs>
                  <rect x="100" y="50" width="600" height="230" fill="url(#surfaceGradient)" opacity="0.7" />
                  
                  {/* Contour lines */}
                  <path d="M100,180 C250,150 300,200 450,160 C600,120 650,150 700,130" stroke="#666" strokeWidth="1" fill="none" />
                  <path d="M100,220 C200,200 350,230 500,210 C650,190 680,200 700,180" stroke="#666" strokeWidth="1" fill="none" />
                  <path d="M100,140 C200,120 300,150 450,110 C600,70 650,90 700,80" stroke="#666" strokeWidth="1" fill="none" />
                  
                  {/* Optimal point */}
                  <circle cx="480" cy="90" r="8" fill="#ef4444" />
                  <circle cx="480" cy="90" r="12" fill="transparent" stroke="#ef4444" strokeWidth="2">
                    <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
                  </circle>
                  
                  {/* Axes */}
                  <line x1="100" y1="280" x2="700" y2="280" stroke="#333" strokeWidth="2" />
                  <line x1="100" y1="50" x2="100" y2="280" stroke="#333" strokeWidth="2" />
                  
                  {/* Axis labels */}
                  <text x="400" y="320" textAnchor="middle" fill="#333" fontSize="14">Temperature (°C)</text>
                  <text x="40" y="165" textAnchor="middle" fill="#333" fontSize="14" transform="rotate(-90 40,165)">Time (min)</text>
                  
                  {/* Title */}
                  <text x="400" y="30" textAnchor="middle" fill="#333" fontSize="16" fontWeight="bold">Response Surface (Temperature vs. Time)</text>
                  
                  {/* Legend */}
                  <rect x="580" y="60" width="100" height="80" fill="white" stroke="#ccc" />
                  <text x="630" y="75" textAnchor="middle" fontSize="12" fill="#333">Quality</text>
                  <rect x="590" y="85" width="15" height="10" fill="#93c5fd" />
                  <text x="630" y="95" textAnchor="start" fontSize="10" fill="#333" x="610">Low</text>
                  <rect x="590" y="105" width="15" height="10" fill="#fca5a5" />
                  <text x="630" y="115" textAnchor="start" fontSize="10" fill="#333" x="610">Medium</text>
                  <rect x="590" y="125" width="15" height="10" fill="#fde68a" />
                  <text x="630" y="135" textAnchor="start" fontSize="10" fill="#333" x="610">High</text>
                </svg>
              </div>
            )}
            
            {selectedChart === 'comparison' && (
              <div className="h-full flex flex-col justify-center items-center">
                <svg width="100%" height="100%" viewBox="0 0 800 350">
                  {/* Axes */}
                  <line x1="100" y1="280" x2="700" y2="280" stroke="#333" strokeWidth="2" />
                  <line x1="100" y1="50" x2="100" y2="280" stroke="#333" strokeWidth="2" />
                  
                  {/* X-axis labels */}
                  <text x="180" y="300" textAnchor="middle" fill="#666" fontSize="12">Default</text>
                  <text x="300" y="300" textAnchor="middle" fill="#666" fontSize="12">Test 1</text>
                  <text x="420" y="300" textAnchor="middle" fill="#666" fontSize="12">Test 2</text>
                  <text x="540" y="300" textAnchor="middle" fill="#666" fontSize="12">Test 3</text>
                  <text x="660" y="300" textAnchor="middle" fill="#666" fontSize="12">Optimal</text>
                  
                  {/* Y-axis labels */}
                  <text x="80" y="280" textAnchor="end" fill="#666" fontSize="12">350</text>
                  <text x="80" y="220" textAnchor="end" fill="#666" fontSize="12">355</text>
                  <text x="80" y="160" textAnchor="end" fill="#666" fontSize="12">360</text>
                  <text x="80" y="100" textAnchor="end" fill="#666" fontSize="12">365</text>
                  <text x="80" y="50" textAnchor="end" fill="#666" fontSize="12">370</text>
                  
                  <text x="40" y="165" textAnchor="middle" fill="#333" fontSize="14" transform="rotate(-90 40,165)">Quality</text>
                  
                  {/* Title */}
                  <text x="400" y="30" textAnchor="middle" fill="#333" fontSize="16" fontWeight="bold">Quality Comparison Across Parameter Sets</text>
                  
                  {/* Bars */}
                  <rect x="150" y="280" width="60" height="0" fill="#3b82f6">
                    <animate attributeName="height" from="0" to="280-${280 - (350-350)*10}" dur="1s" fill="freeze" />
                  </rect>
                  <rect x="270" y="280" width="60" height="0" fill="#3b82f6">
                    <animate attributeName="height" from="0" to="280-${280 - (360-350)*10}" dur="1s" fill="freeze" />
                  </rect>
                  <rect x="390" y="280" width="60" height="0" fill="#3b82f6">
                    <animate attributeName="height" from="0" to="280-${280 - (362-350)*10}" dur="1s" fill="freeze" />
                  </rect>
                  <rect x="510" y="280" width="60" height="0" fill="#3b82f6">
                    <animate attributeName="height" from="0" to="280-${280 - (352-350)*10}" dur="1s" fill="freeze" />
                  </rect>
                  <rect x="630" y="280" width="60" height="0" fill="#ef4444">
                    <animate attributeName="height" from="0" to="280-${280 - (370-350)*10}" dur="1s" fill="freeze" />
                  </rect>
                  
                  {/* Values */}
                  <text x="180" y="275" textAnchor="middle" fill="#fff" fontSize="14">350</text>
                  <text x="300" y="235" textAnchor="middle" fill="#fff" fontSize="14">360</text>
                  <text x="420" y="215" textAnchor="middle" fill="#fff" fontSize="14">362</text>
                  <text x="540" y="255" textAnchor="middle" fill="#fff" fontSize="14">352</text>
                  <text x="660" y="115" textAnchor="middle" fill="#fff" fontSize="14">370</text>
                </svg>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ArrowUpDown className="h-5 w-5 mr-2 text-blue-600" />
            Optimal Parameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Temperature</label>
              <div className="flex items-center">
                <div className="text-2xl font-bold text-gray-800">{optimizedParams.temperature}</div>
                <div className="ml-2 text-sm text-gray-500">°C</div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Time</label>
              <div className="flex items-center">
                <div className="text-2xl font-bold text-gray-800">{optimizedParams.time}</div>
                <div className="ml-2 text-sm text-gray-500">min</div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Pressure</label>
              <div className="flex items-center">
                <div className="text-2xl font-bold text-gray-800">{optimizedParams.pressure}</div>
                <div className="ml-2 text-sm text-gray-500">kPa</div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Speed</label>
              <div className="flex items-center">
                <div className="text-2xl font-bold text-gray-800">{optimizedParams.speed}</div>
                <div className="ml-2 text-sm text-gray-500">rpm</div>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500 mb-1">Predicted Quality</label>
              <div className="flex items-center">
                <div className="text-2xl font-bold text-green-600">{optimizedParams.predictedQuality}</div>
                <div className="ml-2 text-sm text-gray-500">units</div>
              </div>
              <div className="text-sm text-green-600 font-medium mt-1">
                +20 units (+5.7%) from baseline
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
              <FileText className="h-4 w-4 mr-2" />
              Export Detailed Report
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Process Parameters Comparison</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter Set</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp (°C)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time (min)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Press (kPa)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speed (rpm)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {qualityLevels.map((level, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Test {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {level.params.temperature}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {level.params.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {level.params.pressure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {level.params.speed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {level.quality}
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                    Optimal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-medium">
                    {optimizedParams.temperature}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-medium">
                    {optimizedParams.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-medium">
                    {optimizedParams.pressure}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-medium">
                    {optimizedParams.speed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-medium">
                    {optimizedParams.predictedQuality}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-md border border-green-100">
              <h4 className="font-medium text-green-800 mb-2">Implementation Guidelines</h4>
              <p className="text-sm text-green-700">
                The optimal parameters should be implemented gradually. Start with a small batch test
                before scaling to full production.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Parameter Sensitivity</h4>
              <p className="text-sm text-blue-700 mb-2">
                Temperature has the highest impact on quality. Maintain it within ±5°C of the optimal value.
              </p>
              <p className="text-sm text-blue-700">
                Time is the second most critical parameter. Deviations beyond ±10 minutes may significantly
                reduce quality.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-md border border-yellow-100">
              <h4 className="font-medium text-yellow-800 mb-2">Further Optimization</h4>
              <p className="text-sm text-yellow-700">
                Consider exploring additional parameters such as cooling rate and material composition
                for even better results in future optimization runs.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-md border border-purple-100">
              <h4 className="font-medium text-purple-800 mb-2">Quality Control</h4>
              <p className="text-sm text-purple-700">
                Implement regular quality checks during production with these parameters.
                Monitor temperature closely as it shows the highest correlation with quality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};