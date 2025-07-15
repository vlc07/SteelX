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
      content: 'Este sistema inteligente otimiza processos de fusão de aço carbono usando algoritmos de Machine Learning. Vamos fazer um tour pelas principais funcionalidades.',
      target: 'body',
      position: 'bottom'
    },
    {
      id: 'presentation',
      title: 'Apresentação do Sistema',
      content: 'Aqui você encontra informações sobre o projeto, equipe de desenvolvimento e especificações técnicas do sistema.',
      target: '[data-tour="presentation-tab"]',
      position: 'right',
      action: 'presentation'
    },
    {
      id: 'dashboard',
      title: 'Painel Principal',
      content: 'O Dashboard é onde você ajusta os parâmetros do processo e obtém uma previsão rápida da qualidade. É o ponto de partida para usar o sistema.',
      target: '[data-tour="dashboard-tab"]',
      position: 'right',
      action: 'dashboard'
    },
    {
      id: 'parameters',
      title: 'Parâmetros do Processo',
      content: 'Ajuste os 4 parâmetros principais: Temperatura, Tempo, Pressão e Velocidade. Cada um influencia a qualidade final do aço de forma diferente.',
      target: '[data-tour="parameters"]',
      position: 'left'
    },
    {
      id: 'calculate',
      title: 'Cálculo de Qualidade',
      content: 'Clique em "Calcular Qualidade" para obter uma previsão instantânea baseada nos parâmetros atuais. O sistema usa ML para fazer essa predição.',
      target: '[data-tour="calculate-button"]',
      position: 'top'
    },
    {
      id: 'simulation',
      title: 'Laboratório de Simulação',
      content: 'Na aba Simulação, você pode executar diferentes tipos de testes: simulação única, em lote ou análise de sensibilidade para entender melhor o comportamento do modelo.',
      target: '[data-tour="simulation-tab"]',
      position: 'right',
      action: 'simulation'
    },
    {
      id: 'optimization',
      title: 'Otimização Inteligente',
      content: 'O sistema oferece 3 algoritmos de otimização: Busca em Grade, Algoritmo Genético e Otimização Bayesiana. Cada um encontra os melhores parâmetros de forma diferente.',
      target: '[data-tour="optimization-tab"]',
      position: 'right',
      action: 'optimization'
    },
    {
      id: 'results',
      title: 'Análise de Resultados',
      content: 'Aqui você visualiza todos os resultados de simulações e otimizações, com gráficos detalhados e relatórios exportáveis.',
      target: '[data-tour="results-tab"]',
      position: 'right',
      action: 'results'
    },
    {
      id: 'help',
      title: 'Ajuda e Suporte',
      content: 'Se tiver dúvidas, consulte a seção de Ajuda com FAQ e o Glossário com definições técnicas.',
      target: '[data-tour="help-tab"]',
      position: 'right',
      action: 'help'
    },
    {
      id: 'complete',
      title: 'Tour Concluído',
      content: 'Agora você conhece as principais funcionalidades do SteelX. Comece pelo Dashboard para fazer sua primeira otimização!',
      target: 'body',
      position: 'bottom'
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
      onTabChange(tourSteps[currentStep].action!);
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
  };

  const skipTour = () => {
    closeTour();
  };

  if (!isActive) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
      
      {/* Tour Modal */}
      <div className={`fixed z-50 ${
        currentTourStep.target === 'body' 
          ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
          : 'top-4 right-4'
      }`}>
        <div className={`
          ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} 
          border rounded-lg shadow-xl p-6 max-w-md w-full
        `}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {currentTourStep.title}
            </h3>
            <button
              onClick={closeTour}
              className={`p-1 rounded ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
            {currentTourStep.content}
          </p>

          {/* Progress */}
          <div className="mb-4">
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
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={skipTour}
              className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Pular Tour
            </button>

            <div className="flex space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className={`flex items-center px-4 py-2 rounded ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Anterior
                </button>
              )}

              <button
                onClick={nextStep}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Concluir
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
              position: relative;
              z-index: 51;
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
              border-radius: 8px;
            }
          `}
        </style>
      )}
    </>
  );
};