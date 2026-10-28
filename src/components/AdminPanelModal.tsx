import React, { useState } from 'react';
import { UserProfile, Listing, OwnerAd, Report, AdminLog, CountryCode } from '../types';
import { store } from '../lib/store';
import { COUNTRIES } from '../data/locations';
import { getSupabaseConfig, setSupabaseConfig } from '../lib/supabase';
import {
  X,
  Users,
  FileText,
  AlertTriangle,
  Megaphone,
  BarChart3,
  Database,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Ban,
  CheckCircle,
  Copy,
  Plus,
  ExternalLink,
  MessageCircle,
  ShieldAlert,
  Clock,
  History,
  ArrowLeft
} from 'lucide-react';

interface AdminPanelModalProps {
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenListing: (listing: Listing) => void;
  onEditListing: (listing: Listing) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  onClose,
  currentUser,
  onOpenListing,
  onEditListing,
}) => {
  // Server-side authentication check
  const [isServerVerified, setIsServerVerified] = useState<boolean>(() => store.isServerAdminVerified());
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'stats' | 'listings' | 'users' | 'reports' | 'ads' | 'adsense' | 'supabase' | 'logs'>('stats');

  // Search queries for lists
  const [listingSearch, setListingSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Admin logs & stats
  const allUsers = store.getAllUsers();
  const allListings = store.getListings();
  const allReports = store.getReports();
  const allAds = store.getOwnerAds();
  const adminLogs = store.getAdminLogs();

  // New Ad Form State
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adImageUrl, setAdImageUrl] = useState('/src/assets/images/ad_whatsapp_channel_1793120745561.jpg');
  const [adLinkUrl, setAdLinkUrl] = useState('https://wa.me/992900000000');
  const [adIsWhatsapp, setAdIsWhatsapp] = useState(true);
  const [adWhatsappMsg, setAdWhatsappMsg] = useState('Здравствуйте! Я с сайта РАБОТА ТҶ');
  const [adPlacement, setAdPlacement] = useState<'hero' | 'feed'>('hero');
  const [showAddAdModal, setShowAddAdModal] = useState(false);

  // Supabase config state
  const supabaseCfg = getSupabaseConfig();
  const [supabaseAnonInput, setSupabaseAnonInput] = useState(supabaseCfg.anonKey);
  const [supabaseSaved, setSupabaseSaved] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Statistics calculation
  const totalViews = allListings.reduce((sum, l) => sum + l.viewsCount, 0);
  const totalAdClicks = allAds.reduce((sum, a) => sum + a.clicksCount, 0);
  const activeVacancies = allListings.filter(l => l.type === 'offering_job' && l.isActive && !l.isHiddenByAdmin).length;
  const activeJobSeekers = allListings.filter(l => l.type === 'looking_for_job' && l.isActive && !l.isHiddenByAdmin).length;
  const activeMasters = allListings.filter(l => l.type === 'offering_service' && l.isActive && !l.isHiddenByAdmin).length;

  // Filtered listings
  const filteredListings = allListings.filter(l =>
    l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
    l.city.toLowerCase().includes(listingSearch.toLowerCase()) ||
    l.authorName.toLowerCase().includes(listingSearch.toLowerCase()) ||
    l.countryCode.toLowerCase().includes(listingSearch.toLowerCase())
  );

  // Filtered users
  const filteredUsers = allUsers.filter(u =>
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleServerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const result = await store.verifyAdminWithServer(adminKeyInput.trim());
    setAuthLoading(false);
    if (result.success) {
      setIsServerVerified(true);
      setAdminKeyInput('');
    } else {
      setAuthError(result.message);
    }
  };

  const handleAdminLogout = () => {
    store.setAdminServerToken(null);
    setIsServerVerified(false);
  };

  const handleToggleHideListing = async (id: string, currentlyHidden: boolean) => {
    const reason = prompt('Укажите причину действия:', currentlyHidden ? 'Восстановление в ленту' : 'Нарушение правил публикации');
    if (reason !== null) {
      await store.auditServerAdminAction('VISIBILITY_TOGGLE', 'listing', id, reason);
      store.toggleListingAdminVisibility(id, !currentlyHidden, reason);
    }
  };

  const handleDeleteListing = async (id: string) => {
    const reason = prompt('Причина удаления объявления:', 'Спам / дубликат');
    if (reason !== null) {
      await store.auditServerAdminAction('DELETE_LISTING', 'listing', id, reason);
      store.deleteListing(id, reason);
    }
  };

  const handleDeleteAllUserListings = async (userId: string, userName: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить ВСЕ объявления пользователя "${userName}"?`)) {
      const reason = prompt('Укажите причину массового удаления:', 'Массовый спам');
      if (reason !== null) {
        await store.auditServerAdminAction('DELETE_ALL_USER_LISTINGS', 'user_listings', userId, reason);
        store.deleteAllUserListings(userId, reason);
      }
    }
  };

  const handleToggleBlockUser = async (user: UserProfile) => {
    if (user.isBlocked) {
      if (window.confirm(`Разблокировать пользователя ${user.fullName}?`)) {
        await store.auditServerAdminAction('UNBLOCK_USER', 'user', user.id, 'Снятие блокировки');
        store.updateUserStatus(user.id, false);
      }
    } else {
      const reason = prompt(`Причина блокировки ${user.fullName}:`, 'Систематические нарушения / жалобы');
      if (reason) {
        await store.auditServerAdminAction('BLOCK_USER', 'user', user.id, reason);
        store.updateUserStatus(user.id, true, reason);
      }
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (window.confirm(`ВНИМАНИЕ! Вы собираетесь навсегда удалить аккаунт "${user.fullName}" и все его объявления. Подтвердить?`)) {
      const reason = prompt('Причина удаления аккаунта:', 'Грубое нарушение правил');
      if (reason !== null) {
        await store.auditServerAdminAction('DELETE_USER', 'user', user.id, reason);
        store.deleteUser(user.id, reason);
      }
    }
  };

  const handleSaveAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adLinkUrl.trim()) return;

    store.addOwnerAd({
      title: adTitle.trim(),
      description: adDesc.trim(),
      imageUrl: adImageUrl,
      linkUrl: adLinkUrl.trim(),
      isWhatsapp: adIsWhatsapp,
      whatsappMessage: adWhatsappMsg.trim(),
      placement: adPlacement,
      isActive: true,
    });

    setShowAddAdModal(false);
    setAdTitle('');
    setAdDesc('');
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseConfig(supabaseCfg.url, supabaseAnonInput.trim());
    setSupabaseSaved(true);
    setTimeout(() => setSupabaseSaved(false), 2500);
  };

  const handleCopySql = () => {
    const sqlScript = `-- Схема базы данных РАБОТА ТҶ доступна в файле /supabase_schema.sql
-- Скопируйте содержимое файла supabase_schema.sql в SQL Editor вашего проекта Supabase`;
    navigator.clipboard.writeText(sqlScript);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:text-white transition-colors shadow-2xs shrink-0 cursor-pointer active:scale-95"
              title="Назад"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Назад</span>
            </button>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
              ТҶ
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold leading-tight flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="truncate">Панель администратора «РАБОТА ТҶ»</span>
                {isServerVerified && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0 hidden xs:inline">
                    Сервер подтверждён
                  </span>
                )}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block truncate">
                Модерация объявлений, защита прав, блокировка нарушителей и управление рекламой
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isServerVerified && (
              <button
                onClick={handleAdminLogout}
                className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Завершить сессию администратора"
              >
                Выйти
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* If NOT server-verified: show Server Authentication Gate */}
        {!isServerVerified ? (
          <div className="p-6 sm:p-10 max-w-md mx-auto text-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Серверная проверка прав администратора
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              В целях безопасности все операции удаления и блокировок защищены сервером. Введите секретный ключ доступа для подтверждения полномочий:
            </p>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-left">
                {authError}
              </div>
            )}

            <form onSubmit={handleServerLogin} className="space-y-3 pt-2">
              <input
                type="password"
                required
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                placeholder="Секретный ключ администратора (admin2026)"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-mono"
              />
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-xs"
              >
                {authLoading ? 'Проверка на сервере...' : 'Подтвердить и войти'}
              </button>
            </form>
            <p className="text-[11px] text-slate-400">
              По умолчанию ключ: <code className="text-slate-600 font-bold">admin2026</code>
            </p>
          </div>
        ) : (
          <>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-3 sm:px-6 bg-slate-50 text-xs font-semibold overflow-x-auto gap-1">
          {[
            { id: 'stats', label: 'Статистика', icon: BarChart3 },
            { id: 'listings', label: `Объявления (${allListings.length})`, icon: FileText },
            { id: 'users', label: `Пользователи (${allUsers.length})`, icon: Users },
            { id: 'reports', label: `Жалобы (${allReports.filter(r => r.status === 'pending').length})`, icon: AlertTriangle },
            { id: 'ads', label: `Реклама (${allAds.length})`, icon: Megaphone },
            { id: 'adsense', label: 'Google AdSense', icon: ExternalLink },
            { id: 'supabase', label: 'База данных Supabase', icon: Database },
            { id: 'logs', label: 'История действий', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* 1. STATS TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Реальная аналитика платформы
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-xs text-slate-500 block mb-1">Всего объявлений</span>
                  <span className="text-2xl font-black text-slate-900 tabular-nums">{allListings.length}</span>
                  <span className="text-[11px] text-emerald-600 block mt-1">во всех 4 странах</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-xs text-slate-500 block mb-1">Активные вакансии</span>
                  <span className="text-2xl font-black text-emerald-700 tabular-nums">{activeVacancies}</span>
                  <span className="text-[11px] text-slate-400 block mt-1">от работодателей</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-xs text-slate-500 block mb-1">Мастера и резюме</span>
                  <span className="text-2xl font-black text-teal-700 tabular-nums">{activeMasters + activeJobSeekers}</span>
                  <span className="text-[11px] text-slate-400 block mt-1">специалисты</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-xs text-slate-500 block mb-1">Просмотров объявлений</span>
                  <span className="text-2xl font-black text-slate-900 tabular-nums">{totalViews}</span>
                  <span className="text-[11px] text-slate-400 block mt-1">суммарно</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-xs text-slate-500 block mb-1">Зарегистрировано пользователей</span>
                  <span className="text-xl font-extrabold text-slate-900 tabular-nums">{allUsers.length}</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-xs text-slate-500 block mb-1">Переходов по WhatsApp рекламе</span>
                  <span className="text-xl font-extrabold text-emerald-700 tabular-nums">{totalAdClicks}</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-xs text-slate-500 block mb-1">Жалоб на рассмотрении</span>
                  <span className="text-xl font-extrabold text-rose-600 tabular-nums">{allReports.filter(r => r.status === 'pending').length}</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. LISTINGS MODERATION TAB */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    placeholder="Поиск по названию, городу или автору..."
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Показано: {filteredListings.length} объявлений
                </span>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                {filteredListings.map((ad) => {
                  const country = COUNTRIES[ad.countryCode];
                  return (
                    <div
                      key={ad.id}
                      className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        ad.isHiddenByAdmin
                          ? 'bg-rose-50/50 border-rose-200'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <span className="font-bold text-slate-800">{country?.flag} {ad.city}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500">{ad.authorName}</span>
                          {ad.isHiddenByAdmin && (
                            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              Скрыто админом
                            </span>
                          )}
                        </div>
                        <h4
                          onClick={() => { onClose(); onOpenListing(ad); }}
                          className="text-sm font-bold text-slate-900 cursor-pointer hover:text-emerald-700"
                        >
                          {ad.title}
                        </h4>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                          <span className="font-bold text-emerald-700">
                            {ad.isNegotiable || !ad.price ? 'Договорная' : `${ad.price} ${ad.currency}`}
                          </span>
                          <span>{ad.viewsCount} просмотров</span>
                          <span>{new Date(ad.createdAt).toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        <button
                          onClick={() => handleToggleHideListing(ad.id, ad.isHiddenByAdmin)}
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                            ad.isHiddenByAdmin
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title={ad.isHiddenByAdmin ? 'Показать в общей ленте' : 'Скрыть из ленты'}
                        >
                          {ad.isHiddenByAdmin ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{ad.isHiddenByAdmin ? 'Показать' : 'Скрыть'}</span>
                        </button>

                        <button
                          onClick={() => { onClose(); onEditListing(ad); }}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                        >
                          Изменить
                        </button>

                        <button
                          onClick={() => handleDeleteListing(ad.id)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold"
                          title="Удалить это объявление"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteAllUserListings(ad.userId, ad.authorName)}
                          className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-semibold"
                          title="Удалить ВСЕ объявления этого автора"
                        >
                          Удалить все автора
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. USERS MANAGEMENT TAB */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Поиск пользователя по имени или email..."
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      user.isBlocked ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{user.fullName}</span>
                        {user.isAdmin && (
                          <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                        {user.isBlocked && (
                          <span className="text-[10px] font-bold bg-rose-200 text-rose-800 px-2 py-0.5 rounded">
                            Заблокирован ({user.blockedReason || 'Причина не указана'})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>{user.email}</span>
                        <span>·</span>
                        <span>{user.role === 'employer' ? 'Работодатель' : 'Работник/мастер'}</span>
                        {user.city && <span>· {user.city}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBlockUser(user)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                          user.isBlocked
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{user.isBlocked ? 'Разблокировать' : 'Заблокировать'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Удалить аккаунт</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. REPORTS MODERATION */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Жалобы от пользователей</h3>
              {allReports.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">Жалоб нет. Все объявления соответствуют правилам.</p>
              ) : (
                <div className="space-y-2">
                  {allReports.map((rep) => (
                    <div key={rep.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-rose-700 block mb-0.5">Причина: {rep.reason}</span>
                        <span className="text-slate-700">Объект: {rep.targetTitle || rep.targetListingId || 'Пользователь'}</span>
                        <span className="text-slate-400 block mt-0.5">Дата: {new Date(rep.createdAt).toLocaleString('ru-RU')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => store.updateReportStatus(rep.id, 'resolved')}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
                        >
                          Решено
                        </button>
                        <button
                          onClick={() => store.updateReportStatus(rep.id, 'dismissed')}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300"
                        >
                          Отклонить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. OWNER AD MANAGER */}
          {activeTab === 'ads' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Рекламные кампании владельца</h3>
                  <p className="text-xs text-slate-500">Управляйте баннерами и прямыми ссылками на WhatsApp каналы</p>
                </div>
                <button
                  onClick={() => setShowAddAdModal(true)}
                  className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить рекламу</span>
                </button>
              </div>

              {showAddAdModal && (
                <form onSubmit={handleSaveAd} className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-emerald-950">Новый рекламный блок</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Заголовок рекламы"
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      className="text-xs p-2.5 bg-white border border-emerald-300 rounded-xl"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Ссылка (URL или https://wa.me/...)"
                      value={adLinkUrl}
                      onChange={(e) => setAdLinkUrl(e.target.value)}
                      className="text-xs p-2.5 bg-white border border-emerald-300 rounded-xl"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Короткий рекламный текст"
                    value={adDesc}
                    onChange={(e) => setAdDesc(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-emerald-300 rounded-xl"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <select
                      value={adPlacement}
                      onChange={(e) => setAdPlacement(e.target.value as any)}
                      className="text-xs p-2.5 bg-white border border-emerald-300 rounded-xl"
                    >
                      <option value="hero">Вверху главной (Hero)</option>
                      <option value="feed">Между объявлениями (Feed)</option>
                    </select>

                    <label className="flex items-center gap-2 text-xs font-semibold text-emerald-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adIsWhatsapp}
                        onChange={(e) => setAdIsWhatsapp(e.target.checked)}
                      />
                      <span>Прямой чат WhatsApp</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Текст сообщения WhatsApp"
                      value={adWhatsappMsg}
                      onChange={(e) => setAdWhatsappMsg(e.target.value)}
                      className="text-xs p-2 bg-white border border-emerald-300 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAdModal(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-xl"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                    >
                      Сохранить и включить
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {allAds.map((ad) => (
                  <div key={ad.id} className="p-3.5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={ad.imageUrl} alt={ad.title} className="w-16 h-12 object-cover rounded-xl" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{ad.title}</h4>
                        <p className="text-xs text-slate-500">{ad.description}</p>
                        <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                          Переходов: {ad.clicksCount} · Размещение: {ad.placement === 'hero' ? 'Главная (верх)' : 'В ленте'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => store.updateOwnerAd(ad.id, { isActive: !ad.isActive })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                          ad.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ad.isActive ? 'Активна' : 'Приостановлена'}
                      </button>
                      <button
                        onClick={() => store.deleteOwnerAd(ad.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. GOOGLE ADSENSE PREPARATION */}
          {activeTab === 'adsense' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <h3 className="text-sm font-bold text-blue-900 mb-2">Подготовка к подключению Google AdSense</h3>
                <p className="text-xs text-blue-800 leading-relaxed mb-3">
                  Сайт полностью подготовлен к официальной монетизации через Google AdSense. Предусмотрены рекламные контейнеры стандартных форматов (728x90, 300x250, Responsive In-Feed).
                </p>
                <div className="space-y-2 text-xs text-blue-900 bg-white/70 p-3 rounded-xl">
                  <span className="font-bold block">Что необходимо сделать после публикации сайта:</span>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Зарегистрироваться в <a href="https://adsense.google.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">Google AdSense</a>.</li>
                    <li>Добавить опубликованный рабочий домен сайта в панель AdSense.</li>
                    <li>Разместить файл <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">ads.txt</code> в корень домена (готовый шаблон в <code className="font-mono">/public/ads.txt</code>).</li>
                    <li>Дождаться одобрения от модерации Google (обычно от 24 до 72 часов).</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* 7. SUPABASE DATABASE CONFIG */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <h3 className="text-sm font-bold text-emerald-950 mb-1">
                  Подключение Supabase проекта
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed mb-3">
                  Проект Supabase: <span className="font-mono font-bold">https://ygnbitwwflzyfhjktlje.supabase.co</span>
                </p>

                <form onSubmit={handleSaveSupabaseConfig} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Supabase Anon (Public) Key:
                    </label>
                    <input
                      type="password"
                      value={supabaseAnonInput}
                      onChange={(e) => setSupabaseAnonInput(e.target.value)}
                      placeholder="Вставьте anon public key из панели Supabase -> API Settings..."
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Ключ хранится безопасно и используется только для публичных запросов
                    </span>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                    >
                      {supabaseSaved ? 'Сохранено!' : 'Сохранить ключ'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Ready SQL Schema */}
              <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Схема базы данных (SQL)</span>
                  <button
                    onClick={handleCopySql}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{sqlCopied ? 'Скопировано!' : 'Скопировать путь к SQL'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Полная схема с таблицами profiles, listings, favorites, messages, ads, RLS политиками и триггером Google Auth сохранена в файле <code className="text-emerald-300">/supabase_schema.sql</code>. Выполните её в Supabase SQL Editor.
                </p>
              </div>
            </div>
          )}

          {/* 8. ADMIN LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Журнал действий администратора</h3>
              {adminLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">История действий пока пуста.</p>
              ) : (
                <div className="space-y-2 max-h-[450px] overflow-y-auto">
                  {adminLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{log.actionType}</span>
                        <span className="text-slate-600">{log.reason || 'Без описания'}</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Администратор: {log.adminEmail}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleString('ru-RU')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
          </>
        )}

      </div>
    </div>
  );
};
