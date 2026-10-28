import React, { useState, useEffect } from 'react';
import { Listing, UserProfile, CountryCode, ListingType, PaymentPeriod, TaxiDetails } from '../types';
import { COUNTRIES, getCitiesByCountry, getRegionsByCountry, getCurrencyForCountry } from '../data/locations';
import { CATEGORIES } from '../data/categories';
import { useI18n } from '../context/I18nContext';
import { store } from '../lib/store';
import { X, Upload, Check, AlertCircle, Camera, Car, UserCheck, Briefcase, Hammer, Sparkles, MapPin, Calendar, Clock, ArrowRight, ArrowLeft, RotateCcw, FileText } from 'lucide-react';

interface CreateListingModalProps {
  onClose: () => void;
  currentUser: UserProfile | null;
  onAdCreated: (ad: Listing) => void;
  initialListing?: Listing | null;
  defaultType?: ListingType;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  onClose,
  currentUser,
  onAdCreated,
  initialListing,
  defaultType,
}) => {
  const { t, language } = useI18n();

  const DRAFT_KEY = 'rabota_tj_listing_draft';

  // Read saved draft if not editing existing listing
  const savedDraft = React.useMemo(() => {
    if (initialListing) return null;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [initialListing]);

  const [hasDraft, setHasDraft] = useState<boolean>(() => !!savedDraft);

  const [type, setType] = useState<ListingType>(
    initialListing?.type || savedDraft?.type || defaultType || 'offering_job'
  );
  const [title, setTitle] = useState(initialListing?.title || savedDraft?.title || '');
  const [description, setDescription] = useState(initialListing?.description || savedDraft?.description || '');
  const [categoryId, setCategoryId] = useState(
    initialListing?.categoryId || savedDraft?.categoryId || (type === 'taxi_driver' || type === 'taxi_passenger' ? 'taxi' : CATEGORIES[0].id)
  );
  const [profession, setProfession] = useState(initialListing?.profession || savedDraft?.profession || '');
  const [countryCode, setCountryCode] = useState<CountryCode>(initialListing?.countryCode || savedDraft?.countryCode || 'TJ');
  const [region, setRegion] = useState(initialListing?.region || savedDraft?.region || COUNTRIES.TJ.regions[0]);
  const [city, setCity] = useState(initialListing?.city || savedDraft?.city || 'Душанбе');

  // Taxi-specific state
  const isTaxi = type === 'taxi_driver' || type === 'taxi_passenger';
  const [fromCountry, setFromCountry] = useState<CountryCode>(initialListing?.taxiDetails?.fromCountry || savedDraft?.fromCountry || 'TJ');
  const [fromCity, setFromCity] = useState(initialListing?.taxiDetails?.fromCity || savedDraft?.fromCity || 'Душанбе');
  const [toCountry, setToCountry] = useState<CountryCode>(initialListing?.taxiDetails?.toCountry || savedDraft?.toCountry || 'KZ');
  const [toCity, setToCity] = useState(initialListing?.taxiDetails?.toCity || savedDraft?.toCity || 'Алматы');
  const [departureDate, setDepartureDate] = useState(
    initialListing?.taxiDetails?.departureDate || savedDraft?.departureDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [departureTime, setDepartureTime] = useState(initialListing?.taxiDetails?.departureTime || savedDraft?.departureTime || '08:00');
  const [seatsAvailable, setSeatsAvailable] = useState<number>(initialListing?.taxiDetails?.seatsAvailable ?? savedDraft?.seatsAvailable ?? 4);
  const [passengersCount, setPassengersCount] = useState<number>(initialListing?.taxiDetails?.passengersCount ?? savedDraft?.passengersCount ?? 1);
  const [pricePerSeat, setPricePerSeat] = useState<boolean>(initialListing?.taxiDetails?.pricePerSeat ?? savedDraft?.pricePerSeat ?? true);
  const [carModel, setCarModel] = useState(initialListing?.taxiDetails?.carModel || savedDraft?.carModel || 'Toyota Camry');
  const [carType, setCarType] = useState(initialListing?.taxiDetails?.carType || savedDraft?.carType || 'Седан');
  const [hasLuggageSpace, setHasLuggageSpace] = useState<boolean>(initialListing?.taxiDetails?.hasLuggageSpace ?? savedDraft?.hasLuggageSpace ?? true);
  const [luggageDetails, setLuggageDetails] = useState(initialListing?.taxiDetails?.luggageDetails || savedDraft?.luggageDetails || 'До 2 средних чемоданов');
  const [allowParcels, setAllowParcels] = useState<boolean>(initialListing?.taxiDetails?.allowParcels ?? savedDraft?.allowParcels ?? true);
  const [isFlexibleDate, setIsFlexibleDate] = useState<boolean>(initialListing?.taxiDetails?.isFlexibleDate ?? savedDraft?.isFlexibleDate ?? false);
  const [isIndividualRide, setIsIndividualRide] = useState<boolean>(initialListing?.taxiDetails?.isIndividualRide ?? savedDraft?.isIndividualRide ?? false);

  // Price strict digit logic
  const [isNegotiable, setIsNegotiable] = useState(initialListing?.isNegotiable ?? savedDraft?.isNegotiable ?? false);
  const [priceString, setPriceString] = useState(initialListing?.price ? String(initialListing.price) : (savedDraft?.priceString || ''));
  const [period, setPeriod] = useState<PaymentPeriod>(
    initialListing?.period || savedDraft?.period || (isTaxi ? (pricePerSeat ? 'seat' : 'trip') : 'month')
  );

  // Author details
  const [authorName, setAuthorName] = useState(currentUser?.fullName || initialListing?.authorName || savedDraft?.authorName || '');
  const [phone, setPhone] = useState(currentUser?.phone || initialListing?.authorPhone || savedDraft?.phone || '');
  const [whatsapp, setWhatsapp] = useState(initialListing?.authorWhatsapp || savedDraft?.whatsapp || '');

  // Photo
  const [imageUrl, setImageUrl] = useState(initialListing?.images?.[0] || savedDraft?.imageUrl || '');
  const [imagePreview, setImagePreview] = useState(initialListing?.images?.[0] || savedDraft?.imageUrl || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-save draft on every change
  useEffect(() => {
    if (initialListing) return;
    const hasData = title.trim() || description.trim() || priceString.trim() || profession.trim() || phone.trim();
    if (hasData) {
      try {
        const draftObj = {
          type, title, description, categoryId, profession, countryCode, region, city,
          fromCountry, fromCity, toCountry, toCity, departureDate, departureTime,
          seatsAvailable, passengersCount, pricePerSeat, carModel, carType,
          hasLuggageSpace, luggageDetails, allowParcels, isFlexibleDate, isIndividualRide,
          isNegotiable, priceString, period, authorName, phone, whatsapp, imageUrl
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftObj));
        setHasDraft(true);
      } catch {}
    }
  }, [
    initialListing, type, title, description, categoryId, profession, countryCode, region, city,
    fromCountry, fromCity, toCountry, toCity, departureDate, departureTime,
    seatsAvailable, passengersCount, pricePerSeat, carModel, carType,
    hasLuggageSpace, luggageDetails, allowParcels, isFlexibleDate, isIndividualRide,
    isNegotiable, priceString, period, authorName, phone, whatsapp, imageUrl
  ]);

  const handleClearDraft = () => {
    if (window.confirm('Очистить сохранённый черновик? Все заполненные поля будут сброшены.')) {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      setHasDraft(false);
      setTitle('');
      setDescription('');
      setProfession('');
      setPriceString('');
      setIsNegotiable(false);
      setImageUrl('');
      setImagePreview('');
      setWhatsapp('');
    }
  };

  const allCountryKeys: CountryCode[] = ['TJ', 'KZ', 'RU', 'KG', 'UZ', 'BY', 'AZ', 'AM', 'MD', 'TM'];
  const currencyInfo = getCurrencyForCountry(isTaxi ? fromCountry : countryCode);
  const regions = getRegionsByCountry(countryCode);
  const cities = getCitiesByCountry(countryCode, region);

  const fromCities = getCitiesByCountry(fromCountry);
  const toCities = getCitiesByCountry(toCountry);

  // Update region and city if country changes
  const handleCountryChange = (code: CountryCode) => {
    setCountryCode(code);
    const newRegions = getRegionsByCountry(code);
    const firstRegion = newRegions[0] || '';
    setRegion(firstRegion);
    const newCities = getCitiesByCountry(code, firstRegion);
    if (newCities.length > 0) {
      setCity(newCities[0].nameRu);
    }
  };

  const handleRegionChange = (newReg: string) => {
    setRegion(newReg);
    const newCities = getCitiesByCountry(countryCode, newReg);
    if (newCities.length > 0) {
      setCity(newCities[0].nameRu);
    }
  };

  const handleTypeChange = (newType: ListingType) => {
    setType(newType);
    if (newType === 'taxi_driver' || newType === 'taxi_passenger') {
      setCategoryId('taxi');
      setProfession(newType === 'taxi_driver' ? 'Водитель такси' : 'Пассажир');
      setPeriod(newType === 'taxi_driver' ? 'seat' : 'trip');
      if (!title) {
        setTitle(newType === 'taxi_driver' 
          ? `Поездка: ${fromCity} → ${toCity}`
          : `Ищу машину: ${fromCity} → ${toCity}`
        );
      }
    }
  };

  // Only allow digits in price field
  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const digitsOnly = val.replace(/\D/g, '');
    setPriceString(digitsOnly);
  };

  // Handle image upload via file reader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setErrorMsg('Размер фото не должен превышать 3 МБ');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageUrl(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSuccess) return;
    setErrorMsg('');

    if (currentUser?.isBlocked) {
      setErrorMsg(`Ваш аккаунт заблокирован администратором. Причина: ${currentUser.blockedReason || 'Нарушение правил'}. Публикация объявлений невозможна.`);
      return;
    }

    let finalTitle = title.trim();
    if (isTaxi && !finalTitle) {
      finalTitle = type === 'taxi_driver'
        ? `Поездка: ${fromCity} → ${toCity}`
        : `Ищу машину: ${fromCity} → ${toCity}`;
    }

    if (!finalTitle) {
      setErrorMsg('Пожалуйста, введите название объявления');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Пожалуйста, добавьте подробное описание');
      return;
    }
    if (!authorName.trim()) {
      setErrorMsg('Пожалуйста, укажите ваше имя');
      return;
    }

    if (!isNegotiable) {
      if (!priceString || Number(priceString) <= 0) {
        setErrorMsg('Укажите сумму цены (только цифры) или отметьте «Договорная»');
        return;
      }
    }

    const cleanWhatsapp = whatsapp ? whatsapp.replace(/\D/g, '') : (phone ? phone.replace(/\D/g, '') : '');

    let taxiDetails: TaxiDetails | undefined = undefined;
    if (isTaxi) {
      taxiDetails = {
        fromCountry,
        fromCity,
        toCountry,
        toCity,
        departureDate,
        departureTime,
        seatsAvailable: type === 'taxi_driver' ? seatsAvailable : undefined,
        passengersCount: type === 'taxi_passenger' ? passengersCount : undefined,
        pricePerSeat,
        carModel: type === 'taxi_driver' ? carModel : undefined,
        carType: type === 'taxi_driver' ? carType : undefined,
        hasLuggageSpace,
        luggageDetails,
        isFlexibleDate: type === 'taxi_passenger' ? isFlexibleDate : undefined,
        isIndividualRide: type === 'taxi_passenger' ? isIndividualRide : undefined,
        allowParcels: type === 'taxi_driver' ? allowParcels : undefined,
      };
    }

    const listingData = {
      userId: currentUser?.id || 'guest_' + Date.now(),
      authorName: authorName.trim(),
      authorPhone: phone.trim(),
      authorWhatsapp: cleanWhatsapp,
      authorAvatar: currentUser?.avatarUrl,
      title: finalTitle,
      description: description.trim(),
      type,
      categoryId: isTaxi ? 'taxi' : categoryId,
      profession: profession.trim() || (isTaxi ? (type === 'taxi_driver' ? 'Водитель такси' : 'Пассажир') : 'Специалист'),
      countryCode: isTaxi ? fromCountry : countryCode,
      region: isTaxi ? fromCity : (region || 'Центральный регион'),
      city: isTaxi ? fromCity : city,
      isNegotiable,
      price: isNegotiable ? undefined : Number(priceString),
      currency: currencyInfo.code,
      period: isNegotiable ? undefined : (isTaxi ? (pricePerSeat ? 'seat' : 'trip') : period),
      images: imageUrl ? [imageUrl] : (isTaxi ? ['/src/assets/images/craftsman_tools_1793120744947.jpg'] : ['/src/assets/images/hero_job_market_1793120744468.jpg']),
      isActive: true,
      taxiDetails,
    };

    setIsSubmitting(true);

    try {
      // Short delay to indicate submission in progress and lock the UI against duplicate taps
      await new Promise((resolve) => setTimeout(resolve, 400));

      let savedListing: Listing;

      if (initialListing) {
        const ok = store.updateListing(initialListing.id, listingData);
        if (!ok) {
          throw new Error('Не удалось обновить объявление в базе данных');
        }
        savedListing = { ...initialListing, ...listingData, updatedAt: new Date().toISOString() };
      } else {
        savedListing = store.addListing(listingData);
        if (!savedListing || !savedListing.id) {
          throw new Error('Не удалось сохранить объявление в хранилище');
        }
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {}
      }

      // Verification that listing is indeed stored
      const checkStored = store.getListings().find((l) => l.id === savedListing.id);
      if (!checkStored) {
        throw new Error('Ошибка проверки: объявление не найдено в списке сохраненных');
      }

      // Switch to success state
      setIsSubmitting(false);
      setIsSuccess(true);

      // Notify parent and auto-close after 800ms
      setTimeout(() => {
        onAdCreated(savedListing);
      }, 800);
    } catch (err: any) {
      console.error('Publication error:', err);
      setIsSubmitting(false);
      setIsSuccess(false);
      setErrorMsg(err?.message || 'Не удалось сохранить объявление. Пожалуйста, проверьте данные и повторите попытку.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header with Back button */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0 bg-slate-50/80">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-emerald-700 transition-colors shadow-2xs cursor-pointer active:scale-95"
              title={t('back')}
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('back')}</span>
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {initialListing ? 'Редактировать объявление' : t('publishAd')}
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Объявление будет видно сразу всем пользователям во всех странах СНГ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {hasDraft && !initialListing && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title={t('clearDraft')}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('clearDraft')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Draft Notice Banner */}
        {hasDraft && !initialListing && (
          <div className="bg-emerald-50/90 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-xs text-emerald-900 shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[11px] sm:text-xs">
                {t('draftNotice')}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearDraft}
              className="text-[11px] text-emerald-800 underline hover:text-rose-600 font-semibold cursor-pointer shrink-0 ml-2"
            >
              {t('clearDraft')}
            </button>
          </div>
        )}

        {/* If successfully published, display clear success feedback */}
        {isSuccess ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 my-auto animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                ✅ Объявление успешно опубликовано!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Ваше объявление сохранено и уже отображается в общей ленте.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Обновляем ленту...</span>
            </div>
          </div>
        ) : (
          /* Scrollable Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Ad Type Selector (6 modes) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Тип публикации *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'offering_job', label: 'Вакансия', icon: Briefcase, desc: 'Ищу сотрудника' },
                { id: 'offering_service', label: 'Услуга / Мастер', icon: Hammer, desc: 'Предлагаю услуги' },
                { id: 'looking_for_job', label: 'Резюме', icon: UserCheck, desc: 'Ищу работу' },
                { id: 'looking_for_service', label: 'Поиск мастера', icon: Sparkles, desc: 'Нужен специалист' },
                { id: 'taxi_driver', label: '🚗 Водитель такси', icon: Car, desc: 'Ищу пассажиров' },
                { id: 'taxi_passenger', label: '🙋 Пассажир такси', icon: UserCheck, desc: 'Ищу поездку' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleTypeChange(item.id as ListingType)}
                    className={`p-2.5 text-xs text-left font-medium rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      type === item.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${type === item.id ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span className="font-bold">{item.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAXI SPECIFIC FIELDS */}
          {isTaxi && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900 border-b border-emerald-200/60 pb-2">
                <Car className="w-4 h-4 text-emerald-700" />
                <span>
                  {type === 'taxi_driver'
                    ? 'Параметры маршрута водителя (междугородние и международные рейсы)'
                    : 'Параметры поездки пассажира'}
                </span>
              </div>

              {/* Route: From & To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* From */}
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>Откуда (Страна и город) *</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={fromCountry}
                      onChange={(e) => {
                        const c = e.target.value as CountryCode;
                        setFromCountry(c);
                        const cList = getCitiesByCountry(c);
                        if (cList.length > 0) setFromCity(cList[0].nameRu);
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      {allCountryKeys.map((k) => (
                        <option key={k} value={k}>{COUNTRIES[k].flag} {COUNTRIES[k].nameRu}</option>
                      ))}
                    </select>

                    <select
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 truncate"
                    >
                      {fromCities.map((c) => (
                        <option key={c.id} value={c.nameRu}>{c.nameRu}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* To */}
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span>Куда (Страна и город) *</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={toCountry}
                      onChange={(e) => {
                        const c = e.target.value as CountryCode;
                        setToCountry(c);
                        const cList = getCitiesByCountry(c);
                        if (cList.length > 0) setToCity(cList[0].nameRu);
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      {allCountryKeys.map((k) => (
                        <option key={k} value={k}>{COUNTRIES[k].flag} {COUNTRIES[k].nameRu}</option>
                      ))}
                    </select>

                    <select
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 truncate"
                    >
                      {toCities.map((c) => (
                        <option key={c.id} value={c.nameRu}>{c.nameRu}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-emerald-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Дата выезда *</span>
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Время</span>
                  </label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>

                {type === 'taxi_driver' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Свободных мест
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={seatsAvailable}
                      onChange={(e) => setSeatsAvailable(Number(e.target.value))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Пассажиров
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={passengersCount}
                      onChange={(e) => setPassengersCount(Number(e.target.value))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Driver additional vehicle specs */}
              {type === 'taxi_driver' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-emerald-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Марка и модель авто
                    </label>
                    <input
                      type="text"
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      placeholder="Например: Toyota Camry, Hyundai Starex"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Тип кузова
                    </label>
                    <select
                      value={carType}
                      onChange={(e) => setCarType(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      <option value="Седан">Седан</option>
                      <option value="Минивэн (7-8 мест)">Минивэн (7-8 мест)</option>
                      <option value="Кроссовер / Внедорожник">Кроссовер / Внедорожник</option>
                      <option value="Микроавтобус (12-15 мест)">Микроавтобус (12-15 мест)</option>
                      <option value="Универсал">Универсал</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasLuggageSpace}
                        onChange={(e) => setHasLuggageSpace(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Есть место для багажа</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowParcels}
                        onChange={(e) => setAllowParcels(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Беру посылки и документы</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pricePerSeat}
                        onChange={(e) => setPricePerSeat(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Цена указана за 1 пассажирское место</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Passenger preferences */}
              {type === 'taxi_passenger' && (
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Багаж
                    </label>
                    <input
                      type="text"
                      value={luggageDetails}
                      onChange={(e) => setLuggageDetails(e.target.value)}
                      placeholder="Например: 2 больших чемодана + сумка"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFlexibleDate}
                        onChange={(e) => setIsFlexibleDate(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Дата гибкая (±1-2 дня)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isIndividualRide}
                        onChange={(e) => setIsIndividualRide(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Нужна отдельная машина (без попутчиков)</span>
                    </label>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Заголовок объявления *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isTaxi
                  ? `Например: Поездка ${fromCity} — ${toCity} на комфортном минивэне`
                  : 'Например: Требуется плиточник на объект или Бригада отделочников'
              }
              maxLength={120}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Non-taxi Category & Profession */}
          {!isTaxi && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Категория услуг / работ
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameRu}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Специальность / Профессия
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Например: Плиточник, Сварщик, Электрик"
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Non-taxi Country, Region & City */}
          {!isTaxi && (
            <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="block text-xs font-bold text-slate-700">
                Местоположение
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Страна</label>
                  <select
                    value={countryCode}
                    onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl p-2.5"
                  >
                    {allCountryKeys.map((k) => (
                      <option key={k} value={k}>
                        {COUNTRIES[k].flag} {COUNTRIES[k].nameRu}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Регион / Область</label>
                  <select
                    value={region}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl p-2.5"
                  >
                    {regions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Город</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl p-2.5"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.nameRu}>{c.nameRu}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Price & Currency */}
          <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {isTaxi ? 'Стоимость поездки' : 'Оплата / Цена'}
              </span>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Договорная</span>
              </label>
            </div>

            {!isNegotiable && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Сумма ({currencyInfo.code}) *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={priceString}
                      onChange={handlePriceInput}
                      placeholder="Только цифры, например 250"
                      className="w-full text-sm font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                    />
                    <span className="absolute right-3 text-xs font-bold text-slate-400">
                      {currencyInfo.symbol}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Период / Условие
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as PaymentPeriod)}
                    className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {isTaxi ? (
                      <>
                        <option value="seat">за 1 место (пассажира)</option>
                        <option value="trip">за всю поездку / авто</option>
                      </>
                    ) : (
                      <>
                        <option value="month">в месяц</option>
                        <option value="day">за смену / день</option>
                        <option value="hour">в час</option>
                        <option value="project">за весь объём работы</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Подробное описание *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Укажите все важные условия, требования, опыт или детали поездки/работы..."
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Author Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ваше имя *
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Как к вам обращаться"
                className="w-full text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Телефон
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+992 90 123 4567"
                className="w-full text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="992901234567"
                className="w-full text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Optional Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Фотография (необязательно)
            </label>
            <div className="flex items-center gap-3">
              {imagePreview ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setImagePreview('');
                    }}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                  <Camera className="w-6 h-6" />
                </div>
              )}
              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Загрузить фото</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 min-w-[170px] ${
                isSubmitting || isSuccess
                  ? 'bg-emerald-400 cursor-not-allowed opacity-90'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Публикуем…</span>
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Опубликовано!</span>
                </>
              ) : initialListing ? (
                'Сохранить изменения'
              ) : (
                'Опубликовать объявление'
              )}
            </button>
          </div>

        </form>
        )}

      </div>
    </div>
  );
};
