// src/components/Sidebar.tsx
import React from 'react';
import {
  Monitor, // Apresentação
  BarChart3, // Simulação
  GitBranch, // Comparação
  Settings,  // Otimização
  ClipboardCheck, // Resultados
  HelpCircle, // Ajuda
  BookOpen, // Glossário
  FileText // Documentação Técnica
} from 'lucide-react';

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  t: (k: string) => string;
  isDark: boolean;
};

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  t,
  isDark,
}) => {
  // Mapa de itens na ordem pedida
  const items: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
  }> = [
    { key: 'presentation', label: t('presentation') || 'Apresentação', icon: <Monitor className="h-5 w-5" /> },
    { key: 'simulation', label: 'Simulação', icon: <BarChart3 className="h-5 w-5" /> },
    { key: 'comparison', label: t('comparison') || 'Comparação', icon: <GitBranch className="h-5 w-5" /> },
    { key: 'optimization', label: t('optimization') || 'Otimização', icon: <Settings className="h-5 w-5" /> },
    { key: 'results', label: t('results') || 'Resultados', icon: <ClipboardCheck className="h-5 w-5" /> },
    { key: 'help', label: t('help') || 'Ajuda', icon: <HelpCircle className="h-5 w-5" /> },
    { key: 'glossary', label: t('glossary') || 'Glossário', icon: <BookOpen className="h-5 w-5" /> },
    { key: 'technical-docs', label: t('technicalDocs') || 'Documentação Técnica', icon: <FileText className="h-5 w-5" /> },
  ];

  // Estilos base
  const bg = isDark ? 'bg-gray-900' : 'bg-white';
  const border = isDark ? 'border-gray-800' : 'border-gray-200';
  const textMuted = isDark ? 'text-gray-300' : 'text-gray-700';

  const ItemButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ isActive, onClick, icon, children }) => (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition',
        isActive
          ? // destaque do item ativo (premium, levemente “neon”)
            (isDark
              ? 'bg-blue-600/25 text-white ring-1 ring-inset ring-blue-500/40 shadow-[0_0_0_1px_rgba(59,130,246,.15)]'
              : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200')
          : (isDark
              ? 'text-gray-300 hover:bg-gray-800'
              : 'text-gray-700 hover:bg-gray-100'),
      ].join(' ')}
    >
      <span className={isActive ? (isDark ? 'text-blue-300' : 'text-blue-600') : textMuted}>
        {icon}
      </span>
      <span className="text-sm font-medium truncate">{children}</span>
    </button>
  );

  // Sidebar (desktop + mobile)
  return (
    <>
      {/* Overlay mobile */}
      <div
        className={[
          'fixed inset-0 z-30 lg:hidden transition',
          isOpen ? 'bg-black/40 backdrop-blur-[1px] opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={[
          'fixed z-40 top-0 left-0 h-full w-72 border-r px-3 py-4 lg:static lg:translate-x-0 lg:w-64',
          bg, border,
          'transition-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo / título */}
        <div className="px-2 py-2 mb-2">
          <div className="text-lg font-bold tracking-tight">
            <span className={isDark ? 'text-white' : 'text-gray-900'}>Menu</span>
          </div>
        </div>

        {/* Lista de itens */}
        <nav className="mt-2 space-y-1.5">
          {items.map((item) => (
            <ItemButton
              key={item.key}
              isActive={activeTab === item.key}
              onClick={() => {
                onTabChange(item.key);
                onClose();
              }}
              icon={item.icon}
            >
              {item.label}
            </ItemButton>
          ))}
        </nav>

        {/* Rodapé opcional */}
        <div className="mt-auto hidden lg:block" />
      </aside>
    </>
  );
};

export default Sidebar;
