import React from 'react';
import { 
  Calculator, 
  Menu, 
  Moon, 
  Sun, 
  Globe,
  ChevronDown
} from 'lucide-react';
import { languages } from '../utils/translations';

interface HeaderProps {
  onMenuToggle: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  t: (key: string) => string;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  isDark,
  onThemeToggle,
  language,
  onLanguageChange,
  t
}) => {
  const [showLanguageMenu, setShowLanguageMenu] = React.useState(false);

  return (
    <header className={`
      ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
      border-b shadow-sm
    `}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuToggle}
              className={`lg:hidden p-2 rounded-md ${
                isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              
              <img 
             src="/Metalyicscerta.png" 
             alt="MetaLytics" 
             className="mx-auto"
             style={{ height: "20px", width: "auto" }}
          
             />
              
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-md transition-colors
                  ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}
                `}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm">
                  {languages.find(l => l.code === language)?.flag}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showLanguageMenu && (
                <div className={`
                  absolute right-0 mt-2 w-40 rounded-md shadow-lg z-50
                  ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                  border
                `}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      className={`
                        w-full text-left px-4 py-2 text-sm flex items-center space-x-2
                        ${language === lang.code 
                          ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700')
                          : (isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                        }
                        first:rounded-t-md last:rounded-b-md
                      `}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className={`
                p-2 rounded-md transition-colors
                ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}
              `}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};