import React from 'react';
import { useI18n } from '../context/I18nContext';
import { UserProfile } from '../types';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';

interface BottomNavProps {
  currentUser: UserProfile | null;
  unreadCount: number;
  onOpenCreateAd: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onScrollToTop: () => void;
  onOpenSearchFocus: () => void;
  onOpenMessages: () => void;
  activeTab: 'feed' | 'search' | 'messages' | 'profile';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentUser,
  unreadCount,
  onOpenCreateAd,
  onOpenProfile,
  onOpenAuth,
  onScrollToTop,
  onOpenSearchFocus,
  onOpenMessages,
  activeTab,
}) => {
  const { t } = useI18n();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1">
      <div className="grid grid-cols-5 items-center h-14">
        
        {/* Tab 1: Feed */}
        <button
          onClick={onScrollToTop}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
            activeTab === 'feed' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Лента</span>
        </button>

        {/* Tab 2: Search */}
        <button
          onClick={onOpenSearchFocus}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
            activeTab === 'search' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Поиск</span>
        </button>

        {/* Tab 3: Publish Ad (+) */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenCreateAd}
            className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform -mt-4 border-2 border-white cursor-pointer"
            title={t('publishAd')}
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Tab 4: Messages */}
        <button
          onClick={onOpenMessages}
          className={`relative flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
            activeTab === 'messages' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-1">Чат</span>
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={currentUser ? onOpenProfile : onOpenAuth}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
            activeTab === 'profile' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt=""
              className="w-5 h-5 rounded-full object-cover border border-emerald-600"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] font-semibold mt-1">
            {currentUser ? 'Кабинет' : 'Вход'}
          </span>
        </button>

      </div>
    </nav>
  );
};
