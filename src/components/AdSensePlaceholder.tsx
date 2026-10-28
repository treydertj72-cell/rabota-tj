import React from 'react';

interface AdSensePlaceholderProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle';
}

export const AdSensePlaceholder: React.FC<AdSensePlaceholderProps> = ({
  slotId = 'responsive-in-feed-1',
  format = 'horizontal',
}) => {
  return (
    <div
      className={`w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-3 sm:p-4 my-4 flex flex-col items-center justify-center text-center ${
        format === 'horizontal' ? 'min-h-[90px]' : 'min-h-[250px]'
      }`}
    >
      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
        Рекламное место Google AdSense
      </span>
      <p className="text-[11px] text-slate-500 max-w-md">
        Блок готов к показу объявлений. После одобрения вашего аккаунта AdSense здесь автоматически отображаются объявления Google.
      </p>
      <span className="text-[9px] font-mono text-slate-400 mt-1">
        Slot: {slotId}
      </span>
    </div>
  );
};
