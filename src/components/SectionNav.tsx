import React from 'react';
import { MainSectionType } from '../types';
import { useI18n } from '../context/I18nContext';
import { LayoutGrid, Briefcase, Hammer, UserCheck, Car, Sparkles } from 'lucide-react';

interface SectionNavProps {
  activeSection: MainSectionType;
  onSelectSection: (section: MainSectionType) => void;
  counts: Record<MainSectionType, number>;
}

export const SectionNav: React.FC<SectionNavProps> = ({
  activeSection,
  onSelectSection,
  counts,
}) => {
  const { t } = useI18n();

  const sections: { id: MainSectionType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: t('sections')?.all || 'Все', icon: LayoutGrid },
    { id: 'vacancies', label: t('sections')?.vacancies || 'Вакансии', icon: Briefcase },
    { id: 'masters', label: t('sections')?.masters || 'Мастера', icon: Hammer },
    { id: 'resumes', label: t('sections')?.resumes || 'Резюме', icon: UserCheck },
    { id: 'taxi', label: t('sections')?.taxi || 'Такси', icon: Car },
    { id: 'services', label: t('sections')?.services || 'Услуги', icon: Sparkles },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs" aria-label="Разделы платформы">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            const count = counts[sec.id] || 0;

            return (
              <button
                key={sec.id}
                onClick={() => onSelectSection(sec.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{sec.label}</span>
                <span
                  className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-full tabular-nums ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
