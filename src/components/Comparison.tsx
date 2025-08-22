import React, { useState } from 'react';
import { Plus, Trash2, GitCompare } from 'lucide-react';
import { Scenario } from '../types';

interface ComparisonProps {
  t: (key: string) => string;
  isDark: boolean;
}

export const Comparison: React.FC<ComparisonProps> = ({ t, isDark }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      name: t('manualScenario'),
      parameters: { temperatura: 1450, tempo: 30, pressao: 101, velocidade: 300 },
      quality: 350,
      isOptimized: false
    },
    {
      name: t('optimizedScenario'),
      parameters: { temperatura: 1510, tempo: 80, pressao: 102, velocidade: 310 },
      quality: 370,
      isOptimized: true
    }
  ]);

  const [newScenario, setNewScenario] = useState({
    name: '',
    temperatura: 1450,
    tempo: 30,
    pressao: 101,
    velocidade: 300
  });

  const addScenario = () => {
    if (newScenario.name.trim()) {
      const quality = 350 + (newScenario.temperatura - 1450) * 0.1 + (newScenario.tempo - 30) * 0.2;
      setScenarios([...scenarios, {
        name: newScenario.name,
        parameters: {
          temperatura: newScenario.temperatura,
          tempo: newScenario.tempo,
          pressao: newScenario.pressao,
          velocidade: newScenario.velocidade
        },
        quality: quality,
        isOptimized: false
      }]);
      setNewScenario({
        name: '',
        temperatura: 1450,
        tempo: 30,
        pressao: 101,
        velocidade: 300
      });
    }
  };

  const removeScenario = (index: number) => {
    setScenarios(scenarios.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <GitCompare className="h-6 w-6 mr-2 text-blue-500" />
          <span>{t('compareScenarios')} - </span>
          <img 
            src="/Metalyicscerta.png" 
                alt="Metalyics" 
                className="mx-auto"
                style={{ height: "20px", width: "auto" }}
          />
        </h2>

        {/* Add New Scenario */}
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('addScenario')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Nome do Cenário
              </label>
              <input
                type="text"
                value={newScenario.name}
                onChange={(e) => setNewScenario({...newScenario, name: e.target.value})}
                className={`w-full border rounded p-2 ${
                  isDark 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Ex: Teste 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('temperature')}
                </label>
                <input
                  type="number"
                  value={newScenario.temperatura}
                  onChange={(e) => setNewScenario({...newScenario, temperatura: Number(e.target.value)})}
                  className={`w-full border rounded p-2 ${
                    isDark 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('time')}
                </label>
                <input
                  type="number"
                  value={newScenario.tempo}
                  onChange={(e) => setNewScenario({...newScenario, tempo: Number(e.target.value)})}
                  className={`w-full border rounded p-2 ${
                    isDark 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={addScenario}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Scenarios Comparison Table */}
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDark ? 'divide-gray-600' : 'divide-gray-200'}`}>
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  Cenário
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('temperature')} (°C)
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('time')} (min)
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('pressure')} (kPa)
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('speed')} (rpm)
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  Qualidade
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className={`${isDark ? 'bg-gray-800 divide-gray-600' : 'bg-white divide-gray-200'} divide-y`}>
              {scenarios.map((scenario, index) => (
                <tr key={index} className={scenario.isOptimized ? (isDark ? 'bg-blue-900' : 'bg-blue-50') : ''}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {scenario.name}
                    {scenario.isOptimized && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Otimizado
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {scenario.parameters.temperatura}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {scenario.parameters.tempo}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {scenario.parameters.pressao}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {scenario.parameters.velocidade}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    scenario.quality >= 365 ? 'text-green-600' : 
                    scenario.quality >= 355 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {scenario.quality.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {!scenario.isOptimized && (
                      <button
                        onClick={() => removeScenario(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quality Comparison Chart */}
        <div className="mt-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Comparação de Qualidade
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                scenario.isOptimized 
                  ? (isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200')
                  : (isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200')
              }`}>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {scenario.name}
                </h4>
                <div className={`text-2xl font-bold ${
                  scenario.quality >= 365 ? 'text-green-600' : 
                  scenario.quality >= 355 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {scenario.quality.toFixed(1)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      scenario.quality >= 365 ? 'bg-green-600' : 
                      scenario.quality >= 355 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min((scenario.quality / 380) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};