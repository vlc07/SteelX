// src/components/Header.tsx
import React from 'react';
import {
  Menu,
  Moon,
  Sun,
  Globe,
  ChevronDown,
  Check,
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
}) => {
  const [showLanguageMenu, setShowLanguageMenu] = React.useState(false);

  // Cores premium
  const wrapBg = isDark
    ? 'bg-gradient-to-b from-slate-900/90 to-slate-800/80 border-slate-800'
    : 'bg-gradient-to-b from-white/90 to-blue-50/70 border-blue-200/70';

  const iconBtnBase =
    'p-2 rounded-lg transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0';
  const iconBtnTone = isDark
    ? 'text-gray-200 hover:bg-slate-800/70 ring-emerald-400/30'
    : 'text-gray-700 hover:bg-white/70 ring-blue-400/40';

  const pillBtnBase =
    'flex items-center gap-2 px-3 py-2 rounded-lg transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0';
  const pillBtnTone = isDark
    ? 'text-gray-200 hover:bg-slate-800/70 ring-blue-400/30'
    : 'text-gray-700 hover:bg-white/70 ring-blue-500/40';

  return (
    <header
      className={[
        'sticky top-0 z-50',
        'backdrop-blur supports-[backdrop-filter]:backdrop-blur',
        'border-b',
        wrapBg,
      ].join(' ')}
    >
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Esquerda: menu + logo */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir menu"
              onClick={onMenuToggle}
              className={`${iconBtnBase} ${iconBtnTone} lg:hidden`}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo com efeito premium */}
            <img
              src="/Metalyicscerta.png"
              alt="MetaLytics"
              className="block transition duration-300 hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]"
              style={{ height: '22px', width: 'auto' }}
            />
          </div>

          {/* Direita: idioma + tema */}
          <div className="relative flex items-center gap-2">
            {/* Seletor de idioma */}
            <div className="relative">
              <button
                aria-haspopup="menu"
                aria-expanded={showLanguageMenu}
                onClick={() => setShowLanguageMenu((s) => !s)}
                className={`${pillBtnBase} ${pillBtnTone}`}
              >
                <Globe className="h-4 w-4 opacity-90" />
                <span className="text-sm">
                  {languages.find((l) => l.code === language)?.flag}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-75" />
              </button>

              {showLanguageMenu && (
                <div
                  className={[
                    'absolute right-0 mt-2 w-48 rounded-xl border overflow-hidden z-50',
                    isDark
                      ? 'bg-slate-900/95 border-slate-800 shadow-[0_8px_28px_rgba(0,0,0,.55)]'
                      : 'bg-white/95 border-blue-100 shadow-[0_10px_30px_rgba(2,6,23,.08)]',
                    'backdrop-blur-xl',
                  ].join(' ')}
                >
                  {languages.map((lang) => {
                    const active = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setShowLanguageMenu(false);
                        }}
                        className={[
                          'w-full text-left px-3.5 py-2 text-sm flex items-center justify-between',
                          active
                            ? isDark
                              ? 'bg-blue-600/20 text-blue-200'
                              : 'bg-blue-50 text-blue-700'
                            : isDark
                              ? 'text-gray-200 hover:bg-slate-800/70'
                              : 'text-gray-800 hover:bg-blue-50/70',
                        ].join(' ')}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base leading-none">
                            {lang.flag}
                          </span>
                          <span>{lang.name}</span>
                        </span>
                        {active && (
                          <Check
                            className={
                              isDark
                                ? 'h-4 w-4 text-blue-300'
                                : 'h-4 w-4 text-blue-600'
                            }
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Toggle de tema */}
            <button
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              onClick={onThemeToggle}
              className={`${iconBtnBase} ${iconBtnTone}`}
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
