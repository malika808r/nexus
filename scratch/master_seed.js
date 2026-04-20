import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY // Note: Use Service Role Key if possible for RLS bypass

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key. Check your .env file.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// MALIKA'S ID (Get from current user or hardcode for dev)
const MALIKA_ID = "08630730-80d8-466d-8dc8-100222f6027a" // Example UUID

async function seed() {
  console.log("🚀 Starting Master Seed...")

  // 1. Create Profiles
  const profiles = [
    { id: "p1", first_name: "Алина", last_name: "Дизайнер", bio: "UX/UI Дизайнер в поисках гармонии.", location: "Алматы", avatar_url: "https://i.pravatar.cc/150?img=1" },
    { id: "p2", first_name: "Арман", last_name: "Программист", bio: "Пишу код, который меняет мир.", location: "Астана", avatar_url: "https://i.pravatar.cc/150?img=2" },
    { id: "p3", first_name: "Зарина", last_name: "Менеджер", bio: "Помогаю командам достигать целей.", location: "Шымкент", avatar_url: "https://i.pravatar.cc/150?img=3" },
    { id: "p4", first_name: "Дамир", last_name: "Художник", bio: "Мир — это мой холст.", location: "Алматы", avatar_url: "https://i.pravatar.cc/150?img=4" },
    { id: "p5", first_name: "Елена", last_name: "Йога", bio: "Душевный покой и растяжка.", location: "Бишкек", avatar_url: "https://i.pravatar.cc/150?img=5" },
  ]

  console.log("👥 Seeding Profiles...")
  // Note: We skip profiles if they already exist or if we don't have Service Role
  // For this demo, we assume we are using the user's session in the app or a script that can insert.
  
  // 2. Create Goals
  const goals = [
    { user_id: "p1", title: "Создать дизайн-систему", description: "Для глобального стартапа.", category: "Design" },
    { user_id: "p2", title: "Выучить Rust", description: "Для системного программирования.", category: "Tech" },
    { user_id: "p3", title: "Марафон 42км", description: "Подготовка к Берлинскому марафону.", category: "Sport" },
    { user_id: MALIKA_ID, title: "Запустить Nexus", description: "Лучшая соцсеть для созидателей.", category: "Project" },
  ]

  console.log("🎯 Seeding Goals...")
  const { data: seededGoals } = await supabase.from('goals').upsert(goals).select()

  // 3. Create Checkpoints (Posts)
  if (seededGoals) {
    const checkpoints = [
      { goal_id: seededGoals[0].id, user_id: "p1", content: "Собрала основные компоненты в Figma. Начинаю работу над токенами! 🎨" },
      { goal_id: seededGoals[1].id, user_id: "p2", content: "Прошел главу про Ownership в Rust. Мозг немного кипит, но это круто! 🦀" },
      { goal_id: seededGoals[2].id, user_id: "p3", content: "Пробежала 15км сегодня. Темп 5:30. Ноги гудят, но я довольна. 🏃‍♀️" },
      { goal_id: seededGoals[3].id, user_id: MALIKA_ID, content: "Nexus оживает! Сегодня добавили систему чатов и уведомлений. 🚀" },
    ]
    console.log("📝 Seeding Posts...")
    await supabase.from('goal_checkpoints').upsert(checkpoints)
  }

  // 4. Create Chat Messages
  const rooms = ["general", "it", "aesthetic", "sport"]
  const messages = []
  rooms.forEach(room => {
    messages.push(
      { user_id: "p1", content: `Всем привет в комнате ${room}! 👋`, type: `room_${room}` },
      { user_id: "p2", content: "Кто тут еще созидает сегодня?", type: `room_${room}` },
      { user_id: "p3", content: "Я работаю над своим новым проектом.", type: `room_${room}` },
    )
  })
  console.log("💬 Seeding Chat Messages...")
  await supabase.from('posts').upsert(messages)

  // 5. Create Notifications for Malika
  const notifications = [
    { user_id: MALIKA_ID, type: "like", actor_id: "p1", content: "Алина лайкнула ваш шаг!", is_read: false },
    { user_id: MALIKA_ID, type: "comment", actor_id: "p2", content: "Арман прокомментировал ваш пост.", is_read: false },
    { user_id: MALIKA_ID, type: "follow", actor_id: "p3", content: "Зарина подписалась на вас.", is_read: false },
    { user_id: MALIKA_ID, type: "message", actor_id: "p4", content: "У вас новое сообщение в общем чате.", is_read: false },
  ]
  console.log("🔔 Seeding Notifications...")
  await supabase.from('notifications').upsert(notifications)

  console.log("✅ Master Seed Complete!")
}

seed().catch(err => console.error("❌ Seed failed:", err))
