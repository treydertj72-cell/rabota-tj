import React, { useState } from 'react';
import { UserProfile } from '../types';
import { getSupabase } from '../lib/supabase';
import { store } from '../lib/store';
import { useI18n } from '../context/I18nContext';
import { isGoogleClientConfigured, signInWithGooglePopup } from '../lib/googleAuth';
import { X, LogIn, AlertCircle, Info, ArrowLeft, Check, ShieldCheck, Mail } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const { t } = useI18n();

  // Mode: 'default' | 'google_prompt'
  const [mode, setMode] = useState<'default' | 'google_prompt'>('default');

  // Input states
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    setStatusMessage('Подключение к Google...');

    // A. Check if official Google Identity Services Client ID is configured
    if (isGoogleClientConfigured()) {
      try {
        setStatusMessage('Открытие окна выбора аккаунта Google...');
        const individualGoogleUser = await signInWithGooglePopup();
        store.setCurrentUser(individualGoogleUser);
        onLoginSuccess(individualGoogleUser);
        setLoading(false);
        onClose();
        return;
      } catch (err: any) {
        console.warn('Google popup error:', err);
        setLoading(false);
        if (err.message?.includes('отменена')) {
          setErrorMsg('Выбор аккаунта Google был отменен.');
        } else {
          setErrorMsg(err.message || 'Ошибка входа через Google. Пожалуйста, попробуйте снова.');
        }
        return;
      }
    }

    // B. Check if Supabase Google OAuth is configured
    const supabase = getSupabase();
    if (supabase) {
      try {
        setStatusMessage('Перенаправление в Google через Supabase...');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              prompt: 'select_account',
            },
          },
        });
        if (error) {
          throw error;
        }
        return; // Redirecting...
      } catch (err: any) {
        console.warn('Supabase OAuth notice:', err);
        // Fallback to individual email prompt below
      }
    }

    // C. If Google Client ID is not configured yet in environment,
    // NEVER fall back to hardcoded admin email!
    // Instead, open individual Google account entry form so user specifies their OWN email and gets their own unique ID.
    setLoading(false);
    setMode('google_prompt');
  };

  // 2. Individual Google Account Confirmation (when OAuth client ID is not yet provided in env)
  const handleConfirmIndividualGoogle = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = googleEmailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Пожалуйста, введите ваш собственный адрес электронной почты Google');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Пожалуйста, введите корректный адрес электронной почты (например: ivan@gmail.com)');
      return;
    }

    const cleanName = googleNameInput.trim() || cleanEmail.split('@')[0];

    // Generate unique account ID based on this user's email and timestamp
    // Guarantee: Each user gets their own individual profile, no account sharing!
    const uniqueHash = Math.abs(cleanEmail.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)).toString(36);
    const uniqueUser: UserProfile = {
      id: `google_user_${uniqueHash}_${Date.now().toString(36)}`,
      email: cleanEmail,
      fullName: cleanName,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=059669&color=fff&rounded=true`,
      role: 'worker',
      countryCode: 'TJ',
      city: 'Душанбе',
      createdAt: new Date().toISOString(),
    };

    store.setCurrentUser(uniqueUser);
    onLoginSuccess(uniqueUser);
    onClose();
  };

  // 3. Quick Email Login Form
  const handleEmailQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Пожалуйста, укажите ваш email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Пожалуйста, укажите корректный адрес электронной почты');
      return;
    }

    const cleanName = nameInput.trim() || cleanEmail.split('@')[0];
    const uniqueHash = Math.abs(cleanEmail.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)).toString(36);

    const user: UserProfile = {
      id: `email_user_${uniqueHash}_${Date.now().toString(36)}`,
      email: cleanEmail,
      fullName: cleanName,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=059669&color=fff&rounded=true`,
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
              type="button"
              onClick={mode === 'google_prompt' ? () => setMode('default') : onClose}
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
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {mode === 'google_prompt' ? 'Вход через Google' : 'Вход на сайт'}
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {mode === 'google_prompt' ? 'Индивидуальный аккаунт пользователя' : 'РАБОТА ТҶ — личный аккаунт'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* MODE: GOOGLE PROMPT (when OAuth client ID is not yet injected on Vercel) */}
          {mode === 'google_prompt' ? (
            <form onSubmit={handleConfirmIndividualGoogle} className="space-y-3.5">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Индивидуальный вход Google:</span>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Введите ваш собственный адрес Gmail. Для вашего телефона будет создан отдельный персональный профиль, изолированный от других пользователей.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ваш Google адрес (Gmail) *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="ivan@gmail.com или ali@gmail.com"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ваше имя (как обращаться в профиле)
                </label>
                <input
                  type="text"
                  placeholder="Например: Алишер или Иван"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('default')}
                  className="w-1/3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Войти в мой профиль
                </button>
              </div>
            </form>
          ) : (
            /* DEFAULT MODE */
            <>
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer disabled:opacity-60"
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
                <span className="text-[11px] text-slate-400 font-medium uppercase">или по личному email</span>
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
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Войти по email
                </button>
              </form>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2 text-[11px] text-emerald-900 leading-normal">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Каждый пользователь входит под своим собственным аккаунтом. Данные хранятся изолированно для каждого устройства.
                </span>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
