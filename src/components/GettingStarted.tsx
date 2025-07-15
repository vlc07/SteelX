import React, { useState } from 'react';
import { 
  Play, 
  Settings, 
  BarChart3, 
  Target, 
  FileText, 
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Clock,
  TrendingUp
} from 'lucide-react';

interface GettingStartedProps {
  onStartTour: () => void;
  onTabChange: (tab: string) => void;
  isDark: boolean;
}

export const GettingStarted: React.FC<GettingStartedProps> = ({
  onStartTour,
  onTabChange,
  isDark
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 1,
      title: 'Ajustar Parâmetros',
      description: 'Configure os parâmetros do processo: temperatura, tempo, pressão e velocidade',
      icon: Settings,
      tab: 'dashboard',
      time: '2 min',
      difficulty: 'Fácil'
    },
    {
      id: 2,
      title: 'Calcular Qualidade',
      description: 'Obtenha uma previsão instantânea da qualidade baseada nos parâmetros atuais',
      icon: Target,
      tab: 'dashboard',
      time: '1 min',
      difficulty: 'Fácil'
    },
    {
      id: 3,
      title: 'Executar Simulações',
      description: 'Teste diferentes cenários com simulação única, em lote ou análise de sensibilidade',
      icon: BarChart3,
      tab: 'simulation',
      time: '5 min',
      difficulty: 'Médio'
    },
    {
      id: 4,
      title: 'Otimizar Parâmetros',
      description: 'Use algoritmos inteligentes para encontrar a melhor combinação de parâmetros',
      icon: TrendingUp,
      tab: 'optimization',
      time: '3 min',
      difficulty: 'Médio'
    },
    {
      id: 5,
      title: 'Analisar Resultados',
      description: 'Visualize gráficos detalhados e exporte relatórios dos resultados obtidos',
      icon: FileText,
      tab: 'results',
      time: '3 min',
      difficulty: 'Fácil'
    }
  ];

  const toggleStepCompletion = (stepId: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const goToStep = (tab: string) => {
    onTabChange(tab);
  };

  const progressPercentage = (completedSteps.length / steps.length) * 100;

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Guia de Início Rápido
        </h2>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          Siga estes passos para começar a otimizar seus processos metalúrgicos com o SteelX
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Progresso: {completedSteps.length} de {steps.length} passos
            </span>
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={onStartTour}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="h-4 w-4 mr-2" />
            Tour Interativo
          </button>
          
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Target className="h-4 w-4 mr-2" />
            Começar Agora
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(step.id);
          
          return (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-all ${
                isCompleted
                  ? (isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200')
                  : (isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200')
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Step Number/Check */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : (isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600')
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold flex items-center ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      <Icon className="h-4 w-4 mr-2" />
                      {step.title}
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        step.difficulty === 'Fácil'
                          ? (isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800')
                          : (isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800')
                      }`}>
                        {step.difficulty}
                      </span>
                      <span className={`text-xs flex items-center ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {step.time}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-3 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleStepCompletion(step.id)}
                      className={`text-sm ${
                        isCompleted
                          ? (isDark ? 'text-green-400' : 'text-green-600')
                          : (isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
                      }`}
                    >
                      {isCompleted ? '✓ Concluído' : 'Marcar como concluído'}
                    </button>

                    <button
                      onClick={() => goToStep(step.tab)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Ir para esta etapa
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-blue-900' : 'bg-blue-50'} border ${isDark ? 'border-blue-700' : 'border-blue-200'}`}>
        <h3 className={`font-semibold mb-2 flex items-center ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
          <Lightbulb className="h-4 w-4 mr-2" />
          Dicas Importantes
        </h3>
        <ul className={`text-sm space-y-1 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
          <li>• Comece sempre pelo Dashboard para entender os parâmetros básicos</li>
          <li>• A temperatura é o parâmetro que mais influencia a qualidade final</li>
          <li>• Use a análise de sensibilidade para entender o impacto de cada parâmetro</li>
          <li>• Experimente diferentes algoritmos de otimização para comparar resultados</li>
          <li>• Salve seus resultados usando a função de download para análise posterior</li>
        </ul>
      </div>

      {/* Completion Message */}
      {completedSteps.length === steps.length && (
        <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-green-900' : 'bg-green-50'} border ${isDark ? 'border-green-700' : 'border-green-200'}`}>
          <div className="flex items-center">
            <CheckCircle className={`h-5 w-5 mr-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <span className={`font-medium ${isDark ? 'text-green-300' : 'text-green-800'}`}>
              Parabéns! Você completou todos os passos do guia de início rápido.
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-green-200' : 'text-green-700'}`}>
            Agora você está pronto para usar todas as funcionalidades do SteelX de forma eficiente.
          </p>
        </div>
      )}
    </div>
  );
};