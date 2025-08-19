import React from 'react';
import { 
  Users, 
  Building2, 
  Target, 
  Lightbulb, 
  Award, 
  TrendingUp,
  Factory,
  Database,
  Cpu,
  Shield,
  Globe,
  Zap
} from 'lucide-react';

interface PresentationProps {
  t: (key: string) => string;
  isDark: boolean;
}

export const Presentation: React.FC<PresentationProps> = ({ t, isDark }) => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className={`${isDark ? 'bg-gradient-to-br from-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-600 to-purple-600'} rounded-2xl p-8 text-white`}>
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <img 
              src="/metalyics-logo.svg" 
              alt="MetaLytics" 
              className="h-25 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {t('systemOverview')}
          </h1>
          <p className="text-xl mb-6 opacity-90">
            {t('intelligentSystem')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">
              {t('artificialIntelligence')}
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">
              {t('industry40')}
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">
              {t('processOptimization')}
            </span>
          </div>
        </div>
      </div>

      {/* Authors Section */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <Users className="h-6 w-6 mr-3 text-blue-500" />
          {t('teamDevelopment')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`text-center p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-100'} flex items-center justify-center`}>
              <Users className={`h-10 w-10 ${isDark ? 'text-white' : 'text-blue-600'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {t('vitorLorenzo')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('principalDeveloper')}
            </p>
          </div>

          <div className={`text-center p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${isDark ? 'bg-green-600' : 'bg-green-100'} flex items-center justify-center`}>
              <Users className={`h-10 w-10 ${isDark ? 'text-white' : 'text-green-600'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {t('bernardoKrauspenhar')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('dataAnalyst')}
            </p>
          </div>

          <div className={`text-center p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${isDark ? 'bg-purple-600' : 'bg-purple-100'} flex items-center justify-center`}>
              <Users className={`h-10 w-10 ${isDark ? 'text-white' : 'text-purple-600'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {t('lorenzoZatta')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('aiResearcher')}
            </p>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
          <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <Target className="h-6 w-6 mr-3 text-green-500" />
            Sobre o Projeto
          </h2>
          
          <div className="space-y-4">
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              Este projeto foi desenvolvido com base em <strong>dados reais</strong> do processo de fusão de aço carbono, 
              fornecidos pelo <strong>Centro Tecnológico Randon</strong>, uma das principais referências em 
              tecnologia industrial no Brasil.
            </p>
            
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              O sistema utiliza técnicas avançadas de <strong>Machine Learning</strong> e <strong>Inteligência Artificial</strong> 
              para otimizar parâmetros críticos do processo metalúrgico, resultando em maior qualidade do produto final 
              e redução de custos operacionais.
            </p>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900' : 'bg-blue-50'} border ${isDark ? 'border-blue-700' : 'border-blue-200'}`}>
              <div className="flex items-center mb-2">
                <Building2 className={`h-5 w-5 mr-2 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                <h3 className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  Parceria Estratégica
                </h3>
              </div>
              <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                Dados fornecidos pelo Centro Tecnológico Randon, garantindo autenticidade e aplicabilidade real 
                dos algoritmos desenvolvidos.
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
          <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <Lightbulb className="h-6 w-6 mr-3 text-yellow-500" />
            Inovação e Tecnologia
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900' : 'bg-purple-100'}`}>
                <Cpu className={`h-6 w-6 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
              </div>
              <div>
                <h3 className={`font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Algoritmos Inteligentes
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Implementação de algoritmos de otimização bayesiana, genética e busca em grade
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900' : 'bg-green-100'}`}>
                <Database className={`h-6 w-6 ${isDark ? 'text-green-300' : 'text-green-600'}`} />
              </div>
              <div>
                <h3 className={`font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Dados Reais
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Base de dados autêntica de processos industriais de fusão de aço carbono
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <TrendingUp className={`h-6 w-6 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className={`font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Otimização Contínua
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sistema de melhoria contínua com análise de sensibilidade em tempo real
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Applications */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <Factory className="h-6 w-6 mr-3 text-orange-500" />
          Aplicações na Indústria Metalúrgica
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center mb-4">
              <Shield className={`h-8 w-8 mr-3 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                Controle de Qualidade
              </h3>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Predição e otimização da qualidade do aço produzido, reduzindo defeitos e retrabalho
            </p>
          </div>

          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center mb-4">
              <Zap className={`h-8 w-8 mr-3 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                Eficiência Energética
              </h3>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Otimização de temperatura e tempo para reduzir consumo energético sem comprometer qualidade
            </p>
          </div>

          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center mb-4">
              <TrendingUp className={`h-8 w-8 mr-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                Produtividade
              </h3>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Aumento da produtividade através da otimização automática de parâmetros de processo
            </p>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <Award className="h-6 w-6 mr-3 text-purple-500" />
          Especificações Técnicas
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Parâmetros Otimizados
            </h3>
            <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                <strong>Temperatura:</strong> 1400°C - 1600°C
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                <strong>Tempo de Processo:</strong> 10 - 120 minutos
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                <strong>Pressão:</strong> 95 - 110 kPa
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                <strong>Velocidade de Rotação:</strong> 250 - 350 rpm
              </li>
            </ul>
          </div>

          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Algoritmos Implementados
            </h3>
            <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                <strong>Busca em Grade:</strong> Exploração sistemática
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                <strong>Algoritmo Genético:</strong> Evolução de soluções
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                <strong>Otimização Bayesiana:</strong> Busca inteligente
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                <strong>Análise de Sensibilidade:</strong> Impacto de parâmetros
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Future Prospects */}
      <div className={`${isDark ? 'bg-gradient-to-r from-green-900 to-blue-900' : 'bg-gradient-to-r from-green-600 to-blue-600'} rounded-xl p-8 text-white`}>
        <div className="text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-4">
            Protótipo para a Indústria Metalúrgica
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Este sistema representa um protótipo avançado que pode ser implementado em larga escala 
            na indústria metalúrgica, contribuindo para a modernização e digitalização dos processos produtivos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-sm opacity-80">Precisão do Modelo</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">+20</div>
              <div className="text-sm opacity-80">Unidades de Melhoria</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-sm opacity-80">Dados Reais</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact and Collaboration */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Oportunidades de Colaboração
          </h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6 max-w-3xl mx-auto`}>
            Este projeto está aberto para colaborações com empresas do setor metalúrgico, 
            centros de pesquisa e instituições acadêmicas interessadas em implementar 
            soluções de otimização baseadas em IA.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className={`px-6 py-3 rounded-lg ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
              <span className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                Implementação Industrial
              </span>
            </div>
            <div className={`px-6 py-3 rounded-lg ${isDark ? 'bg-green-900' : 'bg-green-100'}`}>
              <span className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                Pesquisa & Desenvolvimento
              </span>
            </div>
            <div className={`px-6 py-3 rounded-lg ${isDark ? 'bg-purple-900' : 'bg-purple-100'}`}>
              <span className={`text-sm font-medium ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                Consultoria Técnica
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};