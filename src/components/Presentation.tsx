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
  // Helpers de tema
  const textMain = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSub  = isDark ? 'text-gray-300' : 'text-gray-600';
  const textSoft = isDark ? 'text-gray-400' : 'text-gray-500';

  // Base premium de card
  const cardBase = `rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
    isDark ? 'bg-gray-900/60 border-gray-700' : 'bg-white/90 backdrop-blur border-gray-200'
  }`;

  // Gradientes premium por seção
  const gradBlue   = isDark ? 'from-blue-950/70 to-indigo-950/60'  : 'from-blue-600 to-indigo-600';
  const gradPanelB = isDark ? 'from-blue-950/60 to-gray-900/60 border-blue-900/40' : 'from-blue-50 to-white border-blue-200';
  const gradPanelV = isDark ? 'from-violet-950/60 to-gray-900/60 border-violet-900/40' : 'from-violet-50 to-white border-violet-200';
  const gradPanelG = isDark ? 'from-emerald-950/60 to-gray-900/60 border-emerald-900/40' : 'from-emerald-50 to-white border-emerald-200';
  const gradPanelN = isDark ? 'from-gray-900/70 to-gray-900/40 border-gray-700/80' : 'from-gray-50 to-white border-gray-200';

  // Ring helpers
  const ringBlue   = 'hover:ring-2 hover:ring-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50';
  const ringViolet = 'hover:ring-2 hover:ring-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400/50';
  const ringEmerald= 'hover:ring-2 hover:ring-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50';
  const ringIndigo = 'hover:ring-2 hover:ring-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/50';

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className={`rounded-2xl p-10 text-white bg-gradient-to-br ${gradBlue} border ${isDark ? 'border-indigo-900/40' : 'border-indigo-300/40'} shadow-lg`}>
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <img 
              src="/Metalyicscerta.png" 
              alt="MetaLytics" 
              className="mx-auto drop-shadow"
              style={{ height: "56px", width: "auto" }}
            />
          </div>

          <h1 className="text-4xl font-black tracking-tight mb-3">
            {t('systemOverview')}
          </h1>

          <p className="text-lg md:text-xl mb-6 opacity-90">
            {t('intelligentSystem')}
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <span className="px-4 py-2 rounded-full text-sm bg-white/15 backdrop-blur border border-white/20"> {t('artificialIntelligence')} </span>
            <span className="px-4 py-2 rounded-full text-sm bg-white/15 backdrop-blur border border-white/20"> {t('industry40')} </span>
            <span className="px-4 py-2 rounded-full text-sm bg-white/15 backdrop-blur border border-white/20"> {t('processOptimization')} </span>
          </div>
        </div>
      </div>

      {/* Authors Section */}
      <div className={`${cardBase} bg-gradient-to-br ${gradPanelN} ${ringBlue} p-8`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${textMain}`}>
          <Users className="h-6 w-6 mr-3 text-blue-500" />
          {t('teamDevelopment')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vitor */}
          <div className={`text-center p-6 rounded-xl border ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white/70 backdrop-blur border-gray-200'} ${ringBlue}`}>
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-blue-300/60 shadow">
              <img src="/vitor.png" alt="Vitor Lorenzo Cerutti" className="w-full h-full object-cover" />
            </div>
            <h3 className={`text-lg font-semibold mb-1 ${textMain}`}>
              {t('vitorLorenzo')}
            </h3>
            <p className={`text-sm ${textSub}`}>
              {t('principalDeveloper')}
            </p>
          </div>

          {/* Bernardo */}
          <div className={`text-center p-6 rounded-xl border ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white/70 backdrop-blur border-gray-200'} ${ringEmerald}`}>
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-emerald-300/60 shadow">
              <img src="/bernardo.png" alt="Bernardo Krauspenhar Paganin" className="w-full h-full object-cover" />
            </div>
            <h3 className={`text-lg font-semibold mb-1 ${textMain}`}>
              {t('bernardoKrauspenhar')}
            </h3>
            <p className={`text-sm ${textSub}`}>
              {t('dataAnalyst')}
            </p>
          </div>

          {/* Otávio */}
          <div className={`text-center p-6 rounded-xl border ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white/70 backdrop-blur border-gray-200'} ${ringViolet}`}>
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-violet-300/60 shadow">
              <img src="/otavio.png" alt="Otávio Susin Horn" className="w-full h-full object-cover" />
            </div>
            <h3 className={`text-lg font-semibold mb-1 ${textMain}`}>
              {t('otavioHorn')}
            </h3>
            <p className={`text-sm ${textSub}`}>
              {t('aiResearcher')}
            </p>
          </div>
        </div>
      </div>

      {/* Project Overview (2 colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna 1 – Sobre o Projeto */}
        <div className={`${cardBase} bg-gradient-to-br ${gradPanelB} ${ringBlue} p-8`}>
          <h2 className={`text-2xl font-bold mb-6 flex items-center ${textMain}`}>
            <Target className="h-6 w-6 mr-3 text-green-500" />
            Sobre o Projeto
          </h2>
          
          <div className="space-y-4">
            <p className={`${textSub} leading-relaxed`}>
              Este projeto foi desenvolvido com base em <strong>dados reais</strong> do processo de fusão de aço carbono, 
              fornecidos pelo <strong>Centro Tecnológico Randon</strong>, uma das principais referências em 
              tecnologia industrial no Brasil.
            </p>
            
            <p className={`${textSub} leading-relaxed`}>
              O sistema utiliza técnicas avançadas de <strong>Machine Learning</strong> e <strong>Inteligência Artificial</strong> 
              para otimizar parâmetros críticos do processo metalúrgico, resultando em maior qualidade do produto final 
              e redução de custos operacionais.
            </p>

            <div className={`p-4 rounded-xl border bg-gradient-to-br ${
              isDark ? 'from-blue-950/40 to-gray-900/40 border-blue-900/40' : 'from-blue-50 to-white border-blue-200'
            } ${ringBlue}`}>
              <div className="flex items-center mb-2">
                <Building2 className={`h-5 w-5 mr-2 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                <h3 className={`font-semibold ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                  Parceria Estratégica
                </h3>
              </div>

              <p className={`text-sm ${isDark ? 'text-blue-200/90' : 'text-blue-700/90'}`}>
                Dados fornecidos pelo Centro Tecnológico Randon, garantindo autenticidade e aplicabilidade real 
                dos algoritmos desenvolvidos.
              </p>

              {/* Logo do CTR */}
              <div className="flex justify-center mt-4">
                <img 
                  src="/logoCTR.svg"
                  alt="Logo Centro Tecnológico Randon"
                  className="h-20 w-auto opacity-90"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2 – Inovação e Tecnologia */}
        <div className={`${cardBase} bg-gradient-to-br ${gradPanelV} ${ringViolet} p-8`}>
          <h2 className={`text-2xl font-bold mb-6 flex items-center ${textMain}`}>
            <Lightbulb className="h-6 w-6 mr-3 text-yellow-500" />
            Inovação e Tecnologia
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                <Cpu className={`h-6 w-6 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
              </div>
              <div>
                <h3 className={`font-semibold mb-1 ${textMain}`}>
                  Algoritmos Inteligentes
                </h3>
                <p className={`text-sm ${textSub}`}>
                  Implementação de algoritmos de otimização bayesiana, genética e busca em grade
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
                <Database className={`h-6 w-6 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
              </div>
              <div>
                <h3 className={`font-semibold mb-1 ${textMain}`}>
                  Dados Reais
                </h3>
                <p className={`text-sm ${textSub}`}>
                  Base de dados autêntica de processos industriais de fusão de aço carbono
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <TrendingUp className={`h-6 w-6 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className={`font-semibold mb-1 ${textMain}`}>
                  Otimização Contínua
                </h3>
                <p className={`text-sm ${textSub}`}>
                  Sistema de melhoria contínua com análise de sensibilidade em tempo real
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Applications */}
      <div className={`${cardBase} bg-gradient-to-br ${gradPanelG} ${ringEmerald} p-8`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${textMain}`}>
          <Factory className="h-6 w-6 mr-3 text-orange-500" />
          Aplicações na Indústria Metalúrgica
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-900/40 border-emerald-900/30' : 'bg-white/70 backdrop-blur border-emerald-200'} ${ringEmerald}`}>
            <div className="flex items-center mb-3">
              <div className={`p-2 rounded-md ${isDark ? 'bg-emerald-900/40' : 'bg-emerald-100'}`}>
                <Shield className={`h-6 w-6 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
              </div>
              <h3 className={`font-semibold ml-3 ${textMain}`}>
                Controle de Qualidade
              </h3>
            </div>
            <p className={`text-sm ${textSub}`}>
              Predição e otimização da qualidade do aço produzido, reduzindo defeitos e retrabalho
            </p>
          </div>

          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-900/40 border-yellow-900/30' : 'bg-white/70 backdrop-blur border-yellow-200'} hover:ring-2 hover:ring-yellow-400/50 transition`}>
            <div className="flex items-center mb-3">
              <div className={`p-2 rounded-md ${isDark ? 'bg-yellow-900/40' : 'bg-yellow-100'}`}>
                <Zap className={`h-6 w-6 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`} />
              </div>
              <h3 className={`font-semibold ml-3 ${textMain}`}>
                Eficiência Energética
              </h3>
            </div>
            <p className={`text-sm ${textSub}`}>
              Otimização de temperatura e tempo para reduzir consumo energético sem comprometer qualidade
            </p>
          </div>

          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-900/40 border-blue-900/30' : 'bg-white/70 backdrop-blur border-blue-200'} ${ringBlue}`}>
            <div className="flex items-center mb-3">
              <div className={`p-2 rounded-md ${isDark ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                <TrendingUp className={`h-6 w-6 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
              </div>
              <h3 className={`font-semibold ml-3 ${textMain}`}>
                Produtividade
              </h3>
            </div>
            <p className={`text-sm ${textSub}`}>
              Aumento da produtividade através da otimização automática de parâmetros de processo
            </p>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className={`${cardBase} bg-gradient-to-br ${gradPanelV} ${ringViolet} p-8`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${textMain}`}>
          <Award className="h-6 w-6 mr-3 text-purple-500" />
          Especificações Técnicas
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${textMain}`}>
              Parâmetros Otimizados
            </h3>
            <ul className={`space-y-2 ${textSub}`}>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                <strong>Temperatura:</strong>&nbsp;1400°C - 1600°C
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                <strong>Tempo de Processo:</strong>&nbsp;10 - 120 minutos
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                <strong>Pressão:</strong>&nbsp;95 - 110 kPa
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                <strong>Velocidade de Rotação:</strong>&nbsp;250 - 350 rpm
              </li>
            </ul>
          </div>

          <div>
            <h3 className={`text-lg font-semibold mb-4 ${textMain}`}>
              Algoritmos Implementados
            </h3>
            <ul className={`space-y-2 ${textSub}`}>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-rose-500 rounded-full mr-3"></span>
                <strong>Busca em Grade:</strong>&nbsp;Exploração sistemática
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                <strong>Algoritmo Genético:</strong>&nbsp;Evolução de soluções
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                <strong>Otimização Bayesiana:</strong>&nbsp;Busca inteligente
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                <strong>Análise de Sensibilidade:</strong>&nbsp;Impacto de parâmetros
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Future Prospects */}
      <div className={`rounded-2xl p-10 text-white bg-gradient-to-r ${isDark ? 'from-emerald-950 to-blue-950' : 'from-emerald-600 to-blue-600'} border ${isDark ? 'border-emerald-900/40' : 'border-emerald-300/40'} shadow-lg`}>
        <div className="text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-3">
            Protótipo para a Indústria Metalúrgica
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Este sistema representa um protótipo avançado que pode ser implementado em larga escala 
            na indústria metalúrgica, contribuindo para a modernização e digitalização dos processos produtivos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-black mb-1">98%</div>
              <div className="text-sm opacity-80">Precisão do Modelo</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black mb-1">+20</div>
              <div className="text-sm opacity-80">Unidades de Melhoria</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black mb-1">100%</div>
              <div className="text-sm opacity-80">Dados Reais</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact and Collaboration */}
      <div className={`${cardBase} bg-gradient-to-br ${gradPanelN} ${ringIndigo} p-8`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-3 ${textMain}`}>
            Oportunidades de Colaboração
          </h2>
          <p className={`${textSub} mb-6 max-w-3xl mx-auto`}>
            Este projeto está aberto para colaborações com empresas do setor metalúrgico, 
            centros de pesquisa e instituições acadêmicas interessadas em implementar 
            soluções de otimização baseadas em IA.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <div className={`px-6 py-3 rounded-lg border ${isDark ? 'bg-blue-900/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'} ${ringBlue}`}>
              <span className={`text-sm font-medium ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                Implementação Industrial
              </span>
            </div>
            <div className={`px-6 py-3 rounded-lg border ${isDark ? 'bg-emerald-900/40 border-emerald-800/50' : 'bg-emerald-50 border-emerald-200'} ${ringEmerald}`}>
              <span className={`text-sm font-medium ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
                Pesquisa & Desenvolvimento
              </span>
            </div>
            <div className={`px-6 py-3 rounded-lg border ${isDark ? 'bg-violet-900/40 border-violet-800/50' : 'bg-violet-50 border-violet-200'} ${ringViolet}`}>
              <span className={`text-sm font-medium ${isDark ? 'text-violet-200' : 'text-violet-800'}`}>
                Consultoria Técnica
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

