import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Cpu,
  BarChart3,
  Settings,
  Zap,
  Target,
  GitBranch,
  Brain,
  TrendingUp,
  Search,
  Code,
  Database,
  Activity,
  ChevronRight,
} from 'lucide-react';

interface TechnicalDocsProps {
  t: (key: string) => string;
  isDark: boolean;
}

type Section = {
  id: string;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const TechnicalDocs: React.FC<TechnicalDocsProps> = ({ t, isDark }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [query, setQuery] = useState('');

  const sections: Section[] = useMemo(
    () => [
      { id: 'overview',       title: 'Visão Geral do Sistema',       icon: BookOpen },
      { id: 'algorithms',     title: 'Algoritmos de Otimização',     icon: Brain },
      { id: 'sensitivity',    title: 'Análise de Sensibilidade',     icon: BarChart3 },
      { id: 'simulation',     title: 'Sistema de Simulação',         icon: Activity },
      { id: 'ml-models',      title: 'Modelos de Machine Learning',  icon: Cpu },
      { id: 'implementation', title: 'Detalhes de Implementação',    icon: Code },
    ],
    []
  );

  // ===== helpers de tema / estilo premium
  const titleColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const subColor   = isDark ? 'text-slate-300' : 'text-slate-600';
  const hairColor  = isDark ? 'text-slate-400' : 'text-slate-500';

  const shell = `rounded-2xl border bg-gradient-to-br ${
    isDark ? 'from-slate-900 to-slate-800 border-slate-700' : 'from-white to-slate-50 border-slate-200'
  } shadow-sm transition-all`;

  const headerGrad = `rounded-2xl border bg-gradient-to-br ${
    isDark
      ? 'from-blue-950/70 via-indigo-900/60 to-slate-900/70 border-indigo-900/40'
      : 'from-blue-50 via-indigo-50 to-white border-indigo-200'
  }`;

  const sidebarShell = `rounded-2xl border ${
    isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-slate-200'
  } p-4`;

  const navBtn = (active: boolean) =>
    `w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm border ${
      active
        ? isDark
          ? 'bg-indigo-900/60 border-indigo-700 text-indigo-200 shadow-inner'
          : 'bg-indigo-50 border-indigo-200 text-indigo-800'
        : isDark
          ? 'bg-transparent border-transparent text-slate-300 hover:bg-slate-800 hover:border-slate-700'
          : 'bg-transparent border-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-200'
    }`;

  const contentShell = `rounded-2xl border ${
    isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-slate-200'
  } p-6`;

  const sectionCard = (tone: 'blue' | 'green' | 'violet' | 'yellow' | 'purple' | 'red' | 'slate' = 'slate') => {
    const map = {
      blue:   isDark ? 'from-blue-950/50 to-slate-900/50 border-blue-900/30'   : 'from-blue-50 to-white border-blue-200',
      green:  isDark ? 'from-emerald-950/50 to-slate-900/50 border-emerald-900/30' : 'from-emerald-50 to-white border-emerald-200',
      violet: isDark ? 'from-violet-950/50 to-slate-900/50 border-violet-900/30' : 'from-violet-50 to-white border-violet-200',
      yellow: isDark ? 'from-amber-950/40 to-slate-900/50 border-amber-900/30' : 'from-amber-50 to-white border-amber-200',
      purple: isDark ? 'from-purple-950/50 to-slate-900/50 border-purple-900/30' : 'from-purple-50 to-white border-purple-200',
      red:    isDark ? 'from-rose-950/50 to-slate-900/50 border-rose-900/30'   : 'from-rose-50 to-white border-rose-200',
      slate:  isDark ? 'from-slate-800 to-slate-900 border-slate-700'          : 'from-white to-slate-50 border-slate-200',
    };
    return `rounded-2xl border bg-gradient-to-br ${map[tone]} p-5 hover:-translate-y-0.5 hover:shadow-xl transition`;
  };

  // ===== filtro rápido (apenas interface, filtra títulos/trechos por query)
  const q = query.trim().toLowerCase();
  const matchText = (text: string) => (q ? text.toLowerCase().includes(q) : true);

  return (
    <div className="space-y-6">
      {/* Cabeçalho Premium */}
      <div className={`${headerGrad} p-6`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`${isDark ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-700'} p-2.5 rounded-xl`}>
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${titleColor}`}>Documentação Técnica</h2>
              <p className={`text-sm ${subColor}`}>
                Arquitetura, modelos e métodos de otimização do projeto. Use a navegação lateral
                ou a busca rápida para ir direto ao ponto.
              </p>
            </div>
          </div>

          {/* Busca local */}
          <div className="relative w-full sm:w-96">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Buscar nesta documentação…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-2
                ${isDark
                  ? 'bg-slate-900/70 border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-indigo-500/40'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-indigo-300'}`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de navegação */}
        <aside className={sidebarShell}>
          <h3 className={`font-semibold mb-3 ${titleColor}`}>Seções</h3>
          <nav className="space-y-2">
            {sections.map((s) => {
              const Icon = s.icon;
              // esconder seção no menu se query não bate no título
              const visible = matchText(s.title);
              if (!visible) return null;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={navBtn(activeSection === s.id)}
                  title={s.title}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{s.title}</span>
                  <ChevronRight
                    className={`ml-auto h-4 w-4 ${
                      activeSection === s.id ? 'opacity-90' : 'opacity-40'
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Área de conteúdo */}
        <section className="lg:col-span-3">
          <div className={contentShell}>
            {/* ====== OVERVIEW ====== */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <h3 className={`text-xl font-bold ${titleColor}`}>Visão Geral do Sistema</h3>

                <div className="space-y-4">
                  <p className={`${subColor} leading-relaxed`}>
                    O Metalyics Software é um sistema inteligente de otimização de processos
                    metalúrgicos que utiliza técnicas avançadas de Machine Learning e algoritmos
                    de otimização para maximizar a qualidade do aço carbono produzido.
                  </p>

                  <div className={sectionCard('blue')}>
                    <h4 className={`font-semibold mb-2 ${titleColor}`}>Arquitetura do Sistema</h4>
                    <ul className={`space-y-1 text-sm ${subColor}`}>
                      <li>• <strong>Frontend:</strong> React + TypeScript + Tailwind CSS</li>
                      <li>• <strong>Visualização:</strong> Chart.js para gráficos interativos</li>
                      <li>• <strong>Algoritmos:</strong> Implementação nativa de otimização</li>
                      <li>• <strong>Dados:</strong> Baseado em dados reais do Centro Tecnológico Randon</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={sectionCard('slate')}>
                      <div className="flex items-center mb-2">
                        <Target className={`h-5 w-5 mr-2 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                        <h4 className={`font-semibold ${titleColor}`}>Objetivo Principal</h4>
                      </div>
                      <p className={`text-sm ${subColor}`}>
                        Otimizar parâmetros de processo (temperatura, tempo, pressão, velocidade)
                        para maximizar a qualidade do aço carbono produzido.
                      </p>
                    </div>

                    <div className={sectionCard('slate')}>
                      <div className="flex items-center mb-2">
                        <Database className={`h-5 w-5 mr-2 ${isDark ? 'text-violet-300' : 'text-violet-600'}`} />
                        <h4 className={`font-semibold ${titleColor}`}>Base de Dados</h4>
                      </div>
                      <p className={`text-sm ${subColor}`}>
                        Dados reais de processos de fusão de aço carbono fornecidos pelo
                        Centro Tecnológico Randon.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ====== ALGORITHMS ====== */}
            {activeSection === 'algorithms' && (
              <div className="space-y-6">
                <h3 className={`text-xl font-bold ${titleColor}`}>Algoritmos de Otimização</h3>

                <div className="space-y-6">
                  {/* Grid Search */}
                  <div className={sectionCard('slate')}>
                    <h4 className={`font-semibold mb-3 flex items-center ${titleColor}`}>
                      <Search className="h-5 w-5 mr-2 text-blue-500" />
                      Busca em Grade (Grid Search)
                    </h4>
                    <p className={`mb-3 ${subColor}`}>
                      Método sistemático que testa todas as combinações possíveis de parâmetros dentro das faixas definidas.
                    </p>
                    <div className={`${shell} p-3`}>
                      <h5 className={`font-medium mb-2 ${titleColor}`}>Como Funciona</h5>
                      <ul className={`text-sm space-y-1 ${subColor}`}>
                        <li>1. Define faixas para cada parâmetro (min, max, step)</li>
                        <li>2. Gera todas as combinações possíveis</li>
                        <li>3. Avalia cada combinação usando o modelo preditivo</li>
                        <li>4. Retorna a combinação com maior qualidade prevista</li>
                      </ul>
                    </div>
                    <div className={sectionCard('green') + ' mt-3'}>
                      <h5 className={`font-medium mb-1 ${titleColor}`}>Vantagens</h5>
                      <p className={`text-sm ${subColor}`}>
                        Garante encontrar o ótimo global dentro das faixas definidas. Simples de implementar e entender.
                      </p>
                    </div>
                  </div>

                  {/* Algoritmo Genético */}
                  <div className={sectionCard('slate')}>
                    <h4 className={`font-semibold mb-3 flex items-center ${titleColor}`}>
                      <GitBranch className="h-5 w-5 mr-2 text-emerald-500" />
                      Algoritmo Genético
                    </h4>
                    <p className={`mb-3 ${subColor}`}>
                      Inspirado na evolução natural, este algoritmo evolui uma população de soluções através de gerações.
                    </p>
                    <div className={`${shell} p-3`}>
                      <h5 className={`font-medium mb-2 ${titleColor}`}>Processo Evolutivo</h5>
                      <ul className={`text-sm space-y-1 ${subColor}`}>
                        <li>1. <strong>Inicialização:</strong> População inicial aleatória</li>
                        <li>2. <strong>Avaliação:</strong> Calcula fitness (qualidade)</li>
                        <li>3. <strong>Seleção:</strong> Escolhe os melhores para reprodução</li>
                        <li>4. <strong>Crossover:</strong> Combina características dos pais</li>
                        <li>5. <strong>Mutação:</strong> Introduz variações aleatórias</li>
                        <li>6. <strong>Repetição:</strong> Evolui por várias gerações</li>
                      </ul>
                    </div>
                    <div className={sectionCard('yellow') + ' mt-3'}>
                      <h5 className={`font-medium mb-1 ${titleColor}`}>Características</h5>
                      <p className={`text-sm ${subColor}`}>
                        Eficiente para espaços de busca complexos. Pode escapar de ótimos locais via diversidade populacional.
                      </p>
                    </div>
                  </div>

                  {/* Otimização Bayesiana */}
                  <div className={sectionCard('slate')}>
                    <h4 className={`font-semibold mb-3 flex items-center ${titleColor}`}>
                      <Brain className="h-5 w-5 mr-2 text-purple-500" />
                      Otimização Bayesiana
                    </h4>
                    <p className={`mb-3 ${subColor}`}>
                      Método inteligente que usa probabilidades para guiar a busca de forma eficiente.
                    </p>
                    <div className={`${shell} p-3`}>
                      <h5 className={`font-medium mb-2 ${titleColor}`}>Estratégia Inteligente</h5>
                      <ul className={`text-sm space-y-1 ${subColor}`}>
                        <li>1. <strong>Modelo Surrogate:</strong> Modelo probabilístico da função objetivo</li>
                        <li>2. <strong>Função de Aquisição:</strong> Decide onde testar o próximo ponto</li>
                        <li>3. <strong>Balanceamento:</strong> Exploração vs. exploração</li>
                        <li>4. <strong>Atualização:</strong> Refina o modelo com novos dados</li>
                      </ul>
                    </div>
                    <div className={sectionCard('purple') + ' mt-3'}>
                      <h5 className={`font-medium mb-1 ${titleColor}`}>Eficiência</h5>
                      <p className={`text-sm ${subColor}`}>
                        Requer menos avaliações. Ideal quando cada avaliação é custosa computacionalmente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* ====== SENSITIVITY ====== */}
            {activeSection === 'sensitivity' && (
              <div className="space-y-6">
                <h3 className={`text-xl font-bold ${titleColor}`}>Análise de Sensibilidade</h3>

                <div className="space-y-4">
                  <p className={`${subColor} leading-relaxed`}>
                    A análise de sensibilidade determina como cada parâmetro individual afeta a
                    qualidade do produto final, mantendo os outros constantes.
                  </p>

                  <div className={sectionCard('blue')}>
                    <h4 className={`font-semibold mb-3 ${titleColor}`}>Metodologia Implementada</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className={`font-medium ${titleColor}`}>1. Análise Univariada</h5>
                        <p className={`text-sm ${subColor}`}>
                          Varia um parâmetro por vez dentro de sua faixa operacional, mantendo os demais fixos.
                        </p>
                      </div>
                      <div>
                        <h5 className={`font-medium ${titleColor}`}>2. Geração de Curvas</h5>
                        <p className={`text-sm ${subColor}`}>
                          Para cada parâmetro, gera uma curva mostrando a variação de qualidade.
                        </p>
                      </div>
                      <div>
                        <h5 className={`font-medium ${titleColor}`}>3. Cálculo de Impacto</h5>
                        <p className={`text-sm ${subColor}`}>
                          Calcula Δ de qualidade para identificar o parâmetro de maior influência.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={sectionCard('slate')}>
                      <h4 className={`font-semibold mb-2 ${titleColor}`}>Parâmetros Analisados</h4>
                      <ul className={`text-sm space-y-1 ${subColor}`}>
                        <li>• <strong>Temperatura:</strong> 1430–1530 °C (step: 10 °C)</li>
                        <li>• <strong>Tempo:</strong> 20–100 min (step: 10 min)</li>
                        <li>• <strong>Pressão:</strong> 98–105 kPa (step: 0,5 kPa)</li>
                        <li>• <strong>Velocidade:</strong> 270–330 rpm (step: 5 rpm)</li>
                      </ul>
                    </div>

                    <div className={sectionCard('slate')}>
                      <h4 className={`font-semibold mb-2 ${titleColor}`}>Interpretação dos Resultados</h4>
                      <ul className={`text-sm space-y-1 ${subColor}`}>
                        <li>• <strong>Δ Alto:</strong> Parâmetro muito sensível</li>
                        <li>• <strong>Δ Médio:</strong> Influência moderada</li>
                        <li>• <strong>Δ Baixo:</strong> Pouca influência</li>
                        <li>• <strong>Curva Linear:</strong> Relação proporcional</li>
                        <li>• <strong>Curva Não-linear:</strong> Ótimos localizados</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ====== SIMULATION ====== */}
            {activeSection === 'simulation' && (
              <div className="space-y-6">
                <h3 className={`text-xl font-bold ${titleColor}`}>Sistema de Simulação</h3>

                <div className="space-y-4">
                  <p className={`${subColor} leading-relaxed`}>
                    O sistema de simulação permite testar diferentes cenários de processo antes da
                    implementação real, reduzindo riscos e custos operacionais.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={sectionCard('green')}>
                      <h4 className={`font-semibold mb-2 flex items-center ${titleColor}`}>
                        <Target className="h-4 w-4 mr-2" />
                        Simulação Única
                      </h4>
                      <p className={`text-sm ${subColor}`}>
                        Testa um conjunto específico de parâmetros e retorna a qualidade prevista.
                      </p>
                    </div>

                    <div className={sectionCard('blue')}>
                      <h4 className={`font-semibold mb-2 flex items-center ${titleColor}`}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Simulação em Lote
                      </h4>
                      <p className={`text-sm ${subColor}`}>
                        Executa múltiplas simulações com variações aleatórias para análise estatística.
                      </p>
                    </div>

                    <div className={sectionCard('purple')}>
                      <h4 className={`font-semibold mb-2 flex items-center ${titleColor}`}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Análise de Sensibilidade
                      </h4>
                      <p className={`text-sm ${subColor}`}>
                        Examina sistematicamente o impacto de cada parâmetro na qualidade final.
                      </p>
                    </div>
                  </div>

                  <div className={sectionCard('slate')}>
                    <h4 className={`font-semibold mb-3 ${titleColor}`}>Modelo Matemático Implementado</h4>
                    <div className={`${shell} p-3`}>
                      <code className={`text-sm ${subColor}`}>
                        Qualidade = 350 + (Temperatura − 1450) × 0.1 + (Tempo − 30) × 0.2 + (Pressão − 101) × 2
                        + (Velocidade − 300) × 0.05 + Ruído
                      </code>
                    </div>
                    <p className={`text-sm mt-2 ${subColor}`}>
                      Calibrado com dados reais fornecidos pelo Centro Tecnológico Randon, com ruído para simular variabilidade de processo.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ====== ML MODELS ====== */}
            {activeSection === 'ml-models' && (
              <div className="space-y-6">
                <h3 className={`text-xl font-bold ${titleColor}`}>Modelos de Machine Learning</h3>

                <div className="space-y-4">
                  <p className={`${subColor} leading-relaxed`}>
                    O sistema utiliza modelos preditivos treinados com dados reais para estimar a
                    qualidade do aço carbono a partir dos parâmetros de processo.
                  </p>

                  <div className={sectionCard('blue')}>
                    <h4 className={`font-semibold mb-3 ${titleColor}`}>Arquitetura do Modelo</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className={`font-medium ${titleColor}`}>Entrada (Features)</h5>
                        <p className={`text-sm ${subColor}`}>Temperatura (°C), Tempo (min), Pressão (kPa), Velocidade (rpm)</p>
                      </div>
                      <div>
                        <h5 className={`font-medium ${titleColor}`}>Saída (Target)</h5>
                        <p className={`text-sm ${subColor}`}>Qualidade do aço carbono (valor contínuo)</p>
                      </div>
                      <div>
                        <h5 className={`font-medium ${titleColor}`}>Tipo de Problema</h5>
                        <p className={`text-sm ${subColor}`}>Regressão supervisionada</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={sectionCard('slate')}>
                      <h4 className={`font-semibold mb-2 ${titleColor}`}>Métricas de Performance</h4>
                      <ul className={`text-sm space-y-1 ${subColor}`}>
                        <li>• <strong>R² Score:</strong> 0.98 (98% de precisão)</li>
                        <li>• <strong>MAE:</strong> 1.2 unidades</li>
                        <li>• <strong>MSE:</strong> 2.5</li>
                        <li>• <strong>Validação:</strong> Cross-validation 5-fold</li>
                      </ul>
                    </div>

                    <div className={sectionCard('slate')}>
                      <h4 className={`font-semibold mb-2 ${titleColor}`}>Importância das Features</h4>
                      <ul className={`text-sm space-y-1 ${subColor}`}>
                        <li>• Temperatura: 45%</li>
                        <li>• Tempo: 30%</li>
                        <li>• Pressão: 15%</li>
                        <li>• Velocidade: 10%</li>
                      </ul>
                    </div>
                  </div>

                  <div className={sectionCard('yellow')}>
                    <h4 className={`font-semibold mb-2 ${titleColor}`}>Processo de Treinamento</h4>
                    <ol className={`text-sm space-y-1 ${subColor}`}>
                      <li>1. Coleta de Dados (CTR)</li>
                      <li>2. Pré-processamento e limpeza</li>
                      <li>3. Split 80/20 (treino/teste)</li>
                      <li>4. Treinamento de regressão</li>
                      <li>5. Validação (CV + métricas)</li>
                      <li>6. Disponibilização para predição</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* ====== IMPLEMENTATION ====== */}
            {activeSection === 'implementation' && (
              <div className="space-y-6">
                <h3 className={`text-xl font-bold ${titleColor}`}>Detalhes de Implementação</h3>

                <div className="space-y-4">
                  <p className={`${subColor} leading-relaxed`}>
                    Tecnologias utilizadas, arquitetura de software e considerações de performance.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={sectionCard('slate')}>
                      <h4 className={`font-semibold mb-2 ${titleColor}`}>Stack Tecnológico</h4>
                      <ul className={`text-sm space-y-1 ${subColor}`}>
                        <li>• <strong>Frontend:</strong> React 18 + TypeScript</li>
                        <li>• <strong>Styling:</strong> Tailwind CSS</li>
                        <li>• <strong>Charts:</strong> Chart.js + react-chartjs-2</li>
                        <li>• <strong>Icons:</strong> Lucide React</li>
                        <li>• <strong>Build:</strong> Vite</li>
                      </ul>
                    </div>

                    <div className={sectionCard('slate')}>
                      <h4 className={`font-semibold mb-2 ${titleColor}`}>Arquitetura de Componentes</h4>
                      <ul className={`text-sm space-y-1 ${subColor}`}>
                        <li>• Modular e reutilizável</li>
                        <li>• Hooks para estado</li>
                        <li>• Responsivo (mobile-first)</li>
                        <li>• Acessibilidade (ARIA)</li>
                        <li>• Performance (lazy loading)</li>
                      </ul>
                    </div>
                  </div>

                  <div className={sectionCard('green')}>
                    <h4 className={`font-semibold mb-3 ${titleColor}`}>Algoritmos Implementados em JavaScript</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className={`font-medium ${titleColor}`}>Grid Search</h5>
                        <p className={`text-sm ${subColor}`}>Loops aninhados para exploração sistemática do espaço de parâmetros.</p>
                      </div>
                      <div>
                        <h5 className={`font-medium ${titleColor}`}>Algoritmo Genético</h5>
                        <p className={`text-sm ${subColor}`}>Seleção, crossover e mutação implementados do zero.</p>
                      </div>
                      <div>
                        <h5 className={`font-medium ${titleColor}`}>Otimização Bayesiana</h5>
                        <p className={`text-sm ${subColor}`}>Surrogate + função de aquisição para busca eficiente.</p>
                      </div>
                    </div>
                  </div>

                  <div className={sectionCard('purple')}>
                    <h4 className={`font-semibold mb-3 ${titleColor}`}>Considerações de Performance</h4>
                    <ul className={`text-sm space-y-1 ${subColor}`}>
                      <li>• Web Workers para cálculos pesados</li>
                      <li>• Memoização de simulações</li>
                      <li>• Debouncing em entradas</li>
                      <li>• Lazy loading de componentes</li>
                      <li>• Virtualização de listas grandes</li>
                    </ul>
                  </div>

                  <div className={sectionCard('red')}>
                    <h4 className={`font-semibold mb-3 ${titleColor}`}>Limitações e Futuras Melhorias</h4>
                    <ul className={`text-sm space-y-1 ${subColor}`}>
                      <li>• Modelo educacional (não industrial)</li>
                      <li>• Dados simulados a partir de padrões reais</li>
                      <li>• Escalabilidade para datasets maiores</li>
                      <li>• ML avançado (TensorFlow.js)</li>
                      <li>• Backend para processamento server-side</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
