import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface HelpProps {
  t: (key: string) => string;
  isDark: boolean;
}

export const Help: React.FC<HelpProps> = ({ t, isDark }) => {
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({
    'getting-started': true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const faqItems = [
    {
      id: 'getting-started',
      question: 'Como começar a usar o otimizador?',
      answer: 'Comece ajustando os parâmetros do processo na aba Dashboard, clique em Calcular e analise os resultados. Use as outras abas para comparar cenários e otimizar automaticamente.'
    },
    {
      id: 'parameters',
      question: 'O que significam os parâmetros do processo?',
      answer: 'Temperatura afeta a velocidade da reação, Tempo determina a duração do processo, Pressão influencia a densidade, e Velocidade controla a mistura dos materiais.'
    },
    {
      id: 'quality',
      question: 'Como interpretar a qualidade prevista?',
      answer: 'Valores abaixo de 355 indicam qualidade ruim, entre 355-365 qualidade boa, e acima de 365 qualidade excelente. Use as dicas coloridas para melhorar.'
    },
    {
      id: 'optimization',
      question: 'Como funciona a otimização automática?',
      answer: 'O sistema testa diferentes combinações de parâmetros dentro das faixas definidas e encontra a combinação que produz a maior qualidade possível.'
    },
    {
      id: 'comparison',
      question: 'Para que serve a comparação de cenários?',
      answer: 'Permite comparar diferentes configurações lado a lado, ajudando a entender o impacto de cada parâmetro na qualidade final.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <HelpCircle className="h-6 w-6 mr-2 text-blue-500" />
          <span>{t('help')} & FAQ - </span>
          <img 
            src="/metalyics-logo.svg" 
            alt="MetaLytics" 
            className="h-7 w-auto ml-2"
          />
        </h2>

        {/* Quick Start Guide */}
        <div className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} rounded-lg p-4 mb-6 border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
          <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            🚀 Guia Rápido
          </h3>
          <ol className={`list-decimal list-inside space-y-2 text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
            <li>Vá para o <strong>Dashboard</strong> e ajuste os parâmetros do processo</li>
            <li>Clique em <strong>Calcular</strong> para ver a qualidade prevista</li>
            <li>Use a aba <strong>Comparação</strong> para testar diferentes cenários</li>
            <li>Execute a <strong>Otimização</strong> para encontrar os melhores parâmetros</li>
            <li>Baixe os <strong>Resultados</strong> em CSV para análise posterior</li>
          </ol>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Perguntas Frequentes
          </h3>
          
          {faqItems.map((item) => (
            <div key={item.id} className={`border rounded-lg ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
              <button
                onClick={() => toggleSection(item.id)}
                className={`w-full text-left p-4 flex items-center justify-between hover:bg-opacity-50 ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {item.question}
                </span>
                {openSections[item.id] ? (
                  <ChevronDown className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <ChevronRight className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </button>
              
              {openSections[item.id] && (
                <div className={`px-4 pb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className={`mt-8 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
          <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            💡 Dicas Importantes
          </h3>
          <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>• Sempre teste pequenas variações antes de fazer grandes mudanças</li>
            <li>• A temperatura é o parâmetro que mais influencia a qualidade</li>
            <li>• Use a comparação de cenários para entender tendências</li>
            <li>• Salve seus resultados regularmente usando o botão de download</li>
            <li>• Consulte o glossário para entender os termos técnicos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};