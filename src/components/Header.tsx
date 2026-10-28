import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { UserProfile, SupportedLanguage, MainSectionType } from '../types';
import { PlusCircle, User, Globe, Shield, LogIn, Car, Briefcase, Hammer, UserCheck, Sparkles, LayoutGrid } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenCreateAd: () => void;
  onOpenAdmin: () => void;
  activeSection: MainSectionType;
  onSelectSection: (section: MainSectionType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenCreateAd,
  onOpenAdmin,
  activeSection,
  onSelectSection,
}) => {
  const { language, setLanguage, t } = useI18n();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: 'ru', label: 'Русский' },
    { code: 'tg', label: 'Тоҷикӣ' },
    { code: 'kk', label: 'Қазақша' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 md:gap-6">
        
        {/* Zone 1: Brand Wordmark (Always with letter Ҷ) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectSection('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
              ТҶ
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                РАБОТА <span className="text-emerald-600">ТҶ</span>
              </span>
              <span className="hidden sm:block text-[11px] text-slate-500 font-medium leading-none">
                {t('tagline')}
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links (All 6 sections on desktop) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs xl:text-sm font-semibold text-slate-600">
          <button
            onClick={() => onSelectSection('all')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'all'
                ? 'text-emerald-600 border-emerald-600 font-bold'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Все</span>
          </button>
          <button
            onClick={() => onSelectSection('vacancies')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'vacancies'
                ? 'text-emerald-600 border-emerald-600 font-bold'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Вакансии</span>
          </button>
          <button
            onClick={() => onSelectSection('masters')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'masters'
                ? 'text-emerald-600 border-emerald-600 font-bold'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>Мастера</span>
          </button>
          <button
            onClick={() => onSelectSection('resumes')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'resumes'
                ? 'text-emerald-600 border-emerald-600 font-bold'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Резюме</span>
          </button>
          <button
            onClick={() => onSelectSection('taxi')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'taxi'
                ? 'text-emerald-600 border-emerald-600 font-bold'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Такси</span>
          </button>
          <button
            onClick={() => onSelectSection('services')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'services'
                ? 'text-emerald-600 border-emerald-600 font-bold'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Услуги</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Переключить язык"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="uppercase">{language === 'tg' ? 'ТҶ' : language === 'kk' ? 'ҚАЗ' : 'РУС'}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                      language === l.code
                        ? 'text-emerald-600 bg-emerald-50 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{l.label}</span>
                    {language === l.code && <span className="text-emerald-600">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin shortcut button visible only for owner or admin */}
          {(currentUser?.isOwner || currentUser?.isAdmin || currentUser?.accountRole === 'owner' || currentUser?.accountRole === 'admin') && (
            <button
              onClick={onOpenAdmin}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              title="Панель администратора"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentUser?.isOwner || currentUser?.accountRole === 'owner' ? 'Панель владельца' : t('adminPanel')}</span>
            </button>
          )}

          {/* Publish Ad CTA Button */}
          <button
            onClick={onOpenCreateAd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{t('publishAd')}</span>
          </button>

          {/* User Profile / Auth Button */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title={currentUser.fullName}
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                {currentUser.fullName}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Войти</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
