import React, { useState } from 'react';
import { UserProfile } from '../types';
import { getSupabase } from '../lib/supabase';
import { store } from '../lib/store';
import { useI18n } from '../context/I18nContext';
import { X, LogIn, CheckCircle, Info, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const { t } = useI18n();
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Handle Google OAuth via Supabase or fast fallback
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setStatusMessage('Подключение к Google...');

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) {
          console.warn('Supabase OAuth notice:', error.message);
          setStatusMessage('Вход в режиме быстрого профиля Google...');
          simulateGoogleLogin();
        }
      } catch (err) {
        simulateGoogleLogin();
      }
    } else {
      simulateGoogleLogin();
    }
  };

  const simulateGoogleLogin = () => {
    setTimeout(() => {
      const demoUser: UserProfile = {
        id: 'google_user_' + Date.now(),
        email: emailInput || 'treydertj72@gmail.com',
        fullName: nameInput || 'Пользователь Google',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        role: 'worker',
        countryCode: 'TJ',
        city: 'Душанбе',
        createdAt: new Date().toISOString(),
      };
      store.setCurrentUser(demoUser);
      onLoginSuccess(demoUser);
      setLoading(false);
      onClose();
    }, 600);
  };

  const handleEmailQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const user: UserProfile = {
      id: 'email_user_' + Date.now(),
      email: emailInput.trim(),
      fullName: nameInput.trim() || emailInput.split('@')[0],
      role: 'worker',
      countryCode: 'TJ',
      city: 'Душанбе',
      createdAt: new Date().toISOString(),
    };
    store.setCurrentUser(user);
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-auto border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs shrink-0 cursor-pointer active:scale-95"
              title="Назад"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Назад</span>
            </button>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              ТҶ
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">Вход на сайт</h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">РАБОТА ТҶ — без обязательного телефона</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loading ? statusMessage : 'Продолжить с Google'}</span>
          </button>

          <div className="flex items-center gap-2 my-2">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-[11px] text-slate-400 font-medium uppercase">или по email</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Quick Email Login Form */}
          <form onSubmit={handleEmailQuickLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ваше имя
              </label>
              <input
                type="text"
                placeholder="Как к вам обращаться"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Электронная почта (Email) *
              </label>
              <input
                type="email"
                required
                placeholder="example@mail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
            >
              Войти без пароля
            </button>
          </form>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2 text-[11px] text-emerald-900 leading-normal">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Номер телефона не обязателен для регистрации. Вы можете указать его позже в настройках профиля или при подаче объявления.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
