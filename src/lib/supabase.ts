import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ygnbitwwflzyfhjktlje.supabase.co';

export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('rabota_tj_supabase_url') || DEFAULT_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('rabota_tj_supabase_anon_key') || '';
  return { url, anonKey, isConfigured: Boolean(anonKey && anonKey.length > 20) };
};

export const setSupabaseConfig = (url: string, anonKey: string) => {
  if (url) localStorage.setItem('rabota_tj_supabase_url', url);
  if (anonKey) localStorage.setItem('rabota_tj_supabase_anon_key', anonKey);
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;
  
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
};
