import React, { useState } from 'react';
import { UserProfile, Listing, CountryCode, UserRole } from '../types';
import { COUNTRIES, getCitiesByCountry } from '../data/locations';
import { useI18n } from '../context/I18nContext';
import { store } from '../lib/store';
import { X, User, Heart, List, Settings, LogOut, Check, Trash2, Edit3, Camera, ArrowLeft } from 'lucide-react';

interface ProfileModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onLogout: () => void;
  onOpenListing: (listing: Listing) => void;
  onEditListing: (listing: Listing) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  onClose,
  onLogout,
  onOpenListing,
  onEditListing,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites' | 'edit'>('listings');

  // Edit form state
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [role, setRole] = useState<UserRole>(currentUser.role || 'worker');
  const [countryCode, setCountryCode] = useState<CountryCode>(currentUser.countryCode || 'TJ');
  const [city, setCity] = useState(currentUser.city || 'Душанбе');
  const [profession, setProfession] = useState(currentUser.profession || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Data
  const allListings = store.getListings();
  const myListings = allListings.filter(l => l.userId === currentUser.id);
  const favoritesIds = store.getFavorites();
  const myFavorites = allListings.filter(l => favoritesIds.includes(l.id));

  const cities = getCitiesByCountry(countryCode);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...currentUser,
      fullName: fullName.trim(),
      phone: phone.trim(),
      role,
      countryCode,
      city,
      profession: profession.trim(),
      bio: bio.trim(),
      avatarUrl,
    };
    store.setCurrentUser(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteListing = (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      store.deleteListing(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0 bg-slate-50/80">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-emerald-700 transition-colors shadow-2xs cursor-pointer active:scale-95 shrink-0"
              title={t('back')}
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('back')}</span>
            </button>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-emerald-500"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base sm:text-lg">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {fullName}
              </h2>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                {role === 'employer' ? 'Работодатель' : role === 'worker' ? 'Работник / Мастер' : 'Работодатель и мастер'}
                {currentUser.isAdmin && ' · Администратор'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-4 bg-slate-50 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'listings'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>{t('myAds')} ({myListings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'favorites'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t('favorites')} ({myFavorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'edit'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Настройки профиля</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: My Listings */}
          {activeTab === 'listings' && (
            <div>
              {myListings.length > 0 ? (
                <div className="space-y-3">
                  {myListings.map((ad) => (
                    <div
                      key={ad.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-400 transition-all"
                    >
                      <div
                        onClick={() => { onClose(); onOpenListing(ad); }}
                        className="cursor-pointer flex-1"
                      >
                        <h4 className="text-sm font-bold text-slate-900 hover:text-emerald-700">
                          {ad.title}
                        </h4>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span>{COUNTRIES[ad.countryCode]?.flag} {ad.city}</span>
                          <span>·</span>
                          <span className="font-semibold text-emerald-700">
                            {ad.isNegotiable || !ad.price ? 'Договорная' : `${ad.price} ${ad.currency}`}
                          </span>
                          <span>·</span>
                          <span>{ad.viewsCount} просмотров</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => { onClose(); onEditListing(ad); }}
                          className="p-2 text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{t('edit')}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteListing(ad.id)}
                          className="p-2 text-rose-600 hover:text-rose-700 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t('delete')}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-slate-500 mb-3">У вас пока нет опубликованных объявлений.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Favorites */}
          {activeTab === 'favorites' && (
            <div>
              {myFavorites.length > 0 ? (
                <div className="space-y-3">
                  {myFavorites.map((ad) => (
                    <div
                      key={ad.id}
                      onClick={() => { onClose(); onOpenListing(ad); }}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-400 transition-all"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 hover:text-emerald-700">
                          {ad.title}
                        </h4>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span>{COUNTRIES[ad.countryCode]?.flag} {ad.city}</span>
                          <span>·</span>
                          <span className="font-semibold text-emerald-700">
                            {ad.isNegotiable || !ad.price ? 'Договорная' : `${ad.price} ${ad.currency}`}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        {t('details')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-slate-500">В избранном пока пусто. Нажимайте на сердечко в карточках объявлений!</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Edit Profile */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {savedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{t('profileSavedSuccess')}</span>
                </div>
              )}

              {/* Avatar upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Фото профиля
                </label>
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Аватар" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                      {fullName.charAt(0)}
                    </div>
                  )}
                  <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Сменить фото</span>
                    <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Имя и фамилия *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ваша роль
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'worker', label: 'Работник / Мастер' },
                    { id: 'employer', label: 'Работодатель' },
                    { id: 'both', label: 'И то и другое' },
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRole(r.id as UserRole)}
                      className={`p-2 text-xs rounded-xl border text-center font-semibold cursor-pointer transition-colors ${
                        role === r.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country & City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Страна
                  </label>
                  <select
                    value={countryCode}
                    onChange={(e) => {
                      const c = e.target.value as CountryCode;
                      setCountryCode(c);
                      const nc = getCitiesByCountry(c);
                      if (nc.length) setCity(nc[0].nameRu);
                    }}
                    className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="TJ">🇹🇯 Таджикистан</option>
                    <option value="KZ">🇰🇿 Казахстан</option>
                    <option value="RU">🇷🇺 Россия</option>
                    <option value="KG">🇰🇬 Кыргызстан</option>
                    <option value="UZ">🇺🇿 Узбекистан</option>
                    <option value="BY">🇧🇾 Беларусь</option>
                    <option value="AZ">🇦🇿 Азербайджан</option>
                    <option value="AM">🇦🇲 Армения</option>
                    <option value="MD">🇲🇩 Молдова</option>
                    <option value="TM">🇹🇲 Туркменистан</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Город
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {cities.map(c => (
                      <option key={c.id} value={c.nameRu}>{c.nameRu}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Profession & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Профессия / Специальность
                  </label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="Строитель, бухгалтер..."
                    className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+992..."
                    className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  О себе
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Расскажите о своем опыте работы, навыках или требованиях..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer with logout */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs text-slate-400">{currentUser.email}</span>
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('logout')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
