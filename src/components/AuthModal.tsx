import React, { useState } from 'react';
import { UserProfile } from '../types';
import { getSupabase } from '../lib/supabase';
import { store } from '../lib/store';
import { isGoogleClientConfigured, signInWithGooglePopup } from '../lib/googleAuth';
import { X, ArrowLeft, AlertCircle, Info, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = getSupabase();
  const hasSupabase = Boolean(supabase);
  const hasGis = isGoogleClientConfigured();

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);

    // 1. If Google Identity Services (GIS) Client ID is configured, use fast native popup
    if (hasGis) {
      try {
        setStatusMessage('Открытие окна выбора аккаунта Google...');
        const googleUser = await signInWithGooglePopup();
        store.setCurrentUser(googleUser);
        onLoginSuccess(googleUser);
        setLoading(false);
        onClose();
        return;
      } catch (err: any) {
        setLoading(false);
        if (err.message?.includes('отменена') || err.message?.includes('closed') || err.message?.includes('access_denied')) {
          setErrorMsg('Выбор аккаунта Google был отменен.');
        } else {
          setErrorMsg(err.message || 'Ошибка входа через Google. Пожалуйста, попробуйте снова.');
        }
        return;
      }
    }

    // 2. Official Supabase Google OAuth Flow
    if (supabase) {
      try {
        setStatusMessage('Перенаправление на официальный вход Google...');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              prompt: 'select_account',
              access_type: 'offline',
            },
          },
        });

        if (error) {
          throw error;
        }
        // Browser redirects to Google OAuth consent screen
        return;
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err.message || 'Не удалось связаться с сервисом авторизации Supabase Google.');
        return;
      }
    }

    // 3. If neither Supabase Anon Key nor Google Client ID is configured yet:
    setLoading(false);
    setErrorMsg(
      'Для работы входа через Google укажите VITE_SUPABASE_ANON_KEY в настройках окружения на Vercel (или в Панели администратора сайта).'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-auto border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
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
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Вход через Google
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Официальный персональный аккаунт «РАБОТА ТҶ»
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
          
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Privacy & Security Guarantee */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Индивидуальный безопасный вход:</span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                При нажатии откроется официальный экран Google для выбора именно вашего аккаунта. Каждый пользователь получает изолированный личный профиль и доступ только к своим объявлениям.
              </p>
            </div>
          </div>

          {/* 1-Click Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 text-slate-800 font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            )}
            <span>{loading ? statusMessage : 'Продолжить с Google'}</span>
          </button>

          {/* Configuration Hint if Supabase Anon Key is not injected */}
          {!hasSupabase && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Supabase URL подключен (<code className="text-emerald-700">ygnbitwwflzyfhjktlje</code>). Чтобы включить облачный вход на Vercel, добавьте <code className="bg-slate-200 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> в переменные среды Vercel.
              </span>
            </div>
          )}

          <div className="pt-2 text-center text-[11px] text-slate-400">
            Входя на сайт, вы принимаете правила публикации и условия сервиса «РАБОТА ТҶ».
          </div>

        </div>

      </div>
    </div>
  );
};
