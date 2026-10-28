import React from 'react';
import { useI18n } from '../context/I18nContext';
import { CountryCode } from '../types';
import { COUNTRIES, getCitiesByCountry } from '../data/locations';
import { Car, UserCheck, Calendar, Users, MapPin, ArrowRightLeft, X, Sparkles, Plus } from 'lucide-react';

interface TaxiSearchSectionProps {
  fromCountry?: CountryCode;
  onSelectFromCountry: (c?: CountryCode) => void;
  fromCity: string;
  onSelectFromCity: (city: string) => void;
  toCountry?: CountryCode;
  onSelectToCountry: (c?: CountryCode) => void;
  toCity: string;
  onSelectToCity: (city: string) => void;
  tripDate: string;
  onSelectTripDate: (d: string) => void;
  tripFilterType: 'all' | 'taxi_driver' | 'taxi_passenger';
  onSelectTripFilterType: (type: 'all' | 'taxi_driver' | 'taxi_passenger') => void;
  onResetFilters: () => void;
  onOpenCreateTaxiDriver: () => void;
  onOpenCreateTaxiPassenger: () => void;
  totalTripsCount: number;
}

export const TaxiSearchSection: React.FC<TaxiSearchSectionProps> = ({
  fromCountry,
  onSelectFromCountry,
  fromCity,
  onSelectFromCity,
  toCountry,
  onSelectToCountry,
  toCity,
  onSelectToCity,
  tripDate,
  onSelectTripDate,
  tripFilterType,
  onSelectTripFilterType,
  onResetFilters,
  onOpenCreateTaxiDriver,
  onOpenCreateTaxiPassenger,
  totalTripsCount,
}) => {
  const { t } = useI18n();

  const allCountryKeys: CountryCode[] = ['TJ', 'KZ', 'RU', 'KG', 'UZ', 'BY', 'AZ', 'AM', 'MD', 'TM'];

  const fromCities = getCitiesByCountry(fromCountry);
  const toCities = getCitiesByCountry(toCountry);

  const hasTaxiFilters = Boolean(fromCountry || fromCity || toCountry || toCity || tripDate || tripFilterType !== 'all');

  // Swap from and to
  const handleSwapRoute = () => {
    const tempCountry = fromCountry;
    const tempCity = fromCity;
    onSelectFromCountry(toCountry);
    onSelectFromCity(toCity);
    onSelectToCountry(tempCountry);
    onSelectToCity(tempCity);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-4 sm:p-6 md:p-8 mb-6 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Top Header & Fast Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-2">
              <Car className="w-3.5 h-3.5" />
              <span>Междугородние и международные рейсы СНГ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Такси и попутные поездки
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-xl">
              Находите попутчиков, бронируйте свободные места в авто или предлагайте поездки между любыми городами СНГ.
            </p>
          </div>

          {/* Quick CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenCreateTaxiDriver}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Car className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Я водитель — ищу пассажиров</span>
            </button>
            <button
              onClick={onOpenCreateTaxiPassenger}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Я пассажир — ищу машину</span>
            </button>
          </div>
        </div>

        {/* Route Search Box */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg text-slate-900 border border-emerald-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Origin ("Откуда") */}
            <div className="md:col-span-5 bg-slate-50 hover:bg-slate-100/70 p-2.5 rounded-xl border border-slate-200 transition-colors">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>Откуда</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={fromCountry || ''}
                  onChange={(e) => {
                    onSelectFromCountry(e.target.value ? (e.target.value as CountryCode) : undefined);
                    onSelectFromCity('');
                  }}
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Страна (Любая)</option>
                  {allCountryKeys.map((k) => (
                    <option key={k} value={k}>
                      {COUNTRIES[k].flag} {COUNTRIES[k].nameRu}
                    </option>
                  ))}
                </select>

                <select
                  value={fromCity}
                  onChange={(e) => onSelectFromCity(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
                >
                  <option value="">Город (Любой)</option>
                  {fromCities.map((c) => (
                    <option key={c.id} value={c.nameRu}>
                      {c.nameRu}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap button */}
            <div className="md:col-span-1 flex items-center justify-center">
              <button
                type="button"
                onClick={handleSwapRoute}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 flex items-center justify-center border border-slate-200 transition-all active:rotate-180 cursor-pointer shadow-xs"
                title="Поменять направление"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Destination ("Куда") */}
            <div className="md:col-span-4 bg-slate-50 hover:bg-slate-100/70 p-2.5 rounded-xl border border-slate-200 transition-colors">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>Куда</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={toCountry || ''}
                  onChange={(e) => {
                    onSelectToCountry(e.target.value ? (e.target.value as CountryCode) : undefined);
                    onSelectToCity('');
                  }}
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Страна (Любая)</option>
                  {allCountryKeys.map((k) => (
                    <option key={k} value={k}>
                      {COUNTRIES[k].flag} {COUNTRIES[k].nameRu}
                    </option>
                  ))}
                </select>

                <select
                  value={toCity}
                  onChange={(e) => onSelectToCity(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
                >
                  <option value="">Город (Любой)</option>
                  {toCities.map((c) => (
                    <option key={c.id} value={c.nameRu}>
                      {c.nameRu}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Departure Date */}
            <div className="md:col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Дата</span>
              </span>
              <input
                type="date"
                value={tripDate}
                onChange={(e) => onSelectTripDate(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

          </div>

          {/* Sub-filters: All trips vs Drivers vs Passengers */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => onSelectTripFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  tripFilterType === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Все поездки ({totalTripsCount})
              </button>
              <button
                type="button"
                onClick={() => onSelectTripFilterType('taxi_driver')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  tripFilterType === 'taxi_driver'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Водители с местами</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTripFilterType('taxi_passenger')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  tripFilterType === 'taxi_passenger'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Пассажиры ищут авто</span>
              </button>
            </div>

            {hasTaxiFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer ml-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Сбросить фильтр поездок</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
