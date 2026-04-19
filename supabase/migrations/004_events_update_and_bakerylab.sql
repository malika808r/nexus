-- Миграция: улучшение таблицы events для Kyz Hub

-- Делаем organizer_id необязательным (для системных событий от команды KyzJolu)
ALTER TABLE public.events
  ALTER COLUMN organizer_id DROP NOT NULL;

-- Добавляем количество мест (общее и занятое) и контактную ссылку
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS spots_total INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS contact_url TEXT,
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- ──────────────────────────────────────────────────────────────────
-- ВСТАВЛЯЕМ ПЕРВОЕ РЕАЛЬНОЕ СОБЫТИЕ: Bakerylab
-- ──────────────────────────────────────────────────────────────────
INSERT INTO public.events (
  title,
  description,
  date,
  time,
  location,
  category,
  organizer_id,
  participants_count,
  spots_total,
  contact_url,
  is_online,
  image
) VALUES (
  'Bakerylab — волонтёры кулинарного проекта',
  E'Присоединяйтесь к Bakerylab — проекту для тех, кто влюблён в кондитерское искусство!\n\nМы создаём пространство для начинающих поваров и кондитеров: здесь вы сможете развиваться, делиться успехами и наращивать свою популярность!\n\nМы ищем:\n• Менторов — опытных кондитеров, готовых делиться знаниями\n• СММ-специалистов — тех, кто поможет раскрутить TikTok и Telegram\n• Промо-волонтёров — энтузиастов, готовых рассказывать о проекте\n\nЧто вы получите:\n✅ Учёт волонтёрских часов в официальной форме\n✅ Ценный практический опыт\n✅ Грамота с волонтёрскими часами для портфолио\n✅ Поддержку и дружную атмосферу\n\nФормат: онлайн. Продолжительность: 1–2 месяца.',
  '2026-05-01',
  '10:00',
  'Онлайн',
  'Кулинария',
  NULL,
  0,
  30,
  'https://t.me/washix',
  TRUE,
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80'
)
ON CONFLICT DO NOTHING;
