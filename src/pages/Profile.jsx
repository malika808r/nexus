import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, MapPin, Check, Camera, Settings, Grid, Activity, 
  ChevronRight, Sparkles, Target, Zap, Search, ShieldCheck,
  UserPlus, UserMinus, Edit3, CheckCircle2, Clock, MessageCircle
} from 'lucide-react';
import EditProfileModal from '../components/profile/EditProfileModal';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../supabase';

function DashboardCard({ title, value, sub, icon: Icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-6 flex flex-col justify-between group hover:shadow-2xl transition-all relative overflow-hidden h-40"
    >
      <div className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full" style={{ backgroundColor: color }} />
      <div className="flex items-center justify-between relative z-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
          <Icon size={20} />
        </div>
        <ChevronRight size={16} className="opacity-20 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{value}</div>
        <div className="text-[11px] font-black uppercase tracking-widest opacity-40">{title}</div>
        <div className="text-[10px] font-bold mt-1" style={{ color }}>{sub}</div>
      </div>
    </motion.div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    user, logout, userGoals, userCheckpoints, fetchUserGoalsAndCheckpoints,
    following, followUser, unfollowUser
  } = useAppStore();
  const { show } = useToast();

  const [targetUser, setTargetUser] = useState(null);
  const [editableProfile, setEditableProfile] = useState(null);
  const [targetStats, setTargetStats] = useState({ followers: 0, following: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !id || id === user?.id;
  const currentId = id || user?.id;

  const handleOpenEdit = () => {
    setEditableProfile(profileData);
    setIsEditModalOpen(true);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setEditableProfile(prev => ({ ...prev, avatarUrl: data.publicUrl }));
    } catch (error) {
      show('Ошибка загрузки аватара', 'error');
    }
  };

  useEffect(() => {
    async function loadProfile() {
      if (!currentId) return;
      setLoading(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentId)
        .single();
      
      if (profile) setTargetUser(profile);
      
      const [fowlers, fowing] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', currentId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', currentId)
      ]);
      
      setTargetStats({
        followers: fowlers.count || 0,
        following: fowing.count || 0
      });

      await fetchUserGoalsAndCheckpoints(currentId);
      setLoading(false);
    }
    
    loadProfile();
  }, [currentId, following.length]);

  const handleFollowAction = async () => {
    if (following.includes(currentId)) {
      await unfollowUser(currentId);
      show('Вы отписались', 'info');
    } else {
      await followUser(currentId);
      show('Вы подписались!', 'success');
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) navigate('/');
  };

  const handleSeedData = async () => {
    show('Масштабная генерация данных...', 'info');
    try {
      // 1. Ensure Mock Profiles Exist (Avoid FK errors)
      const mockProfiles = [
        { id: '00000000-0000-0000-0000-0000000000f1', first_name: 'Алина', last_name: 'Дизайнер', bio: 'Создаю интерфейсы для созидателей.', avatar_url: '👩‍🎨' },
        { id: '00000000-0000-0000-0000-0000000000f2', first_name: 'Арман', last_name: 'Frontend', bio: 'Пишу на React и люблю горы.', avatar_url: '👨‍💻' },
        { id: '00000000-0000-0000-0000-0000000000f3', first_name: 'Зарина', last_name: 'Созидатель', bio: 'Меняю мир через маленькие шаги.', avatar_url: '👩‍💼' }
      ];
      await supabase.from('profiles').upsert(mockProfiles);

      // 2. Mock User Content (Feed population)
      const mockGoals = [
        { user_id: '00000000-0000-0000-0000-0000000000f1', title: 'Создать 3D мир в Unreal' },
        { user_id: '00000000-0000-0000-0000-0000000000f2', title: 'Выучить Rust' }
      ];
      const { data: createdGoals } = await supabase.from('goals').upsert(mockGoals).select();
      if (createdGoals) {
        const mockCPs = [
          { goal_id: createdGoals[0].id, content: 'Первые шаги в Nanite! Производительность просто космос. 🚀' },
          { goal_id: createdGoals[1].id, content: 'Ownership и Borrowing... Голова кругом, но я начинаю понимать. 🦀' }
        ];
        await supabase.from('goal_checkpoints').insert(mockCPs);
      }

      // 3. My Goals & Checkpoints
      const g1 = await useAppStore.getState().addGoal("Освоить Blender 3D");
      if (g1) {
        await useAppStore.getState().addCheckpoint(g1.id, "Разобралась с интерфейсом и создала свой первый пончик! 🍩");
      }

      // 4. Sample Notifications for Malika
      const notifications = [
        { user_id: currentId, type: 'like', actor_id: '00000000-0000-0000-0000-0000000000f1', content: 'Алина лайкнула ваш шаг!', read: false },
        { user_id: currentId, type: 'follow', actor_id: '00000000-0000-0000-0000-0000000000f2', content: 'Арман подписался на вас.', read: false },
        { user_id: currentId, type: 'message', actor_id: '00000000-0000-0000-0000-0000000000f3', content: 'Зарина: Привет! Классный прогресс!', read: false },
      ];
      await supabase.from('notifications').insert(notifications);

      // 5. Mock Chat Messages
      const roomIds = ['general', 'it', 'aesthetic', 'sport'];
      const chatMessages = [];
      roomIds.forEach(rid => {
        chatMessages.push(
          { user_id: '00000000-0000-0000-0000-0000000000f1', content: `Всем привет в комнате ${rid}! 👋`, type: `room_${rid}` },
          { user_id: '00000000-0000-0000-0000-0000000000f2', content: 'Кто тут еще созидает сегодня?', type: `room_${rid}` }
        );
      });
      await supabase.from('posts').insert(chatMessages);

      show('Nexus ожил! Лента и чаты наполнены.', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      console.error(e);
      show('Ошибка генерации', 'error');
    }
  };

  if (loading && !targetUser) return <div className="p-20 text-center font-black animate-pulse">Загрузка профиля...</div>;

  const profileData = isOwnProfile ? {
    firstName: user?.user_metadata?.firstName || 'Malika',
    lastName: user?.user_metadata?.lastName || '',
    bio: user?.user_metadata?.bio || 'Строю будущее, шаг за шагом.',
    avatarUrl: user?.user_metadata?.avatarUrl || null,
  } : {
    firstName: targetUser?.first_name || 'Builder',
    lastName: targetUser?.last_name || '',
    bio: targetUser?.bio || 'Участник Nexus.',
    avatarUrl: targetUser?.avatar_url || null,
  };

  const initials = profileData.firstName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen pb-32 max-w-5xl mx-auto px-4 pt-8 md:pt-16" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* ─── PREMIUM HERO ─── */}
      <section className="relative mb-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Avatar Area */}
          <div className="relative group">
            <motion.div 
               initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
               className="w-40 h-40 rounded-[3rem] border-8 shadow-2xl overflow-hidden bg-white flex items-center justify-center transition-transform hover:scale-105"
               style={{ borderColor: 'var(--bg-card)' }}
            >
              {profileData.avatarUrl 
                ? <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                : <span className="text-5xl font-black text-blue-600">{initials}</span>
              }
            </motion.div>
            {isOwnProfile && (
              <button 
                onClick={handleOpenEdit}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-white dark:bg-slate-900 shadow-xl rounded-2xl flex items-center justify-center border transition-all hover:bg-blue-600 hover:text-white"
                style={{ borderColor: 'var(--border)' }}
              >
                <Camera size={20} />
              </button>
            )}
          </div>

          {/* Info Area */}
          <div className="flex-1 text-center md:text-left pt-2">
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <h1 className="text-5xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                   {profileData.firstName} {profileData.lastName}
                </h1>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[11px] font-black uppercase tracking-widest border border-emerald-500/20">
                   <ShieldCheck size={12} /> Verified Builder
                </div>
             </div>
             
             <div className="flex gap-6 mb-6 justify-center md:justify-start text-sm">
                <div><span className="font-black">{targetStats.followers}</span> <span className="opacity-50">подписчиков</span></div>
                <div><span className="font-black">{targetStats.following}</span> <span className="opacity-50">подписок</span></div>
             </div>

             <p className="text-lg font-medium opacity-50 mb-8 max-w-xl leading-relaxed">
               {profileData.bio}
             </p>

             <div className="flex flex-wrap justify-center md:justify-start gap-4">
               {isOwnProfile ? (
                 <>
                   <button onClick={handleOpenEdit}
                           className="h-12 px-8 rounded-2xl font-black text-[14px] bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-all shadow-xl hover:scale-105 active:scale-95">
                     Настройки профиля
                   </button>
                   <button onClick={handleLogout}
                           className="h-12 px-6 rounded-2xl font-black text-[14px] border-2 transition-all hover:bg-red-500 hover:text-white hover:border-red-500 opacity-40 hover:opacity-100"
                           style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                     <LogOut size={18} />
                   </button>
                   <button onClick={handleSeedData}
                           className="h-12 px-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-dashed hover:border-blue-500 transition-all opacity-30 hover:opacity-100"
                           style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                     Заполнить данными
                   </button>
                 </>
               ) : (
                 <div className="flex gap-3">
                   <button 
                     onClick={handleFollowAction}
                     className={`h-12 px-8 rounded-2xl font-black text-[14px] transition-all shadow-xl scale-105 active:scale-95 flex items-center gap-2 ${following.includes(currentId) ? 'bg-muted-foreground/10 text-primary' : 'bg-blue-600 text-white'}`}
                   >
                     {following.includes(currentId) ? <><UserMinus size={18} /> Отписаться</> : <><UserPlus size={18} /> Подписаться</>}
                   </button>
                   <button 
                     onClick={() => navigate('/app/chats')}
                     className="h-12 px-6 rounded-2xl font-black text-[14px] border-2 flex items-center gap-2 transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600"
                     style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                   >
                     <MessageCircle size={18} />
                     Написать
                   </button>
                 </div>
               )}
             </div>
          </div>
        </div>
      </section>

      {/* ─── FUNCTIONAL MATRIX ─── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <DashboardCard 
          title="Пульс Энергии" 
          value="84" 
          sub="+12% к прошлой неделе" 
          icon={Zap} 
          color="#3b82f6" 
          delay={0.1} 
        />
        <DashboardCard 
          title="Цели" 
          value={userGoals?.length || 0} 
          sub="В процессе развития" 
          icon={Target} 
          color="#10b981" 
          delay={0.2} 
        />
        <DashboardCard 
          title="Подписчики" 
          value={targetStats.followers} 
          sub="Влияние в сообществе" 
          icon={Search} 
          color="#8b5cf6" 
          delay={0.3} 
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-1">
           <div className="card p-6 border-none shadow-xl bg-muted-foreground/5">
              <h3 className="text-[12px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2">
                 <MapPin size={14} /> Локация
              </h3>
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">🏔️</div>
                 <div>
                    <div className="font-black text-base">{profileData.location}</div>
                    <div className="text-xs font-bold text-blue-600">{isOwnProfile ? "В поиске: Ко-фаундер" : "Доступен для коллабов"}</div>
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT: Goals Progress + Timeline */}
        <div className="lg:col-span-2 space-y-8">

          {/* Goals Progress Visualization */}
          {userGoals?.length > 0 && (
            <div className="card p-6 border-none shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[12px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                  <Target size={14} /> Путь к целям
                </h3>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full">
                  {userCheckpoints?.length || 0} шагов сделано
                </span>
              </div>
              <div className="space-y-5">
                {userGoals.map((goal, idx) => {
                  const checkpointsForGoal = userCheckpoints?.filter(cp => cp.goal_id === goal.id) || [];
                  const progress = Math.min(100, checkpointsForGoal.length * 20);
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))` }}>
                            <Target size={12} className="text-white" />
                          </div>
                          <span className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{goal.title}</span>
                        </div>
                        <span className="text-[11px] font-black" style={{ color: progress === 100 ? '#10b981' : 'var(--text-muted)' }}>
                          {progress === 100 ? '✓ Выполнено' : `${checkpointsForGoal.length} шагов`}
                        </span>
                      </div>
                      <div className="relative h-2.5 bg-muted-foreground/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.2, delay: idx * 0.15, ease: 'easeOut' }}
                          className="absolute top-0 left-0 h-full rounded-full"
                          style={{ background: progress === 100 ? '#10b981' : 'linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary))' }}
                        />
                        {[25, 50, 75].map(milestone => (
                          <div
                            key={milestone}
                            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/60"
                            style={{ left: `${milestone}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] opacity-30 font-bold">Начало</span>
                        <span className="text-[10px] opacity-30 font-bold">Цель</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

           {/* Timeline */}
           <div>
             <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-[12px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                   <Activity size={14} /> Хроника достижений
                </h3>
             </div>

             <div className="space-y-4">
                {userCheckpoints?.length > 0 ? (
                   userCheckpoints.slice().reverse().map((cp, idx) => (
                      <motion.div 
                        key={cp.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="card p-6 border-none shadow-lg hover:shadow-xl transition-all relative group"
                      >
                         <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-600 to-emerald-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                         <div className="flex items-start justify-between mb-4">
                            <div className="text-[11px] font-bold uppercase tracking-widest opacity-40">
                               {new Date(cp.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                            </div>
                            <Zap size={14} className="opacity-10 group-hover:text-blue-600 group-hover:opacity-100 transition-all" />
                         </div>
                         
                         {cp.image_url && (
                           <div className="mb-4 rounded-2xl overflow-hidden border">
                             <img src={cp.image_url} alt="Checkpoint" className="w-full h-auto max-h-[300px] object-cover" />
                           </div>
                         )}

                         <p className="text-[16px] font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                            {cp.content}
                         </p>
                      </motion.div>
                   ))
                ) : (
                   <div className="card p-12 text-center border-dashed border-2 opacity-30">
                      <Zap size={32} className="mx-auto mb-4" />
                      <p className="text-sm font-black uppercase tracking-widest">Нет шагов</p>
                      <p className="text-xs mt-1">Здесь будет виден путь к целям</p>
                   </div>
                )}
             </div>
           </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profileData={editableProfile}
          setProfileData={setEditableProfile} 
          handleAvatarUpload={handleAvatarUpload}
        />
      )}
    </div>
  );
}
