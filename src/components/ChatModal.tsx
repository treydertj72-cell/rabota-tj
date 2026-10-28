import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Listing, ChatMessage } from '../types';
import { store, subscribeStore } from '../lib/store';
import { X, Send, Image, Phone, Check, Paperclip, ArrowLeft } from 'lucide-react';

interface ChatModalProps {
  onClose: () => void;
  currentUser: UserProfile;
  targetUser: { id: string; name: string; avatarUrl?: string };
  initialListing?: Listing | null;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  onClose,
  currentUser,
  targetUser,
  initialListing,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const reloadMessages = () => {
    const list = store.getMessages(currentUser.id, targetUser.id);
    setMessages(list);
  };

  useEffect(() => {
    reloadMessages();
    const unsub = subscribeStore(reloadMessages);
    return unsub;
  }, [currentUser.id, targetUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    store.sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      receiverId: targetUser.id,
      listingId: initialListing?.id,
      listingTitle: initialListing?.title,
      text: inputText.trim() || undefined,
      imageUrl: attachedImage || undefined,
    });

    setInputText('');
    setAttachedImage(null);
  };

  const handleShareContacts = () => {
    const myPhone = currentUser.phone || 'Не указан';
    store.sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      receiverId: targetUser.id,
      listingId: initialListing?.id,
      text: `Здравствуйте! Делюсь своими прямыми контактами для связи: телефон/WhatsApp: ${myPhone}`,
      contactShared: {
        phone: currentUser.phone,
        whatsapp: currentUser.phone,
      },
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto h-[85vh] max-h-[650px] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 bg-slate-50">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs shrink-0 cursor-pointer active:scale-95"
              title="Назад"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="hidden xs:inline">Назад</span>
            </button>
            {targetUser.avatarUrl ? (
              <img
                src={targetUser.avatarUrl}
                alt={targetUser.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-emerald-500 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {targetUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                {targetUser.name}
              </h3>
              {initialListing && (
                <span className="text-[11px] text-emerald-700 font-medium truncate block max-w-[150px] sm:max-w-[200px]">
                  По поводу: {initialListing.title}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShareContacts}
              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
              title="Отправить свои контакты"
            >
              <Phone className="w-3 h-3" />
              <span>Поделиться контактом</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xs text-slate-400 mb-2">Начните диалог прямо сейчас.</p>
              <p className="text-[11px] text-slate-400">
                Вы можете обсудить условия работы, отправить фотографии объекта или поделиться контактами.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === currentUser.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isMine
                        ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {m.text && <p className="whitespace-pre-line">{m.text}</p>}
                    {m.imageUrl && (
                      <img
                        src={m.imageUrl}
                        alt="Вложение"
                        className="mt-2 rounded-xl max-h-48 object-cover border border-white/20"
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-3 border-t border-slate-200 bg-white shrink-0">
          {attachedImage && (
            <div className="flex items-center gap-2 mb-2 p-1.5 bg-slate-100 rounded-xl w-fit">
              <img src={attachedImage} alt="Вложение" className="w-10 h-10 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="text-xs text-rose-600 font-bold px-1"
              >
                Удалить
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <label
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              title="Прикрепить фото"
            >
              <Paperclip className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-100 border border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !attachedImage}
              className="p-2.5 bg-emerald-600 disabled:opacity-40 text-white rounded-xl hover:bg-emerald-700 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
