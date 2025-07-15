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
      title: 'Configurar Parâmetros do Processo',
      description: 'Ajuste temperatura, tempo, pressão e velocidade para definir as condições do processo metalúrgico',
      icon: Settings,
      tab: 'dashboard',
      time: '2 min',
      difficulty: 'Básico'
    },
    {
      id: 2,
      title: 'Calcular Qualidade com IA',
      description: 'Execute o modelo de Machine Learning para obter previsão instantânea da qualidade do aço',
      icon: Target,
      tab: 'dashboard',
      time: '1 min',
      difficulty: 'Básico'
    },
    {
      id: 3,
      title: 'Executar Simulações Avançadas',
      description: 'Teste cenários com simulação única, em lote ou análise de sensibilidade para validação',
      icon: BarChart3,
      tab: 'simulation',
      time: '5 min',
      difficulty: 'Intermediário'
    },
    {
      id: 4,
      title: 'Otimizar com Algoritmos IA',
      description: 'Utilize algoritmos inteligentes (Genético, Bayesiano, Grid Search) para encontrar parâmetros ótimos',
      icon: TrendingUp,
      tab: 'optimization',
      time: '3 min',
      difficulty: 'Avançado'
    },
    {
      id: 5,
      title: 'Analisar Resultados e Relatórios',
      description: 'Visualize gráficos detalhados, métricas ML e exporte relatórios técnicos profissionais',
      icon: FileText,
      tab: 'results',
      time: '3 min',
      difficulty: 'Intermediário'
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

  const handleStartTour = () => {
    onStartTour();
  };

  const handleStartNow = () => {
    onTabChange('dashboard');
  };

  const progressPercentage = (completedSteps.length / steps.length) * 100;

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          🚀 Guia de Início Rápido - SteelX
        </h2>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
          Siga este roteiro profissional para dominar a otimização de processos metalúrgicos 
          com inteligência artificial e algoritmos de machine learning avançados.
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Progresso do Treinamento: {completedSteps.length} de {steps.length} etapas
            </span>
            <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleStartTour}
            className="flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md font-medium"
          >
            <Play className="h-4 w-4 mr-2" />
            Tour Interativo Guiado
          </button>
          
          <button
            onClick={handleStartNow}
            className={`flex items-center px-5 py-3 rounded-lg transition-all duration-200 shadow-md font-medium ${
              isDark 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <Target className="h-4 w-4 mr-2" />
            Começar Otimização
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
              className={`p-5 rounded-xl border-2 transition-all duration-300 ${
                isCompleted
                  ? (isDark ? 'bg-green-900 border-green-600 shadow-green-900/20' : 'bg-green-50 border-green-300 shadow-green-100')
                  : (isDark ? 'bg-gray-700 border-gray-600 hover:border-gray-500' : 'bg-gray-50 border-gray-200 hover:border-gray-300')
              } shadow-lg hover:shadow-xl`}
            >
              <div className="flex items-start space-x-4">
                {/* Step Number/Check */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-600 text-white shadow-lg'
                    : (isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-300 text-gray-700')
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm">{step.id}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold text-lg flex items-center ${
                      isDark ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      <Icon className="h-5 w-5 mr-2 text-blue-500" />
                      {step.title}
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        step.difficulty === 'Básico'
                          ? (isDark ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200')
                          : step.difficulty === 'Intermediário'
                          ? (isDark ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-800 border border-yellow-200')
                          : (isDark ? 'bg-red-900 text-red-300 border border-red-700' : 'bg-red-100 text-red-800 border border-red-200')
                      }`}>
                        {step.difficulty}
                      </span>
                      <span className={`text-xs flex items-center px-2 py-1 rounded ${
                        isDark ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-200'
                      }`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {step.time}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-4 leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleStepCompletion(step.id)}
                      className={`text-sm font-medium px-3 py-1 rounded transition-colors ${
                        isCompleted
                          ? (isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700')
                          : (isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200')
                      }`}
                    >
                      {isCompleted ? '✓ Etapa Concluída' : 'Marcar como Concluída'}
                    </button>

                    <button
                      onClick={() => goToStep(step.tab)}
                      className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors px-3 py-1 rounded hover:bg-blue-50"
                    >
                      Acessar Funcionalidade
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Professional Tips Section */}
      <div className={`mt-8 p-5 rounded-xl ${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} border-2`}>
        <h3 className={`font-bold text-lg mb-3 flex items-center ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
          <Lightbulb className="h-5 w-5 mr-2" />
          Dicas Profissionais para Otimização
        </h3>
        <ul className={`text-sm space-y-2 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">▶</span>
            <strong>Temperatura:</strong> Parâmetro crítico com maior impacto na qualidade (45% de influência)
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">▶</span>
            <strong>Análise de Sensibilidade:</strong> Execute antes da otimização para compreender dependências
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">▶</span>
            <strong>Algoritmos ML:</strong> Teste diferentes métodos para comparar eficiência e precisão
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">▶</span>
            <strong>Validação:</strong> Use simulação em lote para verificar estabilidade dos resultados
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">▶</span>
            <strong>Documentação:</strong> Exporte relatórios para análise posterior e auditoria técnica
          </li>
        </ul>
      </div>

      {/* Completion Message */}
      {completedSteps.length === steps.length && (
        <div className={`mt-6 p-5 rounded-xl ${isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'} border-2 animate-pulse`}>
          <div className="flex items-center mb-2">
            <CheckCircle className={`h-6 w-6 mr-3 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <span className={`font-bold text-lg ${isDark ? 'text-green-300' : 'text-green-800'}`}>
              🎉 Parabéns! Treinamento Concluído com Sucesso
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-green-200' : 'text-green-700'}`}>
            Você dominou todas as funcionalidades do SteelX e está pronto para otimizar processos 
            metalúrgicos com inteligência artificial de forma profissional e eficiente.
          </p>
        </div>
      )}
    </div>
  );
};