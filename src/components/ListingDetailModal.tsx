import React, { useState } from 'react';
import { Listing, UserProfile, Review } from '../types';
import { COUNTRIES } from '../data/locations';
import { CATEGORIES } from '../data/categories';
import { useI18n } from '../context/I18nContext';
import { store } from '../lib/store';
import {
  X,
  MapPin,
  Heart,
  MessageSquare,
  Phone,
  Send,
  Flag,
  Share2,
  Trash2,
  Edit3,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  currentUser: UserProfile | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenChat: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onListingDeleted?: () => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  currentUser,
  isFavorite,
  onToggleFavorite,
  onOpenChat,
  onEditListing,
  onListingDeleted,
}) => {
  const { t, language } = useI18n();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Спам или недостоверная информация');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!listing) return null;

  const country = COUNTRIES[listing.countryCode] || COUNTRIES.TJ;
  const category = CATEGORIES.find(c => c.id === listing.categoryId);
  const categoryName = category
    ? (language === 'tg' ? category.nameTg : language === 'kk' ? category.nameKk : category.nameRu)
    : listing.categoryId;

  const isAuthor = currentUser?.id === listing.userId;
  const isAdmin = currentUser?.isAdmin;

  // Format price
  const formatPrice = () => {
    if (listing.isNegotiable || !listing.price) {
      return t('negotiable');
    }
    const formattedNum = new Intl.NumberFormat('ru-RU').format(listing.price);
    const periodLabel = listing.period ? ` ${t('periods')[listing.period]}` : '';
    return `${formattedNum} ${country.currencySymbol}${periodLabel}`;
  };

  const reviews = store.getReviews(listing.userId);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${listing.title} — РАБОТА ТҶ`,
        text: `Объявление на сайте РАБОТА ТҶ: ${listing.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена!');
    }
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert(t('loginPrompt'));
      return;
    }
    store.addReport({
      reporterId: currentUser.id,
      targetListingId: listing.id,
      targetUserId: listing.userId,
      targetTitle: listing.title,
      reason: reportReason,
    });
    setReportSuccess(true);
    setTimeout(() => {
      setReportOpen(false);
      setReportSuccess(false);
    }, 2000);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert(t('loginPrompt'));
      return;
    }
    if (!newReviewComment.trim()) return;

    store.addReview({
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      targetUserId: listing.userId,
      listingId: listing.id,
      rating: newReviewRating,
      comment: newReviewComment.trim(),
    });
    setNewReviewComment('');
    setReviewSubmitted(true);
  };

  const handleDelete = () => {
    if (window.confirm(t('confirmDelete'))) {
      store.deleteListing(listing.id, 'Удалено автором или администратором');
      onListingDeleted?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-emerald-700 transition-colors shadow-2xs cursor-pointer active:scale-95"
              title={t('backToList')}
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('back')}</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <span>{country.flag}</span>
                <span>{country.nameRu}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {listing.city}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(listing.id)}
              className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 transition-colors"
              title="В избранное"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              title="Поделиться"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Images */}
          {listing.images && listing.images.length > 0 && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-72 flex items-center justify-center">
              <img
                src={listing.images[0]}
                alt={listing.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover max-h-72"
              />
            </div>
          )}

          {/* Taxi Route Header if available */}
          {listing.taxiDetails && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between gap-3 text-lg sm:text-xl font-black text-slate-900 mb-2">
                <span className="flex items-center gap-2">
                  <span>{listing.taxiDetails.fromCountry ? COUNTRIES[listing.taxiDetails.fromCountry]?.flag : '🚩'}</span>
                  <span>{listing.taxiDetails.fromCity}</span>
                </span>
                <span className="text-emerald-600 font-black">→</span>
                <span className="flex items-center gap-2">
                  <span>{listing.taxiDetails.toCountry ? COUNTRIES[listing.taxiDetails.toCountry]?.flag : '🚩'}</span>
                  <span>{listing.taxiDetails.toCity}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-emerald-200/60">
                <div>
                  <span className="text-slate-500 block">Дата выезда</span>
                  <span className="font-bold text-slate-800">{listing.taxiDetails.departureDate}</span>
                </div>
                {listing.taxiDetails.departureTime && (
                  <div>
                    <span className="text-slate-500 block">Время</span>
                    <span className="font-bold text-slate-800">{listing.taxiDetails.departureTime}</span>
                  </div>
                )}
                {listing.taxiDetails.seatsAvailable !== undefined && (
                  <div>
                    <span className="text-slate-500 block">Свободных мест</span>
                    <span className="font-bold text-emerald-800">{listing.taxiDetails.seatsAvailable} мест</span>
                  </div>
                )}
                {listing.taxiDetails.passengersCount !== undefined && (
                  <div>
                    <span className="text-slate-500 block">Пассажиров</span>
                    <span className="font-bold text-teal-800">{listing.taxiDetails.passengersCount} чел.</span>
                  </div>
                )}
                {listing.taxiDetails.carModel && (
                  <div>
                    <span className="text-slate-500 block">Автомобиль</span>
                    <span className="font-bold text-slate-800">{listing.taxiDetails.carModel}</span>
                  </div>
                )}
                {listing.taxiDetails.carType && (
                  <div>
                    <span className="text-slate-500 block">Тип авто</span>
                    <span className="font-bold text-slate-800">{listing.taxiDetails.carType}</span>
                  </div>
                )}
                {listing.taxiDetails.hasLuggageSpace && (
                  <div>
                    <span className="text-slate-500 block">Багаж</span>
                    <span className="font-bold text-emerald-700">Есть место</span>
                  </div>
                )}
                {listing.taxiDetails.allowParcels && (
                  <div>
                    <span className="text-slate-500 block">Посылки</span>
                    <span className="font-bold text-slate-800">Берёт грузы/документы</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title & Price */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2">
              {listing.title}
            </h1>
            <div className="text-2xl font-black text-emerald-700 tabular-nums">
              {formatPrice()}
            </div>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Регион / Страна</span>
              <span className="font-bold text-slate-800 truncate block" title={listing.region || country.nameRu}>
                {country.flag} {listing.city}, {country.nameRu}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Категория</span>
              <span className="font-bold text-slate-800">{categoryName}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Специальность</span>
              <span className="font-bold text-slate-800">{listing.profession}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Дата публикации</span>
              <span className="font-bold text-slate-800">
                {new Date(listing.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-2">Описание</h2>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Contact & Author card */}
          <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {listing.authorAvatar ? (
                <img
                  src={listing.authorAvatar}
                  alt={listing.authorName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                  {listing.authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{listing.authorName}</h3>
                <span className="text-xs text-slate-500">
                  {listing.type === 'offering_job' ? 'Работодатель' : 'Мастер / Специалист'}
                </span>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {listing.authorWhatsapp && (
                <a
                  href={`https://wa.me/${listing.authorWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Здравствуйте! Я по поводу объявления: "${listing.title}" на сайте РАБОТА ТҶ`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>WhatsApp</span>
                </a>
              )}
              {listing.authorPhone && (
                <a
                  href={`tel:${listing.authorPhone}`}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Позвонить</span>
                </a>
              )}
              <button
                onClick={() => onOpenChat(listing)}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                title="Написать в чате на сайте"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Чат</span>
              </button>
            </div>
          </div>

          {/* Author or Admin controls */}
          {(isAuthor || isAdmin) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-800">Управление объявлением</span>
              <div className="flex items-center gap-2">
                {onEditListing && (
                  <button
                    onClick={() => onEditListing(listing)}
                    className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-lg font-semibold hover:bg-amber-100 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('edit')}</span>
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('delete')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <span>Отзывы и оценки</span>
              <span className="text-slate-400 font-normal">({reviews.length})</span>
            </h3>

            {reviews.length > 0 ? (
              <div className="space-y-3 mb-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-slate-50 rounded-xl text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">{rev.authorName}</span>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-4">Пока нет отзывов об этом авторе.</p>
            )}

            {/* Leave Review Form */}
            {currentUser && currentUser.id !== listing.userId && (
              <form onSubmit={handleAddReview} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">Оставить отзыв о сотрудничестве</span>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReviewRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Опишите ваши впечатления о работе со специалистом..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
                />
                <button
                  type="submit"
                  disabled={!newReviewComment.trim()}
                  className="px-3.5 py-1.5 bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs rounded-lg hover:bg-emerald-700"
                >
                  {reviewSubmitted ? 'Отзыв отправлен!' : 'Опубликовать отзыв'}
                </button>
              </form>
            )}
          </div>

          {/* Report Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setReportOpen(!reportOpen)}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Пожаловаться на объявление</span>
            </button>
          </div>

          {/* Report Form */}
          {reportOpen && (
            <form onSubmit={handleReport} className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-rose-800 block">Укажите причину жалобы:</span>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-rose-200 rounded-lg text-slate-800"
              >
                <option value="Спам или реклама">Спам или несоответствующая реклама</option>
                <option value="Мошенничество">Подозрение на мошенничество</option>
                <option value="Недостоверная зарплата">Недостоверная зарплата или условия</option>
                <option value="Оскорбительное содержание">Оскорбительное содержание</option>
                <option value="Неверный город / страна">Неверно указана страна или город</option>
              </select>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700"
                >
                  {reportSuccess ? 'Отправлено!' : 'Отправить жалобу'}
                </button>
              </div>
            </form>
          )}

          {/* Bottom Back to List Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span>{t('backToList')}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              РАБОТА ТҶ
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
