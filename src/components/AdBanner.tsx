import React from 'react';
import { OwnerAd } from '../types';
import { store } from '../lib/store';
import { MessageCircle, ExternalLink } from 'lucide-react';

interface AdBannerProps {
  ad: OwnerAd;
  variant?: 'hero' | 'feed';
}

export const AdBanner: React.FC<AdBannerProps> = ({ ad, variant = 'feed' }) => {
  const handleClick = () => {
    store.incrementAdClicks(ad.id);
  };

  const getTargetUrl = () => {
    if (ad.isWhatsapp && ad.whatsappMessage) {
      const cleanPhone = ad.linkUrl.replace(/\D/g, '');
      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(ad.whatsappMessage)}`;
    }
    let url = ad.linkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('wa.me') && !url.startsWith('t.me')) {
      url = 'https://' + url;
    }
    return url;
  };

  const buttonLabel = ad.buttonText || (ad.isWhatsapp ? 'Перейти в WhatsApp чат' : 'Подробнее');

  if (variant === 'hero') {
    return (
      <aside className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden mb-6">
        <div className="absolute top-3 right-4 text-[10px] uppercase font-bold tracking-wider text-emerald-300/80 bg-white/10 px-2 py-0.5 rounded-sm">
          Реклама
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
              {ad.title}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl mb-4">
              {ad.description}
            </p>
            <a
              href={getTargetUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              {ad.isWhatsapp && <MessageCircle className="w-4 h-4 fill-slate-950" />}
              <span>{buttonLabel}</span>
              {!ad.isWhatsapp && <ExternalLink className="w-4 h-4" />}
            </a>
          </div>
          <div className="md:col-span-4 hidden md:flex justify-end">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              referrerPolicy="no-referrer"
              className="w-full max-w-[280px] h-36 object-cover rounded-2xl border border-white/20 shadow-md"
            />
          </div>
        </div>
      </aside>
    );
  }

  // Feed interstitial ad block
  return (
    <aside className="bg-white rounded-2xl border border-emerald-200/80 hover:border-emerald-500/60 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center gap-4 relative transition-all my-2">
      <div className="absolute top-2.5 right-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        Реклама
      </div>
      <img
        src={ad.imageUrl}
        alt={ad.title}
        referrerPolicy="no-referrer"
        className="w-full sm:w-32 h-24 sm:h-24 object-cover rounded-xl shrink-0 border border-slate-100"
      />
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
          {ad.title}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-2 mb-3">
          {ad.description}
        </p>
        <a
          href={getTargetUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
        >
          {ad.isWhatsapp && <MessageCircle className="w-3.5 h-3.5 fill-emerald-800" />}
          <span>{buttonLabel}</span>
          {!ad.isWhatsapp && <ExternalLink className="w-3 h-3 ml-0.5" />}
        </a>
      </div>
    </aside>
  );
};
