
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://doevlzpslaigpjnmcpem.supabase.co';
const supabaseKey = 'sb_publishable_diQgAkeHSwhbcuO38IZJMw_0mFvagfF';
const supabase = createClient(supabaseUrl, supabaseKey);

const profiles = [
  { id: '11111111-1111-1111-1111-111111111111', first_name: 'Алина', last_name: 'Серикова', bio: 'Продуктовый дизайнер. Люблю минимализм и котиков.', location: 'Алматы', skills: ['UI/UX', 'Figma', '3D Design'] },
  { id: '22222222-2222-2222-2222-222222222222', first_name: 'Дамир', last_name: 'Ахметов', bio: 'Backend разработчик. Кофе и код — моё всё.', location: 'Астана', skills: ['Go', 'PostgreSQL', 'Docker'] },
  { id: '33333333-3333-3333-3333-333333333333', first_name: 'Сауле', last_name: 'Муратова', bio: 'ЗОЖ энтузиаст. Бегаю по утрам и учусь готовить здоровую еду.', location: 'Бишкек', skills: ['Fitness', 'Nutrition', 'Yoga'] },
  { id: '44444444-4444-4444-4444-444444444444', first_name: 'Ерлан', last_name: 'Касенов', bio: 'Предприниматель. Постоянно в поиске новых идей.', location: 'Атырау', skills: ['Management', 'Startups', 'Public Speaking'] },
  { id: '55555555-5555-5555-5555-555555555555', first_name: 'Айгуль', last_name: 'Исаева', bio: 'Художник-самоучка. Мечтаю объездить весь мир с мольбертом.', location: 'Шымкент', skills: ['Painting', 'Sketching', 'Travel'] }
];

const goalsDraft = [
  { user_id: '11111111-1111-1111-1111-111111111111', title: 'Освоить Blender за 3 месяца' },
  { user_id: '22222222-2222-2222-2222-222222222222', title: 'Запустить пет-проект на Go' },
  { user_id: '33333333-3333-3333-3333-333333333333', title: 'Подготовиться к полумарафону' },
  { user_id: '44444444-4444-4444-4444-444444444444', title: 'Прочитать 24 книги за год' },
  { user_id: '55555555-5555-5555-5555-555555555555', title: 'Серия акварельных пейзажей' }
];

const checkpointsDraft = [
  { user_index: 0, content: 'Сегодня разобралась с нодами в Blender. Сложно, но очень интересно! Попробовала создать процедурную текстуру мрамора.' },
  { user_index: 1, content: 'Настроил архитектуру проекта. Использую clean architecture, чтобы потом не страдать. Первые эндпоинты уже работают!' },
  { user_index: 2, content: 'Пробежала свои первые 5 км без остановки. Темп пока не очень, но главное — выносливость растет.' },
  { user_index: 3, content: 'Закончила читать «Атомные привычки». Многое пересмотрела в своей рутине. Начинаю внедрять правило 2-х минут.' },
  { user_index: 4, content: 'Первый набросок из серии. Рисовала закат в горах. Акварель всё-таки очень капризная штука.' },
  { user_index: 0, content: 'Сделала рендер первой модели пончика (классика!). Добавила посыпку и поработала со светом. Кайфую от результата.' },
  { user_index: 2, content: 'Купила новые кроссовки для бега. Теперь точно нет оправданий пропускать тренировки.' }
];

async function seed() {
  console.log('Starting seed...');
  
  // 1. Seed profiles
  for (const p of profiles) {
    const { error } = await supabase.from('profiles').upsert(p);
    if (error) console.error(`Error inserting profile ${p.first_name}:`, error.message);
  }
  console.log('Profiles seeded.');

  // 2. Seed goals and get their real IDs
  const goalMap = {}; // index -> id
  for (let i = 0; i < goalsDraft.length; i++) {
    const { data, error } = await supabase.from('goals').insert(goalsDraft[i]).select();
    if (error) {
      console.error(`Error inserting goal ${goalsDraft[i].title}:`, error.message);
      // Try to find if it already exists
      const { data: existing } = await supabase.from('goals').select('id').eq('title', goalsDraft[i].title).eq('user_id', goalsDraft[i].user_id).single();
      if (existing) goalMap[i] = existing.id;
    } else {
      goalMap[i] = data[0].id;
    }
  }
  console.log('Goals seeded.');

  // 3. Seed checkpoints linked to goals
  for (const cp of checkpointsDraft) {
    const goalId = goalMap[cp.user_index];
    if (goalId) {
      const { error } = await supabase.from('goal_checkpoints').insert({
        goal_id: goalId,
        content: cp.content
      });
      if (error) console.error(`Error inserting checkpoint:`, error.message);
    }
  }
  console.log('Checkpoints seeded.');

  console.log('Seed completed!');
}

seed();
