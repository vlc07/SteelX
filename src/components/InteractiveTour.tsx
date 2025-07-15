import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Play, CheckCircle } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange: (tab: string) => void;
  isDark: boolean;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  isOpen,
  onClose,
  onTabChange,
  isDark
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao SteelX',
      content: 'Este sistema inteligente otimiza processos de fusão de aço carbono usando algoritmos de Machine Learning avançados. Vamos fazer um tour pelas principais funcionalidades do sistema.',
      target: 'body',
      position: 'bottom'
    },
    {
      id: 'presentation',
      title: 'Apresentação do Sistema',
      content: 'Aqui você encontra informações detalhadas sobre o projeto, equipe de desenvolvimento, especificações técnicas e aplicações industriais do sistema SteelX.',
      target: '[data-tour="presentation-tab"]',
      position: 'right',
      action: 'presentation'
    },
    {
      id: 'dashboard',
      title: 'Painel Principal de Controle',
      content: 'O Dashboard é o centro de controle onde você ajusta os parâmetros do processo metalúrgico e obtém previsões instantâneas de qualidade usando nosso modelo de IA.',
      target: '[data-tour="dashboard-tab"]',
      position: 'right',
      action: 'dashboard'
    },
    {
      id: 'parameters',
      title: 'Configuração de Parâmetros',
      content: 'Ajuste os 4 parâmetros críticos do processo: Temperatura (maior impacto), Tempo, Pressão e Velocidade. Cada parâmetro influencia a qualidade final de forma diferente.',
      target: '[data-tour="parameters"]',
      position: 'left'
    },
    {
      id: 'calculate',
      title: 'Predição de Qualidade com IA',
      content: 'Clique em "Calcular Qualidade" para obter uma previsão instantânea baseada em nosso modelo de Machine Learning treinado com dados reais da indústria.',
      target: '[data-tour="calculate-button"]',
      position: 'top'
    },
    {
      id: 'simulation',
      title: 'Laboratório de Simulação ML',
      content: 'Execute diferentes tipos de análises: simulação única, em lote ou análise de sensibilidade para compreender o comportamento do modelo de IA em diversos cenários.',
      target: '[data-tour="simulation-tab"]',
      position: 'right',
      action: 'simulation'
    },
    {
      id: 'optimization',
      title: 'Otimização Inteligente',
      content: 'Utilize algoritmos avançados de otimização: Busca em Grade, Algoritmo Genético e Otimização Bayesiana para encontrar automaticamente os melhores parâmetros.',
      target: '[data-tour="optimization-tab"]',
      position: 'right',
      action: 'optimization'
    },
    {
      id: 'results',
      title: 'Análise Avançada de Resultados',
      content: 'Visualize resultados detalhados com gráficos interativos, métricas de performance do modelo ML e relatórios exportáveis para análise técnica.',
      target: '[data-tour="results-tab"]',
      position: 'right',
      action: 'results'
    },
    {
      id: 'help',
      title: 'Suporte e Documentação',
      content: 'Acesse documentação técnica completa, FAQ detalhado e glossário de termos para maximizar o uso do sistema SteelX.',
      target: '[data-tour="help-tab"]',
      position: 'right',
      action: 'help'
    },
    {
      id: 'complete',
      title: 'Tour Concluído com Sucesso',
      content: 'Parabéns! Agora você conhece todas as funcionalidades do SteelX. Comece pelo Dashboard para realizar sua primeira otimização de processo metalúrgico.',
      target: 'body',
      position: 'bottom',
      action: 'dashboard'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setIsActive(true);
      setCurrentStep(0);
    } else {
      setIsActive(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isActive && tourSteps[currentStep]?.action) {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        onTabChange(tourSteps[currentStep].action!);
      }, 100);
    }
  }, [currentStep, isActive, onTabChange]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeTour = () => {
    setIsActive(false);
    onClose();
    // Return to dashboard after tour completion
    onTabChange('dashboard');
  };

  const skipTour = () => {
    closeTour();
  };

  if (!isActive) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50" />
      
      {/* Tour Modal */}
      <div className={`fixed z-50 ${
        currentTourStep.target === 'body' 
          ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
          : 'top-4 right-4'
      }`}>
        <div className={`
          ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} 
          border rounded-xl shadow-2xl p-6 max-w-md w-full animate-slide-in
        `}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {currentTourStep.title}
            </h3>
            <button
              onClick={closeTour}
              className={`p-1 rounded-full hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed text-sm`}>
            {currentTourStep.content}
          </p>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                Passo {currentStep + 1} de {tourSteps.length}
              </span>
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                {Math.round(((currentStep + 1) / tourSteps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={skipTour}
              className={`text-sm px-3 py-1 rounded transition-colors ${
                isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pular Tour
            </button>

            <div className="flex space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Anterior
                </button>
              )}

              <button
                onClick={nextStep}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Finalizar
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Highlight Target Element */}
      {currentTourStep.target !== 'body' && (
        <style>
          {`
            ${currentTourStep.target} {
              position: relative !important;
              z-index: 51 !important;
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.6) !important;
              border-radius: 8px !important;
              background-color: ${isDark ? 'rgba(55, 65, 81, 0.95)' : 'rgba(255, 255, 255, 0.95)'} !important;
            }
          `}
        </style>
      )}
    </>
  );
};