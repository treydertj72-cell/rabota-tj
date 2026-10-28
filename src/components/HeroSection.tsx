import React from 'react';
import { useI18n } from '../context/I18nContext';
import { CountryCode } from '../types';
import { COUNTRIES, getCitiesByCountry, getRegionsByCountry, COMMON_PROFESSIONS } from '../data/locations';
import { CATEGORIES } from '../data/categories';
import { Search, MapPin, Briefcase, Filter, X, Building, Check } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCountry?: CountryCode;
  onSelectCountry: (c?: CountryCode) => void;
  selectedRegion: string;
  onSelectRegion: (r: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  selectedProfession: string;
  onSelectProfession: (prof: string) => void;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  selectedType: string;
  onSelectType: (type: string) => void;
  onResetFilters: () => void;
  totalListingsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedCountry,
  onSelectCountry,
  selectedRegion,
  onSelectRegion,
  selectedCity,
  onSelectCity,
  selectedProfession,
  onSelectProfession,
  selectedCategory,
  onSelectCategory,
  selectedType,
  onSelectType,
  onResetFilters,
  totalListingsCount,
}) => {
  const { t, language } = useI18n();

  const regionsList = getRegionsByCountry(selectedCountry);
  const citiesList = getCitiesByCountry(selectedCountry, selectedRegion || undefined);
  
  const hasActiveFilters = Boolean(
    selectedCountry ||
    selectedRegion ||
    selectedCity ||
    selectedProfession ||
    selectedCategory ||
    selectedType !== 'all' ||
    searchQuery
  );

  // All CIS countries list
  const allCisCountryKeys: CountryCode[] = [
    'TJ', // Таджикистан
    'KZ', // Казахстан
    'RU', // Россия
    'KG', // Кыргызстан
    'UZ', // Узбекистан
    'BY', // Беларусь
    'AZ', // Азербайджан
    'AM', // Армения
    'MD', // Молдова
    'TM', // Туркменистан
  ];

  return (
    <div className="relative bg-gradient-to-b from-emerald-50/70 via-slate-50 to-slate-50 pt-5 pb-5 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            {t('heroTitle')}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
            Единая лента объявлений: Таджикистан, Казахстан, Россия, Кыргызстан, Узбекистан, Беларусь и другие страны СНГ
          </p>
        </div>

        {/* Search Bar + Primary Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2.5 sm:p-3 mb-4 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            
            {/* Search Input (Keyword / Title) */}
            <div className="md:col-span-4 relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Поиск по названию или описанию..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Region / Oblast Selector */}
            <div className="md:col-span-3 relative flex items-center">
              <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={selectedRegion}
                onChange={(e) => {
                  onSelectRegion(e.target.value);
                  onSelectCity('');
                }}
                className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 appearance-none cursor-pointer truncate"
              >
                <option value="">{t('allRegions')}</option>
                {regionsList.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            {/* City Selector */}
            <div className="md:col-span-2 relative flex items-center">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="w-full pl-7 pr-6 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 appearance-none cursor-pointer truncate"
              >
                <option value="">{t('allCities')}</option>
                {citiesList.map((city) => (
                  <option key={city.id} value={city.nameRu}>
                    {city.nameRu}
                  </option>
                ))}
              </select>
            </div>

            {/* Profession Filter */}
            <div className="md:col-span-2 relative flex items-center">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={selectedProfession}
                onChange={(e) => onSelectProfession(e.target.value)}
                className="w-full pl-7 pr-6 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 appearance-none cursor-pointer truncate"
              >
                <option value="">Все профессии</option>
                {COMMON_PROFESSIONS.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="md:col-span-1 flex items-center">
              {hasActiveFilters ? (
                <button
                  onClick={onResetFilters}
                  className="w-full py-2 px-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Сбросить все фильтры"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Сброс</span>
                </button>
              ) : (
                <div className="w-full text-center text-[11px] font-semibold text-slate-400">
                  {totalListingsCount}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* CIS Countries Interactive Selector: Default is ALL CIS COUNTRIES */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 max-w-5xl mx-auto mb-3">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            
            {/* Button: Все страны СНГ */}
            <button
              onClick={() => {
                onSelectCountry(undefined);
                onSelectRegion('');
                onSelectCity('');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                !selectedCountry
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              🌐 {t('allCountries')}
            </button>

            {/* Each CIS country */}
            {allCisCountryKeys.map((code) => {
              const country = COUNTRIES[code];
              const isSelected = selectedCountry === code;
              return (
                <button
                  key={code}
                  onClick={() => {
                    onSelectCountry(code);
                    onSelectRegion('');
                    onSelectCity('');
                  }}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                  title={country.nameRu}
                >
                  <span>{country.flag}</span>
                  <span>{country.nameRu}</span>
                </button>
              );
            })}
          </div>

          {/* Ad Type Filter (Segmented control) */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl w-full sm:w-auto overflow-x-auto shrink-0">
            {[
              { id: 'all', label: 'Все' },
              { id: 'offering_job', label: 'Вакансии' },
              { id: 'offering_service', label: 'Мастера' },
              { id: 'looking_for_job', label: 'Резюме' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => onSelectType(type.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === type.id
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none max-w-5xl mx-auto">
          <button
            onClick={() => onSelectCategory('')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              !selectedCategory
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t('allCategories')}
          </button>
          {CATEGORIES.map((cat) => {
            const isCatSelected = selectedCategory === cat.id;
            const catName = language === 'tg' ? cat.nameTg : language === 'kk' ? cat.nameKk : cat.nameRu;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isCatSelected ? '' : cat.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isCatSelected
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
