import React, { useState, useMemo } from 'react';
import { UserProfile, Listing, OwnerAd, Report, AdminLog, CountryCode, AccountRole } from '../types';
import { store } from '../lib/store';
import { COUNTRIES } from '../data/locations';
import { getSupabaseConfig, setSupabaseConfig } from '../lib/supabase';
import { getGoogleClientId, setStoredGoogleClientId } from '../lib/googleAuth';
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
  CheckCircle2,
  Copy,
  Plus,
  ExternalLink,
  MessageCircle,
  ShieldAlert,
  Clock,
  History,
  ArrowLeft,
  KeyRound,
  Lock,
  Unlock,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Server,
  Layers,
  Check,
  RefreshCw,
  Sliders,
  ChevronRight,
  UserX
} from 'lucide-react';

interface AdminPanelModalProps {
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenListing: (listing: Listing) => void;
  onEditListing: (listing: Listing) => void;
}

type TabType =
  | 'overview'
  | 'listings'
  | 'users'
  | 'reports'
  | 'ads'
  | 'bans'
  | 'roles'
  | 'system'
  | 'logs';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  onClose,
  currentUser,
  onOpenListing,
  onEditListing,
}) => {
  // Current user's role check
  const isOwner = currentUser?.isOwner || currentUser?.accountRole === 'owner';
  const isAdmin = isOwner || currentUser?.isAdmin || currentUser?.accountRole === 'admin';
  const isServerVerified = store.isServerAdminVerified();

  // Allow access if user is verified as owner/admin, or if server token is verified
  const hasAccess = isAdmin || isServerVerified;

  // Secret Key claim form state
  const [claimSecretInput, setClaimSecretInput] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Search & Filter states
  const [listingSearch, setListingSearch] = useState('');
  const [listingFilter, setListingFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'reviewing' | 'resolved' | 'dismissed'>('all');
  const [logSearch, setLogSearch] = useState('');

  // Store data getters (reactive through store subscription)
  const allUsers = store.getAllUsers();
  const allListings = store.getListings();
  const allReports = store.getReports();
  const allAds = store.getOwnerAds();
  const adminLogs = store.getAdminLogs();

  // Ad Form Modal state
  const [editingAd, setEditingAd] = useState<OwnerAd | null>(null);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adImageUrl, setAdImageUrl] = useState('/src/assets/images/craftsman_tools_1793120744947.jpg');
  const [adLinkUrl, setAdLinkUrl] = useState('https://wa.me/992900000000');
  const [adButtonText, setAdButtonText] = useState('Связаться в WhatsApp');
  const [adIsWhatsapp, setAdIsWhatsapp] = useState(true);
  const [adWhatsappMsg, setAdWhatsappMsg] = useState('Здравствуйте! Я с сайта РАБОТА ТҶ');
  const [adPlacement, setAdPlacement] = useState<'hero' | 'feed' | 'banner'>('feed');
  const [adOrderIndex, setAdOrderIndex] = useState(1);
  const [adIsActive, setAdIsActive] = useState(true);

  // Settings State
  const supabaseCfg = getSupabaseConfig();
  const [supabaseAnonInput, setSupabaseAnonInput] = useState(supabaseCfg.anonKey);
  const [supabaseSaved, setSupabaseSaved] = useState(false);
  const [googleClientIdInput, setGoogleClientIdInput] = useState(() => getGoogleClientId());
  const [googleClientSaved, setGoogleClientSaved] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Stats calculation
  const totalViews = useMemo(() => allListings.reduce((sum, l) => sum + l.viewsCount, 0), [allListings]);
  const totalAdClicks = useMemo(() => allAds.reduce((sum, a) => sum + a.clicksCount, 0), [allAds]);
  const activeAdsCount = useMemo(() => allAds.filter(a => a.isActive).length, [allAds]);
  const hiddenListingsCount = useMemo(() => allListings.filter(l => l.isHiddenByAdmin).length, [allListings]);
  const pendingReportsCount = useMemo(() => allReports.filter(r => r.status === 'pending').length, [allReports]);
  const bannedUsersList = useMemo(() => allUsers.filter(u => u.isBlocked), [allUsers]);

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return allListings.filter(l => {
      if (listingFilter === 'active' && (l.isHiddenByAdmin || !l.isActive)) return false;
      if (listingFilter === 'hidden' && !l.isHiddenByAdmin) return false;
      if (listingSearch.trim()) {
        const q = listingSearch.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.authorName.toLowerCase().includes(q) ||
          l.profession.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allListings, listingFilter, listingSearch]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.city && u.city.toLowerCase().includes(q))
      );
    });
  }, [allUsers, userSearch]);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return allReports.filter(r => {
      if (reportFilter === 'all') return true;
      return r.status === reportFilter;
    });
  }, [allReports, reportFilter]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return adminLogs.filter(log => {
      if (!logSearch.trim()) return true;
      const q = logSearch.toLowerCase();
      return (
        log.adminEmail.toLowerCase().includes(q) ||
        log.actionType.toLowerCase().includes(q) ||
        (log.reason && log.reason.toLowerCase().includes(q)) ||
        log.targetId.toLowerCase().includes(q)
      );
    });
  }, [adminLogs, logSearch]);

  // 1. Claim Owner Handler
  const handleClaimOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError('');
    setClaimSuccess('');
    setClaimLoading(true);

    if (!currentUser) {
      setClaimLoading(false);
      setClaimError('Сначала войдите через свой Google аккаунт на сайте, чтобы привязать статус Владельца к вашему профилю.');
      return;
    }

    const res = await store.claimOwnerWithSecret(claimSecretInput.trim(), currentUser);
    setClaimLoading(false);
    if (res.success) {
      setClaimSuccess(res.message);
      setClaimSecretInput('');
    } else {
      setClaimError(res.message);
    }
  };

  // 2. Listing Moderation Actions
  const handleToggleHideListing = (id: string, currentlyHidden: boolean) => {
    const reason = prompt(
      currentlyHidden ? 'Причина восстановления объявления в ленту:' : 'Укажите причину скрытия объявления от пользователей:',
      currentlyHidden ? 'Проверка пройдена успешно' : 'Нарушение правил публикации или недостоверная информация'
    );
    if (reason !== null) {
      store.toggleListingAdminVisibility(id, !currentlyHidden, reason);
    }
  };

  const handleDeleteListing = (id: string, title: string) => {
    if (window.confirm(`Вы действительно хотите удалить объявление «${title}» навсегда?`)) {
      const reason = prompt('Причина удаления объявления:', 'Спам / неактуально');
      if (reason !== null) {
        store.deleteListing(id, reason);
      }
    }
  };

  const handleDeleteAllUserListings = (userId: string, userName: string) => {
    if (window.confirm(`Удалить ВСЕ объявления пользователя «${userName}»? Это действие необратимо.`)) {
      const reason = prompt('Причина массового удаления:', 'Массовый спам / нарушение правил');
      if (reason !== null) {
        store.deleteAllUserListings(userId, reason);
      }
    }
  };

  // 3. User Moderation Actions
  const handleToggleBlockUser = (user: UserProfile) => {
    if (user.isBlocked) {
      if (window.confirm(`Разблокировать пользователя ${user.fullName} (${user.email})?`)) {
        store.updateUserStatus(user.id, false);
      }
    } else {
      const reason = prompt(`Укажите причину блокировки пользователя ${user.fullName}:`, 'Систематическое нарушение правил платформы');
      if (reason) {
        const duration = prompt('Срок блокировки (например: Навсегда, 7 дней, 30 дней):', 'Навсегда') || 'Навсегда';
        store.updateUserStatus(user.id, true, reason, duration);
      }
    }
  };

  const handleDeleteUserAccount = (user: UserProfile) => {
    if (user.isOwner || user.accountRole === 'owner') {
      alert('Запрещено: невозможно удалить Главного Владельца сайта!');
      return;
    }
    if (window.confirm(`ВНИМАНИЕ! Вы собираетесь навсегда удалить аккаунт «${user.fullName}» (${user.email}) и все его объявления. Подтвердить?`)) {
      const reason = prompt('Причина полного удаления аккаунта:', 'Грубое нарушение правил сообщества');
      if (reason !== null) {
        store.deleteUser(user.id, reason);
      }
    }
  };

  // 4. Role Assignment (Only for Owner)
  const handleRoleChange = (userId: string, currentRole: AccountRole | undefined) => {
    if (!isOwner) {
      alert('Только Главный Владелец сайта (owner) может назначать или изменять роли!');
      return;
    }
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;

    if (target.isOwner || target.accountRole === 'owner') {
      alert('Невозможно изменить роль Владельца сайта.');
      return;
    }

    const newRole: AccountRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMsg = newRole === 'admin'
      ? `Назначить пользователя ${target.fullName} Администратором сайта? Он получит доступ к модерации объявлений и пользователей.`
      : `Снять права администратора с пользователя ${target.fullName}? Он станет обычным пользователем.`;

    if (window.confirm(confirmMsg)) {
      const res = store.updateUserRole(userId, newRole, currentUser);
      alert(res.message);
    }
  };

  // 5. Reports Actions
  const handleResolveReport = (report: Report, status: 'resolved' | 'dismissed') => {
    const notes = prompt(
      status === 'resolved' ? 'Примечание о принятых мерах:' : 'Причина отклонения жалобы:',
      status === 'resolved' ? 'Объявление проверено / меры приняты' : 'Нарушений не обнаружено'
    );
    if (notes !== null) {
      store.updateReportStatus(report.id, status, notes, currentUser?.email);
    }
  };

  // 6. Ads Manager Actions
  const handleOpenCreateAd = () => {
    setEditingAd(null);
    setAdTitle('');
    setAdDesc('');
    setAdImageUrl('/src/assets/images/craftsman_tools_1793120744947.jpg');
    setAdLinkUrl('https://wa.me/992900000000');
    setAdButtonText('Связаться в WhatsApp');
    setAdIsWhatsapp(true);
    setAdWhatsappMsg('Здравствуйте! Я с сайта РАБОТА ТҶ');
    setAdPlacement('feed');
    setAdOrderIndex(allAds.length + 1);
    setAdIsActive(true);
    setIsAdModalOpen(true);
  };

  const handleOpenEditAd = (ad: OwnerAd) => {
    setEditingAd(ad);
    setAdTitle(ad.title);
    setAdDesc(ad.description);
    setAdImageUrl(ad.imageUrl);
    setAdLinkUrl(ad.linkUrl);
    setAdButtonText(ad.buttonText || (ad.isWhatsapp ? 'Открыть в WhatsApp' : 'Подробнее'));
    setAdIsWhatsapp(ad.isWhatsapp);
    setAdWhatsappMsg(ad.whatsappMessage || '');
    setAdPlacement(ad.placement);
    setAdOrderIndex(ad.orderIndex ?? 1);
    setAdIsActive(ad.isActive);
    setIsAdModalOpen(true);
  };

  const handleSaveAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adLinkUrl.trim()) {
      alert('Пожалуйста, заполните заголовок и ссылку рекламного объявления.');
      return;
    }

    // Validate link format
    let cleanLink = adLinkUrl.trim();
    if (!cleanLink.startsWith('http://') && !cleanLink.startsWith('https://') && !cleanLink.startsWith('wa.me') && !cleanLink.startsWith('t.me')) {
      cleanLink = 'https://' + cleanLink;
    }

    if (editingAd) {
      store.updateOwnerAd(editingAd.id, {
        title: adTitle.trim(),
        description: adDesc.trim(),
        imageUrl: adImageUrl.trim(),
        linkUrl: cleanLink,
        buttonText: adButtonText.trim(),
        isWhatsapp: adIsWhatsapp,
        whatsappMessage: adWhatsappMsg.trim(),
        placement: adPlacement,
        orderIndex: Number(adOrderIndex) || 1,
        isActive: adIsActive,
      });
    } else {
      store.addOwnerAd({
        title: adTitle.trim(),
        description: adDesc.trim(),
        imageUrl: adImageUrl.trim(),
        linkUrl: cleanLink,
        buttonText: adButtonText.trim(),
        isWhatsapp: adIsWhatsapp,
        whatsappMessage: adWhatsappMsg.trim(),
        placement: adPlacement,
        orderIndex: Number(adOrderIndex) || (allAds.length + 1),
        isActive: adIsActive,
      });
    }

    setIsAdModalOpen(false);
  };

  const handleToggleAdActive = (ad: OwnerAd) => {
    store.updateOwnerAd(ad.id, { isActive: !ad.isActive });
  };

  const handleDeleteAd = (ad: OwnerAd) => {
    if (window.confirm(`Удалить рекламную кампанию «${ad.title}»?`)) {
      store.deleteOwnerAd(ad.id);
    }
  };

  // 7. System config handlers
  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseConfig(supabaseCfg.url, supabaseAnonInput.trim());
    setSupabaseSaved(true);
    setTimeout(() => setSupabaseSaved(false), 2500);
  };

  const handleSaveGoogleClient = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredGoogleClientId(googleClientIdInput.trim());
    setGoogleClientSaved(true);
    setTimeout(() => setGoogleClientSaved(false), 2500);
  };

  const handleCopySql = () => {
    const sqlCode = `-- РАБОТА ТҶ: Назначение Владельца сайта (Owner)
UPDATE public.profiles
SET app_role = 'owner', is_admin = true
WHERE email = '${currentUser?.email || 'your-google-email@gmail.com'}';`;
    navigator.clipboard.writeText(sqlCode);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-colors shrink-0 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Назад</span>
            </button>
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
              ТҶ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Панель управления «РАБОТА ТҶ»
                </h2>
                {isOwner && (
                  <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md uppercase tracking-wider">
                    Владелец
                  </span>
                )}
                {isAdmin && !isOwner && (
                  <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-md uppercase tracking-wider">
                    Админ
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Безопасная система администрирования, рекламы и модерации всех 10 стран СНГ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACCESS DENIED / OWNER CLAIM GATEWAY */}
        {!hasAccess ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">
                Доступ ограничен
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Панель управления предназначена исключительно для владельца и назначенных администраторов сайта «РАБОТА ТҶ».
              </p>
            </div>

            {currentUser ? (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-left space-y-3">
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    Активация статуса Владельца (Owner)
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Вы вошли как <strong className="text-slate-900">{currentUser.email}</strong>. Если вы являетесь владельцем сайта, введите секретный мастер-ключ:
                </p>

                {claimError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                    {claimError}
                  </div>
                )}
                {claimSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                    {claimSuccess}
                  </div>
                )}

                <form onSubmit={handleClaimOwner} className="space-y-3 pt-1">
                  <input
                    type="password"
                    required
                    placeholder="Секретный мастер-ключ владельца..."
                    value={claimSecretInput}
                    onChange={(e) => setClaimSecretInput(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={claimLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-60"
                  >
                    {claimLoading ? 'Проверка прав...' : 'Подтвердить статус Владельца'}
                  </button>
                </form>

                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-200/80">
                  Вы также можете применить SQL-скрипт прямо в панели Supabase SQL Editor:
                  <code className="block mt-1 p-2 bg-slate-200/60 rounded-lg text-slate-800 font-mono text-[10px] break-all">
                    UPDATE profiles SET app_role = 'owner', is_admin = true WHERE email = '{currentUser.email}';
                  </code>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 text-left">
                <strong>Требуется авторизация:</strong> Сначала войдите через свой Google аккаунт на сайте, после чего вы сможете активировать доступ владельца.
              </div>
            )}

            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Вернуться на сайт
            </button>
          </div>
        ) : (
          /* FULL ADMIN INTERFACE */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 bg-slate-50 border-r border-slate-200 p-2 sm:p-3 overflow-x-auto md:overflow-y-auto shrink-0 flex md:flex-col gap-1 border-b md:border-b-0">
              
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>1. Обзор и статистика</span>
              </button>

              <button
                onClick={() => setActiveTab('listings')}
                className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'listings' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>2. Объявления</span>
                </div>
                {hiddenListingsCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'listings' ? 'bg-white text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {hiddenListingsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'users' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>3. Пользователи</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'users' ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                  {allUsers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'reports' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>4. Жалобы</span>
                </div>
                {pendingReportsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-500 text-white">
                    {pendingReportsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('ads')}
                className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'ads' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 shrink-0" />
                  <span>5. Реклама</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'ads' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {activeAdsCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('bans')}
                className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'bans' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Ban className="w-4 h-4 shrink-0" />
                  <span>6. Блокировки</span>
                </div>
                {bannedUsersList.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'bans' ? 'bg-white text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {bannedUsersList.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('roles')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'roles' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>7. Роли и доступ</span>
              </button>

              <button
                onClick={() => setActiveTab('system')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'system' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Database className="w-4 h-4 shrink-0" />
                <span>8. Состояние</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'logs' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <History className="w-4 h-4 shrink-0" />
                <span>9. Журнал</span>
              </button>

            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/50">
              
              {/* TAB 1: OVERVIEW & STATS */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                      Обзор платформы «РАБОТА ТҶ»
                    </h3>
                    <p className="text-xs text-slate-500">
                      Сводная статистика платформы по всем странам СНГ в реальном времени
                    </p>
                  </div>

                  {/* Top Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Пользователи</span>
                        <Users className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">{allUsers.length}</div>
                      <div className="text-[11px] text-slate-500 mt-1">Зарегистрировано в системе</div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Объявления</span>
                        <FileText className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">{allListings.length}</div>
                      <div className="text-[11px] text-emerald-600 mt-1">Просмотров: {totalViews}</div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Реклама</span>
                        <Megaphone className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">{activeAdsCount}</div>
                      <div className="text-[11px] text-emerald-600 mt-1">Кликов по рекламе: {totalAdClicks}</div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Жалобы</span>
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="text-2xl font-black text-rose-600">{pendingReportsCount}</div>
                      <div className="text-[11px] text-slate-500 mt-1">Требуют рассмотрения</div>
                    </div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Категории объявлений
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-600">Вакансии (предложения работы):</span>
                          <span className="font-bold text-slate-900">{allListings.filter(l => l.type === 'offering_job').length}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-600">Резюме (ищут работу):</span>
                          <span className="font-bold text-slate-900">{allListings.filter(l => l.type === 'looking_for_job').length}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-600">Мастера и услуги:</span>
                          <span className="font-bold text-slate-900">{allListings.filter(l => l.type === 'offering_service').length}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-600">Такси и попутные поездки:</span>
                          <span className="font-bold text-slate-900">{allListings.filter(l => l.type === 'taxi_driver' || l.type === 'taxi_passenger').length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Безопасность и ограничения
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-600">Скрыто модератором:</span>
                          <span className="font-bold text-amber-600">{hiddenListingsCount}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-600">Заблокировано пользователей:</span>
                          <span className="font-bold text-rose-600">{bannedUsersList.length}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-600">Владелец сайта:</span>
                          <span className="font-bold text-slate-900">{currentUser?.email}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-600">Официальная база данных:</span>
                          <span className="font-bold text-emerald-600">Supabase Connected</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: LISTINGS MODERATION */}
              {activeTab === 'listings' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Модерация объявлений ({filteredListings.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Просмотр, скрытие нарушений и удаление спама во всех странах СНГ
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                      <button
                        onClick={() => setListingFilter('all')}
                        className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                          listingFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Все ({allListings.length})
                      </button>
                      <button
                        onClick={() => setListingFilter('active')}
                        className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                          listingFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Активные
                      </button>
                      <button
                        onClick={() => setListingFilter('hidden')}
                        className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                          listingFilter === 'hidden' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Скрытые ({hiddenListingsCount})
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Поиск по названию, автору, городу, профессии..."
                      value={listingSearch}
                      onChange={(e) => setListingSearch(e.target.value)}
                      className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Listings Table / Cards */}
                  <div className="space-y-2.5">
                    {filteredListings.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                        Объявлений не найдено.
                      </div>
                    ) : (
                      filteredListings.map((l) => (
                        <div
                          key={l.id}
                          className={`p-3.5 sm:p-4 bg-white rounded-2xl border transition-all ${
                            l.isHiddenByAdmin ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{COUNTRIES[l.countryCode]?.flag || '🌐'}</span>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                  {l.city}, {COUNTRIES[l.countryCode]?.nameRu}
                                </span>
                                {l.isHiddenByAdmin && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                                    Скрыто модератором
                                  </span>
                                )}
                              </div>
                              <h4
                                onClick={() => onOpenListing(l)}
                                className="text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-600 cursor-pointer line-clamp-1"
                              >
                                {l.title}
                              </h4>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                <span>Автор: <strong>{l.authorName}</strong></span>
                                <span>·</span>
                                <span>{l.isNegotiable ? 'Договорная' : `${l.price?.toLocaleString()} ${l.currency}`}</span>
                                <span>·</span>
                                <span>Просмотров: {l.viewsCount}</span>
                              </div>
                            </div>

                            {/* Moderation Controls */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => onOpenListing(l)}
                                className="p-2 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                                title="Открыть объявление"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleHideListing(l.id, l.isHiddenByAdmin)}
                                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                  l.isHiddenByAdmin
                                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                                title={l.isHiddenByAdmin ? 'Восстановить в ленту' : 'Скрыть от пользователей'}
                              >
                                {l.isHiddenByAdmin ? <EyeOff className="w-4 h-4 text-amber-800" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleDeleteListing(l.id, l.title)}
                                className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                                title="Удалить объявление навсегда"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAllUserListings(l.userId, l.authorName)}
                                className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                                title="Удалить ВСЕ объявления этого автора"
                              >
                                Удалить все у автора
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: USER MANAGEMENT */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Управление пользователями ({filteredUsers.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Просмотр зарегистрированных Google-аккаунтов, блокировка и защита от спама
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Поиск по имени, email, городу..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2.5">
                    {filteredUsers.map((u) => {
                      const userAdsCount = allListings.filter(l => l.userId === u.id).length;
                      const isOwnerUser = u.isOwner || u.accountRole === 'owner';
                      const isAdminUser = isOwnerUser || u.isAdmin || u.accountRole === 'admin';

                      return (
                        <div
                          key={u.id}
                          className={`p-4 bg-white rounded-2xl border transition-all ${
                            u.isBlocked ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {u.avatarUrl ? (
                                <img
                                  src={u.avatarUrl}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-full object-cover border border-emerald-500 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                                  {u.fullName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm font-bold text-slate-900">{u.fullName}</span>
                                  {isOwnerUser && (
                                    <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded uppercase">
                                      Владелец
                                    </span>
                                  )}
                                  {isAdminUser && !isOwnerUser && (
                                    <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[9px] font-black rounded uppercase">
                                      Админ
                                    </span>
                                  )}
                                  {u.isBlocked && (
                                    <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-bold rounded uppercase">
                                      Заблокирован
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {u.email} · {u.city || 'Душанбе'} · Объявлений: <strong className="text-slate-800">{userAdsCount}</strong>
                                </div>
                                {u.isBlocked && u.blockedReason && (
                                  <div className="text-[10px] text-rose-700">
                                    Причина: {u.blockedReason}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* User Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleToggleBlockUser(u)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                                  u.isBlocked
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                              >
                                {u.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                              </button>

                              {!isOwnerUser && (
                                <button
                                  onClick={() => handleDeleteUserAccount(u)}
                                  className="p-1.5 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                                  title="Удалить аккаунт навсегда"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: COMPLAINTS & MODERATION (REPORTS) */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Жалобы пользователей ({filteredReports.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Модерация жалоб на спам, мошенничество или неподобающие материалы
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                      {(['all', 'pending', 'resolved', 'dismissed'] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => setReportFilter(st)}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer capitalize ${
                            reportFilter === st ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {st === 'all' ? 'Все' : st === 'pending' ? 'Новые' : st === 'resolved' ? 'Решенные' : 'Отклоненные'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {filteredReports.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                        Жалоб в этой категории нет.
                      </div>
                    ) : (
                      filteredReports.map(rep => {
                        const targetListing = allListings.find(l => l.id === rep.targetListingId);
                        return (
                          <div key={rep.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                                    rep.status === 'pending'
                                      ? 'bg-rose-100 text-rose-800'
                                      : rep.status === 'resolved'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {rep.status === 'pending' ? 'Ожидает решения' : rep.status === 'resolved' ? 'Решено' : 'Отклонено'}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {new Date(rep.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                  Причина: <span className="text-rose-600">{rep.reason}</span>
                                </h4>
                                {rep.details && (
                                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    «{rep.details}»
                                  </p>
                                )}
                              </div>
                            </div>

                            {targetListing && (
                              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Объект жалобы:</span>
                                  <strong className="text-slate-800">{targetListing.title}</strong>
                                </div>
                                <button
                                  onClick={() => onOpenListing(targetListing)}
                                  className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer"
                                >
                                  Открыть
                                </button>
                              </div>
                            )}

                            {/* Action Buttons */}
                            {rep.status === 'pending' && (
                              <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                                {targetListing && (
                                  <button
                                    onClick={() => {
                                      store.toggleListingAdminVisibility(targetListing.id, true, `Жалоба: ${rep.reason}`);
                                      handleResolveReport(rep, 'resolved');
                                    }}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
                                  >
                                    Скрыть объявление и решить
                                  </button>
                                )}
                                <button
                                  onClick={() => handleResolveReport(rep, 'resolved')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
                                >
                                  Пометить решённой
                                </button>
                                <button
                                  onClick={() => handleResolveReport(rep, 'dismissed')}
                                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                                >
                                  Отклонить
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: ADS & BANNERS MANAGER */}
              {activeTab === 'ads' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Реклама и баннеры ({allAds.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Управление рекламными баннерами, ссылками WhatsApp/Telegram и порядком показа
                      </p>
                    </div>

                    <button
                      onClick={handleOpenCreateAd}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Добавить рекламу</span>
                    </button>
                  </div>

                  {/* Ads List */}
                  <div className="space-y-3">
                    {allAds.map((ad) => (
                      <div
                        key={ad.id}
                        className={`p-4 bg-white rounded-2xl border transition-all ${
                          ad.isActive ? 'border-slate-200' : 'border-slate-200 bg-slate-50 opacity-70'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <img
                              src={ad.imageUrl}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-16 h-14 sm:w-20 sm:h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase ${
                                  ad.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {ad.isActive ? 'Активна' : 'Приостановлена'}
                                </span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold rounded-md uppercase">
                                  {ad.placement === 'hero' ? 'Главный (Hero)' : ad.placement === 'feed' ? 'В ленте' : 'Баннер'}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  Позиция #{ad.orderIndex ?? 1}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                                {ad.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {ad.description}
                              </p>
                              <div className="text-[11px] text-slate-400">
                                Кликов: <strong className="text-emerald-700">{ad.clicksCount}</strong> · Ссылка: <span className="font-mono text-[10px] text-slate-600">{ad.linkUrl}</span>
                              </div>
                            </div>
                          </div>

                          {/* Ad Controls */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleToggleAdActive(ad)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer ${
                                ad.isActive
                                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              }`}
                            >
                              {ad.isActive ? 'Приостановить' : 'Включить'}
                            </button>
                            <button
                              onClick={() => handleOpenEditAd(ad)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                            >
                              Изменить
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad)}
                              className="p-1.5 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                              title="Удалить рекламу"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 6: BANNED USERS */}
              {activeTab === 'bans' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Блокировки и ограничения ({bannedUsersList.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Список заблокированных пользователей. Заблокированные пользователи не могут публиковать объявления.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {bannedUsersList.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                        Активных блокировок нет. Все пользователи соблюдают правила.
                      </div>
                    ) : (
                      bannedUsersList.map(u => (
                        <div key={u.id} className="p-4 bg-white rounded-2xl border border-rose-200 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm shrink-0">
                              <UserX className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                {u.fullName} <span className="text-[11px] font-normal text-slate-500">({u.email})</span>
                              </h4>
                              <p className="text-xs text-rose-700">
                                Причина блокировки: <strong>{u.blockedReason || 'Систематические нарушения'}</strong>
                              </p>
                              {u.blockedAt && (
                                <p className="text-[10px] text-slate-400">
                                  Дата блокировки: {new Date(u.blockedAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleToggleBlockUser(u)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer active:scale-95 transition-all shrink-0"
                          >
                            Разблокировать
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: ROLES & PERMISSIONS */}
              {activeTab === 'roles' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Администраторы и распределение ролей
                    </h3>
                    <p className="text-xs text-slate-500">
                      Владелец сайта (Owner) имеет полный контроль и может назначать или отзывать права модераторов
                    </p>
                  </div>

                  {/* Role Legend */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>owner (Владелец)</span>
                      </span>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Полный контроль: реклама, модерация, назначение/снятие администраторов, системные параметры.
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>admin (Администратор)</span>
                      </span>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Модерация объявлений, пользователей, жалоб и просмотр статистики платформы.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-600" />
                        <span>user (Пользователь)</span>
                      </span>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        Стандартный пользователь: публикация своих объявлений, избранное и чат.
                      </p>
                    </div>
                  </div>

                  {/* Users with Elevated Roles */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 font-bold text-xs text-slate-800">
                      Список пользователей с повышенными привилегиями
                    </div>
                    <div className="divide-y divide-slate-100">
                      {allUsers
                        .filter(u => u.isOwner || u.isAdmin || u.accountRole === 'owner' || u.accountRole === 'admin')
                        .map(u => {
                          const isOwn = u.isOwner || u.accountRole === 'owner';
                          return (
                            <div key={u.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                                  {u.fullName.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <strong className="text-slate-900">{u.fullName}</strong>
                                    <span className={`px-1.5 py-0.2 text-[9px] font-black rounded uppercase ${
                                      isOwn ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-white'
                                    }`}>
                                      {isOwn ? 'Владелец' : 'Администратор'}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-500">{u.email}</span>
                                </div>
                              </div>

                              {isOwner && !isOwn && (
                                <button
                                  onClick={() => handleRoleChange(u.id, u.accountRole)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg cursor-pointer"
                                >
                                  Снять права админа
                                </button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Grant Admin to Users */}
                  {isOwner && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Назначить нового администратора
                      </h4>
                      <p className="text-xs text-slate-500">
                        Выберите любого зарегистрированного пользователя, чтобы повысить его до Администратора сайта:
                      </p>

                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                        {allUsers
                          .filter(u => !u.isOwner && u.accountRole !== 'owner' && u.accountRole !== 'admin')
                          .map(u => (
                            <div key={u.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                              <div>
                                <span className="font-bold text-slate-800">{u.fullName}</span>
                                <span className="text-[11px] text-slate-400 ml-2">{u.email}</span>
                              </div>
                              <button
                                onClick={() => handleRoleChange(u.id, u.accountRole)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-[11px] rounded-lg cursor-pointer"
                              >
                                Сделать админом
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Supabase SQL instructions */}
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400">Прямое назначение через Supabase SQL Console:</span>
                      <button
                        onClick={handleCopySql}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg cursor-pointer"
                      >
                        {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{sqlCopied ? 'Скопировано' : 'Копировать SQL'}</span>
                      </button>
                    </div>
                    <pre className="font-mono text-[11px] bg-slate-950 p-3 rounded-xl overflow-x-auto text-emerald-300">
{`UPDATE public.profiles
SET app_role = 'owner', is_admin = true
WHERE email = '${currentUser?.email || 'your-google-email@gmail.com'}';`}
                    </pre>
                  </div>

                </div>
              )}

              {/* TAB 8: SYSTEM STATUS & CONFIG */}
              {activeTab === 'system' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Настройки и состояние интеграций
                    </h3>
                    <p className="text-xs text-slate-500">
                      Подключение Supabase, Google Identity Services, Vercel и диагностика сервера
                    </p>
                  </div>

                  {/* Supabase Config */}
                  <form onSubmit={handleSaveSupabase} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Подключение Supabase (PostgreSQL & Auth)
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                        ygnbitwwflzyfhjktlje
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Supabase Project URL
                        </label>
                        <input
                          type="text"
                          readOnly
                          value="https://ygnbitwwflzyfhjktlje.supabase.co"
                          className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Supabase Anon Key (VITE_SUPABASE_ANON_KEY)
                        </label>
                        <input
                          type="text"
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          value={supabaseAnonInput}
                          onChange={(e) => setSupabaseAnonInput(e.target.value)}
                          className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          {supabaseSaved ? 'Сохранено!' : 'Сохранить ключ'}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Google Client ID Config */}
                  <form onSubmit={handleSaveGoogleClient} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Google Cloud OAuth Client ID (VITE_GOOGLE_CLIENT_ID)
                      </h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Web Client ID из Google Cloud Console
                        </label>
                        <input
                          type="text"
                          placeholder="123456789-abcdef.apps.googleusercontent.com"
                          value={googleClientIdInput}
                          onChange={(e) => setGoogleClientIdInput(e.target.value)}
                          className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        {googleClientSaved ? 'Сохранено!' : 'Сохранить Google Client ID'}
                      </button>
                    </div>
                  </form>

                  {/* Direct ZIP Download */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Резервная копия проекта
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Скачать полный архив исходного кода сайта rabota-tj-source.zip
                      </p>
                    </div>
                    <a
                      href="/api/download-source"
                      download="rabota-tj-source.zip"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Скачать ZIP
                    </a>
                  </div>

                </div>
              )}

              {/* TAB 9: AUDIT LOGS */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Журнал административных действий ({filteredLogs.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Аудит всех операций модерации, скрытия, блокировок и изменения ролей
                      </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Поиск по действиям..."
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filteredLogs.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                        Записей в журнале действий пока нет.
                      </div>
                    ) : (
                      filteredLogs.map(log => (
                        <div key={log.id} className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded">
                                {log.actionType}
                              </span>
                              <span className="font-semibold text-slate-800">{log.adminEmail}</span>
                            </div>
                            {log.reason && (
                              <p className="text-[11px] text-slate-600">
                                {log.reason}
                              </p>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* CREATE / EDIT AD MODAL WITH LIVE PREVIEW */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto border border-slate-200 p-5 sm:p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingAd ? 'Редактировать рекламу' : 'Создать рекламную кампанию'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAdModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Заголовок объявления *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Официальный WhatsApp-канал «РАБОТА ТҶ»"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Текст описания
                </label>
                <textarea
                  rows={2}
                  placeholder="Краткий текст объявления для привлечения внимания..."
                  value={adDesc}
                  onChange={(e) => setAdDesc(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    URL ссылки перехода * (https://, wa.me, t.me)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://wa.me/992900000000"
                    value={adLinkUrl}
                    onChange={(e) => setAdLinkUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Текст на кнопке действия
                  </label>
                  <input
                    type="text"
                    placeholder="Например: Написать в WhatsApp"
                    value={adButtonText}
                    onChange={(e) => setAdButtonText(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Позиция показа
                  </label>
                  <select
                    value={adPlacement}
                    onChange={(e) => setAdPlacement(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="hero">Главный (Hero вверху)</option>
                    <option value="feed">В ленте (Feed меж карточек)</option>
                    <option value="banner">Нижний баннер (Banner)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Порядковый номер
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={adOrderIndex}
                    onChange={(e) => setAdOrderIndex(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Статус активности
                  </label>
                  <select
                    value={adIsActive ? 'true' : 'false'}
                    onChange={(e) => setAdIsActive(e.target.value === 'true')}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="true">Активна (показывать)</option>
                    <option value="false">Приостановлена</option>
                  </select>
                </div>
              </div>

              {/* LIVE PREVIEW OF THE AD */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Живой предпросмотр (как увидят посетители):
                </span>
                <div className="p-4 bg-slate-50 border border-emerald-300 rounded-2xl flex items-center gap-3">
                  <img
                    src={adImageUrl}
                    alt=""
                    className="w-16 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Реклама</span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{adTitle || 'Заголовок рекламы'}</h5>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{adDesc || 'Описание рекламы...'}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {adButtonText || 'Подробнее'}
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                >
                  {editingAd ? 'Сохранить изменения' : 'Опубликовать рекламу'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
