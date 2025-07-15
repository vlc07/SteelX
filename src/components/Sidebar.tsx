import React from 'react';
import { 
  Home, 
  BarChart3, 
  GitCompare, 
  Settings, 
  FileText, 
  HelpCircle, 
  BookOpen,
  Presentation,
  FileCode,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
  isDark: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  isOpen, 
  onClose, 
  t,
  isDark 
}) => {
  const menuItems = [
    { id: 'presentation', icon: Presentation, label: t('presentation'), tourId: 'presentation-tab' },
    { id: 'dashboard', icon: Home, label: t('dashboard'), tourId: 'dashboard-tab' },
    { id: 'simulation', icon: BarChart3, label: t('simulation'), tourId: 'simulation-tab' },
    { id: 'comparison', icon: GitCompare, label: t('comparison'), tourId: 'comparison-tab' },
    { id: 'optimization', icon: Settings, label: t('optimization'), tourId: 'optimization-tab' },
    { id: 'results', icon: FileText, label: t('results'), tourId: 'results-tab' },
    { id: 'help', icon: HelpCircle, label: t('help'), tourId: 'help-tab' },
    { id: 'glossary', icon: BookOpen, label: t('glossary'), tourId: 'glossary-tab' },
    { id: 'technical-docs', icon: FileCode, label: t('technicalDocs'), tourId: 'technical-docs-tab' }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        border-r shadow-lg
      `}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Menu
            </h2>
            <button
              onClick={onClose}
              className={`lg:hidden p-1 rounded ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors
                    ${isActive 
                      ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700')
                      : (isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100')
                    }
                  `}
                  data-tour={item.tourId}
                >
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};