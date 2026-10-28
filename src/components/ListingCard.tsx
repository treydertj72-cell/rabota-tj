import React from 'react';
import { Listing } from '../types';
import { COUNTRIES } from '../data/locations';
import { CATEGORIES } from '../data/categories';
import { useI18n } from '../context/I18nContext';
import { Heart, MessageSquare, MapPin, Car, UserCheck, Calendar, Clock, Users, ArrowRight, Briefcase, Hammer, Sparkles, Luggage } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick: (listing: Listing) => void;
  onOpenChat: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorite,
  onToggleFavorite,
  onClick,
  onOpenChat,
}) => {
  const { t, language } = useI18n();
  const country = COUNTRIES[listing.countryCode] || COUNTRIES.TJ;

  const isTaxi = listing.type === 'taxi_driver' || listing.type === 'taxi_passenger';
  const isTaxiDriver = listing.type === 'taxi_driver';
  const isTaxiPassenger = listing.type === 'taxi_passenger';

  // Category name in active language
  const category = CATEGORIES.find(c => c.id === listing.categoryId);
  const categoryName = category
    ? (language === 'tg' ? category.nameTg : language === 'kk' ? category.nameKk : category.nameRu)
    : listing.categoryId;

  // Format price
  const formatPrice = () => {
    if (listing.isNegotiable || !listing.price) {
      return t('negotiable');
    }
    const formattedNum = new Intl.NumberFormat('ru-RU').format(listing.price);
    const periodLabel = listing.period ? ` ${t('periods')[listing.period] || ''}` : '';
    return `${formattedNum} ${country.currencySymbol}${periodLabel}`;
  };

  // Date formatted
  const formattedDate = new Date(listing.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });

  const typeLabels: Record<string, { label: string; color: string }> = {
    offering_job: { label: 'Вакансия', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    looking_for_job: { label: 'Ищет работу', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    offering_service: { label: 'Услуги мастера', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    looking_for_service: { label: 'Ищет мастера', color: 'text-purple-700 bg-purple-50 border-purple-200' },
    taxi_driver: { label: 'Водитель с местами', color: 'text-amber-800 bg-amber-50 border-amber-300' },
    taxi_passenger: { label: 'Пассажир ищет авто', color: 'text-teal-800 bg-teal-50 border-teal-300' },
  };

  // Route flags and labels for Taxi
  const fromCountryInfo = listing.taxiDetails?.fromCountry ? COUNTRIES[listing.taxiDetails.fromCountry] : country;
  const toCountryInfo = listing.taxiDetails?.toCountry ? COUNTRIES[listing.taxiDetails.toCountry] : null;

  return (
    <article
      onClick={() => onClick(listing)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between cursor-pointer relative"
    >
      <div>
        
        {/* Top Header: Unboxed Metadata + Type Badge + Favorite */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <span>{country.flag}</span>
              <span>{country.nameRu}</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-emerald-700 font-medium flex items-center gap-0.5 truncate">
              <MapPin className="w-3 h-3 text-emerald-600 inline shrink-0" />
              <span>{listing.city}</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${typeLabels[listing.type]?.color || 'text-slate-700 bg-slate-100 border-slate-200'}`}>
              {typeLabels[listing.type]?.label || listing.type}
            </span>
          </div>

          {/* Favorite Toggle button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(listing.id);
            }}
            className="p-1.5 -mr-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            <Heart
              className={`w-5 h-5 transition-transform active:scale-125 ${
                isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* PROMINENT ROUTE DISPLAY FOR TAXI */}
        {isTaxi && listing.taxiDetails && (
          <div className="mb-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50/80 rounded-xl border border-emerald-200/90 shadow-2xs">
            <div className="flex items-center justify-between gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
              <span className="flex items-center gap-1.5 truncate">
                <span>{fromCountryInfo?.flag}</span>
                <span className="text-emerald-950 font-bold">{listing.taxiDetails.fromCity}</span>
              </span>
              <div className="flex items-center gap-1 text-emerald-600 shrink-0 px-1">
                <span className="h-0.5 w-3 bg-emerald-400 hidden sm:inline-block" />
                <ArrowRight className="w-4 h-4 text-emerald-600 font-bold" />
              </div>
              <span className="flex items-center gap-1.5 truncate">
                <span>{toCountryInfo?.flag}</span>
                <span className="text-slate-900 font-bold">{listing.taxiDetails.toCity}</span>
              </span>
            </div>

            {/* Departure details strip */}
            <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-semibold text-slate-800">
                  {listing.taxiDetails.departureDate}
                </span>
                {listing.taxiDetails.departureTime && (
                  <span className="text-slate-500">в {listing.taxiDetails.departureTime}</span>
                )}
              </div>

              {isTaxiDriver && listing.taxiDetails.seatsAvailable && (
                <div className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  <Users className="w-3 h-3 text-emerald-700" />
                  <span>{listing.taxiDetails.seatsAvailable} мест</span>
                </div>
              )}

              {isTaxiPassenger && listing.taxiDetails.passengersCount && (
                <div className="flex items-center gap-1 text-teal-800 font-bold bg-teal-100/70 px-2 py-0.5 rounded-md">
                  <UserCheck className="w-3 h-3 text-teal-700" />
                  <span>{listing.taxiDetails.passengersCount} пасс.</span>
                </div>
              )}
            </div>

            {/* Vehicle or luggage details */}
            {(listing.taxiDetails.carModel || listing.taxiDetails.luggageDetails) && (
              <div className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-2 truncate">
                {listing.taxiDetails.carModel && (
                  <span className="flex items-center gap-1 text-slate-700 font-medium">
                    <Car className="w-3 h-3 text-slate-400" />
                    <span>{listing.taxiDetails.carModel}</span>
                  </span>
                )}
                {listing.taxiDetails.hasLuggageSpace && (
                  <span className="text-emerald-700 flex items-center gap-0.5">
                    <Luggage className="w-3 h-3" />
                    <span>багаж</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug mb-1.5">
          {listing.title}
        </h2>

        {/* Price display */}
        <div className="mb-2">
          <span className="text-base sm:text-lg font-extrabold text-emerald-700 tabular-nums">
            {formatPrice()}
          </span>
        </div>

        {/* Description Snippet */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {listing.description}
        </p>

        {/* Category & Profession info (unboxed) */}
        {!isTaxi && (
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-3 flex-wrap">
            <span className="font-semibold text-slate-700">{categoryName}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{listing.profession}</span>
          </div>
        )}

      </div>

      {/* Bottom Footer: Author, Views, WhatsApp & Chat Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2 min-w-0">
          {listing.authorAvatar ? (
            <img
              src={listing.authorAvatar}
              alt={listing.authorName}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
              {listing.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs text-slate-700 truncate font-medium max-w-[110px] sm:max-w-[150px]">
            {listing.authorName}
          </span>
          <span className="text-[11px] text-slate-400 shrink-0">
            {formattedDate}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {listing.authorWhatsapp && (
            <a
              href={`https://wa.me/${listing.authorWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Здравствуйте! Я по поводу объявления: "${listing.title}" на сайте РАБОТА ТҶ`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors"
              title="Написать в WhatsApp"
            >
              <span>WhatsApp</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => onOpenChat(listing)}
            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Написать сообщение на сайте"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

    </article>
  );
};
