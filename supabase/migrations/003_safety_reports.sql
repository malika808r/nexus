-- Миграция: таблица краудсорс-отчётов безопасности

-- Категории: 'no_lighting' | 'suspicious' | 'dark_zone' | 'unsafe_infra' | 'safe_spot'
CREATE TABLE IF NOT EXISTS public.safety_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- NULL если анонимно
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  category TEXT NOT NULL DEFAULT 'no_lighting',
  description TEXT,
  is_anonymous BOOLEAN DEFAULT TRUE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS safety_reports_lat_lng_idx ON public.safety_reports(lat, lng);
CREATE INDEX IF NOT EXISTS safety_reports_category_idx ON public.safety_reports(category);
CREATE INDEX IF NOT EXISTS safety_reports_created_at_idx ON public.safety_reports(created_at DESC);

-- RLS
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;

-- Все могут читать отчёты (публичная карта)
CREATE POLICY "Safety reports are publicly visible"
  ON public.safety_reports FOR SELECT
  USING (true);

-- Только авторизованные могут добавлять
CREATE POLICY "Authenticated users can add safety reports"
  ON public.safety_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Только автор может удалять свой отчёт
CREATE POLICY "Users can delete own safety reports"
  ON public.safety_reports FOR DELETE
  USING (auth.uid() = user_id);
