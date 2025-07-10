import React, { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';

interface GlossaryProps {
  t: (key: string) => string;
  isDark: boolean;
}

export const Glossary: React.FC<GlossaryProps> = ({ t, isDark }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const glossaryTerms = [
    {
      term: 'R² (Coeficiente de Determinação)',
      definition: t('r2Definition'),
      category: 'Métricas'
    },
    {
      term: 'MAE (Erro Médio Absoluto)',
      definition: t('maeDefinition'),
      category: 'Métricas'
    },
    {
      term: 'MSE (Erro Quadrático Médio)',
      definition: t('mseDefinition'),
      category: 'Métricas'
    },
    {
      term: 'Temperatura',
      definition: t('temperatureDefinition'),
      category: 'Parâmetros'
    },
    {
      term: 'Tempo de Processo',
      definition: 'Duração total do processo de fabricação. Tempos muito curtos podem resultar em reação incompleta, enquanto tempos muito longos podem causar degradação.',
      category: 'Parâmetros'
    },
    {
      term: 'Pressão',
      definition: 'Força aplicada por unidade de área durante o processo. Afeta a densidade e compactação do produto final.',
      category: 'Parâmetros'
    },
    {
      term: 'Velocidade de Rotação',
      definition: 'Velocidade de mistura ou agitação durante o processo. Influencia a homogeneidade e distribuição dos materiais.',
      category: 'Parâmetros'
    },
    {
      term: 'Otimização',
      definition: 'Processo de encontrar a melhor combinação de parâmetros para maximizar a qualidade do produto.',
      category: 'Conceitos'
    },
    {
      term: 'Cenário',
      definition: 'Conjunto específico de parâmetros de processo que pode ser testado e comparado com outros.',
      category: 'Conceitos'
    },
    {
      term: 'Qualidade Prevista',
      definition: 'Valor estimado da qualidade do produto baseado nos parâmetros de entrada e no modelo treinado.',
      category: 'Conceitos'
    },
    {
      term: 'Modelo Preditivo',
      definition: 'Algoritmo matemático que aprende padrões dos dados históricos para prever resultados futuros.',
      category: 'Conceitos'
    },
    {
      term: 'Faixa de Otimização',
      definition: 'Intervalo de valores mínimos e máximos dentro dos quais cada parâmetro pode variar durante a otimização.',
      category: 'Conceitos'
    }
  ];

  const filteredTerms = glossaryTerms.filter(term =>
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(glossaryTerms.map(term => term.category))];

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <BookOpen className="h-6 w-6 mr-2 text-blue-500" />
          {t('glossaryTitle')}
        </h2>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Buscar termos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <span
              key={category}
              className={`px-3 py-1 rounded-full text-sm ${
                isDark 
                  ? 'bg-blue-900 text-blue-300' 
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {category}
            </span>
          ))}
        </div>

        {/* Glossary Terms */}
        <div className="space-y-4">
          {filteredTerms.map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {item.term}
                </h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.category === 'Métricas' ? (isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') :
                  item.category === 'Parâmetros' ? (isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800') :
                  (isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800')
                }`}>
                  {item.category}
                </span>
              </div>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {item.definition}
              </p>
            </div>
          ))}
        </div>

        {filteredTerms.length === 0 && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Nenhum termo encontrado para "{searchTerm}"
          </div>
        )}

        {/* Quick Reference */}
        <div className={`mt-8 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
          <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            📚 Referência Rápida
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Faixas Recomendadas:
              </h4>
              <ul className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <li>• Temperatura: 1450-1520°C</li>
                <li>• Tempo: 30-90 minutos</li>
                <li>• Pressão: 100-102 kPa</li>
                <li>• Velocidade: 290-310 rpm</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Qualidade:
              </h4>
              <ul className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <li>• &lt; 355: Qualidade Ruim</li>
                <li>• 355-365: Qualidade Boa</li>
                <li>• &gt; 365: Qualidade Excelente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};