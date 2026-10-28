-- ==========================================================
-- РАБОТА ТҶ (Работа ТЧ) — Защищённая схема базы данных для Supabase
-- Поддерживает все страны СНГ и серверную защиту прав администратора
-- Проект: https://ygnbitwwflzyfhjktlje.supabase.co
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Таблица профилей пользователей
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'worker' CHECK (role IN ('worker', 'employer', 'both')),
  country_code TEXT CHECK (country_code IN ('TJ', 'KZ', 'RU', 'KG', 'UZ', 'BY', 'AZ', 'AM', 'MD', 'TM')),
  region TEXT,
  city TEXT,
  profession TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  blocked_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Таблица объявлений
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('looking_for_job', 'offering_job', 'offering_service', 'looking_for_service')),
  category_id TEXT NOT NULL,
  profession TEXT NOT NULL,
  country_code TEXT NOT NULL CHECK (country_code IN ('TJ', 'KZ', 'RU', 'KG', 'UZ', 'BY', 'AZ', 'AM', 'MD', 'TM')),
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  is_negotiable BOOLEAN DEFAULT false,
  price NUMERIC(14,2),
  currency TEXT NOT NULL CHECK (currency IN ('TJS', 'KZT', 'RUB', 'KGS', 'UZS', 'BYN', 'AZN', 'AMD', 'MDL', 'TMT')),
  period TEXT CHECK (period IN ('month', 'day', 'hour', 'project')),
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  contact_phone TEXT,
  contact_whatsapp TEXT,
  contact_telegram TEXT,
  views_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  isHiddenByAdmin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Таблица избранных объявлений
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- 4. Таблица сообщений (чат)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  text TEXT,
  image_url TEXT,
  contact_shared JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Таблица отзывов и оценок
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Таблица жалоб (модерация)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Таблица рекламы владельца сайта
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  is_whatsapp BOOLEAN DEFAULT false,
  placement TEXT DEFAULT 'feed' CHECK (placement IN ('hero', 'feed', 'banner')),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  clicks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Журнал действий администратора (Audit Log)
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_listings_country_region_city ON public.listings(country_code, region, city);
CREATE INDEX IF NOT EXISTS idx_listings_profession ON public.listings(profession);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- СТРОГАЯ ЗАЩИТА: Запрет самовольного присвоения статуса администратора пользователями
CREATE OR REPLACE FUNCTION public.prevent_admin_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.is_admin = true AND (OLD.is_admin IS DISTINCT FROM true)) THEN
    -- Разрешено только для вызовов с сервисным ключом (service_role)
    IF (current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role') THEN
      RAISE EXCEPTION 'Отказ в доступе: пользователи не могут самостоятельно назначать себя администраторами.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_admin_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_admin_escalation
  BEFORE UPDATE OF is_admin ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_admin_escalation();

-- Автоматическое создание профиля при регистрации через Google Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, is_admin)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    false -- Все новые пользователи создаются БЕЗ прав администратора
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Включение Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Политики
CREATE POLICY "Public profiles can be viewed by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own non-admin profile fields" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Active listings are viewable by everyone" ON public.listings 
  FOR SELECT USING (is_active = true AND isHiddenByAdmin = false);
CREATE POLICY "Users can view their own listings" ON public.listings 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own listings" ON public.listings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own listings" ON public.listings 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own listings" ON public.listings 
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view conversation messages" ON public.messages 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Public can view active ads" ON public.ads FOR SELECT USING (is_active = true);
