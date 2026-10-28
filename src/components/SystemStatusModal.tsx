import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Database, Key, ExternalLink, ArrowLeft } from 'lucide-react';
import { getSupabaseConfig } from '../lib/supabase';

interface SystemStatusModalProps {
  onClose: () => void;
  onOpenAdmin: () => void;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({ onClose, onOpenAdmin }) => {
  const supabaseCfg = getSupabaseConfig();
  const [serverStatus, setServerStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/system-status')
      .then(res => res.json())
      .then(data => setServerStatus(data))
      .catch(() => setServerStatus({ status: 'offline' }));
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50">
          <div className="flex items-center gap-2 sm:gap-2.5">
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
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Статус функций и интеграций «РАБОТА ТҶ»
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Честный отчёт о боевых и демонстрационных режимах
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Section: Real Working Functions */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Реально работает и проверено в коде</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 leading-relaxed">
              <li><strong>Общая лента всех стран СНГ:</strong> 10 стран, фильтрация по странам, регионам, городам и профессиям.</li>
              <li><strong>Создание и редактирование объявлений:</strong> строгая валидация числового поля (только цифры), чекбокс «Договорная», валюта стран СНГ.</li>
              <li><strong>Серверная защита админки:</strong> отдельный backend-сервис с токеном <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">/api/admin/verify</code>. Обычный пользователь не может самовольно стать администратором.</li>
              <li><strong>Модерация и жалобы:</strong> удаление объявлений, блокировка пользователей с причиной, массовое удаление спама.</li>
              <li><strong>Реклама и WhatsApp:</strong> баннеры владельца с прямым переходом в WhatsApp (<code className="font-mono">wa.me</code>) и счётчиком кликов.</li>
              <li><strong>Чат и избранное:</strong> обмен сообщениями, фото-вложениями и контактами.</li>
              <li><strong>SEO-подготовка:</strong> метатеги под запросы «Работа ТҶ/ТЧ», <code className="font-mono">robots.txt</code>, <code className="font-mono">sitemap.xml</code>.</li>
            </ul>
          </div>

          {/* Section: External Services needing User Config */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Требует внешней настройки (сейчас в безопасном локально-гибридном режиме)</span>
            </div>
            
            <div className="space-y-2.5 text-slate-700">
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">1. Облачная база Supabase</span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    {supabaseCfg.isConfigured ? 'Ключ подключен' : 'Гибридный режим'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Проект: <code className="text-emerald-700 font-mono">ygnbitwwflzyfhjktlje.supabase.co</code>. В проекте подготовлена схема <code className="font-mono">supabase_schema.sql</code>. Чтобы все пользователи сайта сохранялись в одном облаке, вставьте <code className="font-mono">anon public key</code> в Панели администратора.
                </p>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">2. Вход через Google (OAuth)</span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Быстрый профиль + Supabase OAuth
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Авторизация работает в 1 клик через быстрый профиль без требования обязательного телефона. Для работы официального всплывающего окна Google OAuth в Supabase нужно указать Client ID из Google Cloud Console.
                </p>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">3. Монетизация Google AdSense</span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Слоты готовы
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Файл <code className="font-mono">ads.txt</code> и слоты в ленте подготовлены. Показ реальных рекламных баннеров Google начнётся только после одобрения сайта модерацией Google AdSense.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            onClick={() => { onClose(); onOpenAdmin(); }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
          >
            Открыть Панель администратора
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 text-slate-600 hover:bg-slate-200 text-xs rounded-xl font-semibold"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
