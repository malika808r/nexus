import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, MapPin, Camera, Zap, Target, Search, ShieldCheck,
  UserPlus, UserMinus, Trash2, MessageCircle, Activity, ChevronRight
} from 'lucide-react';
import EditProfileModal from '../components/profile/EditProfileModal';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../supabase';

// Вспомогательный компонент для карточек статистики
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
  const { id } = useParams(); // Получаем ID из URL для динамического роутинга
  const navigate = useNavigate();
  const { show } = useToast();

  // Достаем данные и функции из стора
  const {
    user, logout, userGoals, userCheckpoints, fetchUserGoalsAndCheckpoints,
    following = [], followUser, unfollowUser, deleteCheckpoint, fetchProfileById
  } = useAppStore();

  const [targetUser, setTargetUser] = useState(null);
  const [targetStats, setTargetStats] = useState({ followers: 0, following: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Определяем, чей это профиль
  const isOwnProfile = !id || id === user?.id;
  const currentId = id || user?.id;

  useEffect(() => {
    async function loadProfile() {
      if (!currentId) return;
      setLoading(true);

      // Чтение одного элемента (Критерий ТЗ: Read One by ID)
      const profile = await fetchProfileById(currentId);
      if (profile) setTargetUser(profile);

      // Загрузка статистики подписчиков
      const [fowlers, fowing] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', currentId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', currentId)
      ]);

      setTargetStats({
        followers: fowlers.count || 0,
        following: fowing.count || 0
      });

      // Загрузка целей и достижений конкретного пользователя
      await fetchUserGoalsAndCheckpoints(currentId);
      setLoading(false);
    }

    loadProfile();
    // Исправлена ошибка с .length через optional chaining
  }, [currentId, following?.length, fetchProfileById, fetchUserGoalsAndCheckpoints]);

  const handleFollowAction = async () => {
    if (following.includes(currentId)) {
      await unfollowUser(currentId);
      show('Вы отписались', 'info');
    } else {
      await followUser(currentId);
      show('Вы подписались!', 'success');
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Удалить этот шаг из вашей истории?")) {
      const ok = await deleteCheckpoint(postId);
      if (ok) show("Запись удалена", "success");
    }
  };

  if (loading && !targetUser) {
    return <div className="p-20 text-center font-black animate-pulse" style={{ color: 'var(--text-primary)' }}>Загрузка профиля...</div>;
  }

  // Данные профиля для отображения
  const profileData = isOwnProfile ? {
    firstName: user?.user_metadata?.firstName || 'Malika',
    lastName: user?.user_metadata?.lastName || '',
    bio: user?.user_metadata?.bio || 'Строю будущее, шаг за шагом.',
    avatarUrl: user?.user_metadata?.avatarUrl || null,
  } : {
    firstName: targetUser?.first_name || 'Builder',
    lastName: targetUser?.last_name || '',
    bio: targetUser?.bio || 'Участник сообщества Nexus.',
    avatarUrl: targetUser?.avatar_url || null,
  };

  const initials = profileData.firstName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen pb-32 max-w-5xl mx-auto px-4 pt-8 md:pt-16" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* HEADER SECTION */}
      <section className="relative mb-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-40 h-40 rounded-[3rem] border-8 shadow-2xl overflow-hidden bg-white flex items-center justify-center"
              style={{ borderColor: 'var(--bg-card)' }}
            >
              {profileData.avatarUrl
                ? <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                : <span className="text-5xl font-black text-blue-600">{initials}</span>
              }
            </motion.div>
          </div>

          <div className="flex-1 text-center md:text-left pt-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <h1 className="text-5xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {profileData.firstName} {profileData.lastName}
              </h1>
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[11px] font-black uppercase tracking-widest border border-emerald-500/20">
                <ShieldCheck size={12} className="inline mr-1" /> Verified
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
                  <button onClick={() => setIsEditModalOpen(true)}
                    className="h-12 px-8 rounded-2xl font-black text-[14px] bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl active:scale-95 transition-all">
                    Редактировать
                  </button>
                  <button onClick={async () => { await logout(); navigate('/'); }}
                    className="h-12 px-6 rounded-2xl font-black border-2 hover:bg-red-500 hover:text-white transition-all opacity-40 hover:opacity-100"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <button onClick={handleFollowAction}
                    className={`h-12 px-8 rounded-2xl font-black text-[14px] shadow-xl active:scale-95 transition-all ${following.includes(currentId) ? 'bg-muted-foreground/10 text-primary' : 'bg-blue-600 text-white'}`}>
                    {following.includes(currentId) ? 'Отписаться' : 'Подписаться'}
                  </button>
                  <button 
                    onClick={() => {
                      const ids = [user.id, currentId].sort();
                      navigate(`/app/chats/private_${ids[0]}_${ids[1]}`);
                    }}
                    className="h-12 px-6 rounded-2xl font-black border-2 flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
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

      {/* STATISTICS MATRIX */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <DashboardCard title="Пульс Энергии" value="84" sub="+12% к неделе" icon={Zap} color="#3b82f6" delay={0.1} />
        <DashboardCard title="Цели" value={userGoals?.length || 0} sub="В процессе" icon={Target} color="#10b981" delay={0.2} />
        <DashboardCard title="Подписчики" value={targetStats.followers} sub="Сообщество" icon={Search} color="#8b5cf6" delay={0.3} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN: INFO */}
        <div className="lg:col-span-1">
          <div className="card p-6 bg-muted-foreground/5 border-none shadow-xl">
            <h3 className="text-[12px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2">
              <MapPin size={14} /> Локация
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">🏔️</div>
              <div>
                <div className="font-black text-base" style={{ color: 'var(--text-primary)' }}>Бишкек</div>
                <div className="text-xs font-bold text-blue-600">Созидатель</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMELINE (CRUD: Read/Delete) */}
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-[12px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2 px-2">
            <Activity size={14} /> Хроника достижений
          </h3>

          <div className="space-y-4">
            {userCheckpoints?.length > 0 ? (
              userCheckpoints.slice().reverse().map((cp, idx) => (
                <motion.div key={cp.id}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                  className="card p-6 border-none shadow-lg relative group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-[11px] font-bold opacity-40">
                      {new Date(cp.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                    </div>
                    {/* DELETE ACTION (Критерий ТЗ) */}
                    {isOwnProfile && (
                      <button onClick={() => handleDeletePost(cp.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {cp.image_url && (
                    <div className="mb-4 rounded-2xl overflow-hidden border">
                      <img src={cp.image_url} alt="" className="w-full h-auto max-h-[300px] object-cover" />
                    </div>
                  )}

                  <p className="text-[16px] font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {cp.content}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="card p-12 text-center border-dashed border-2 opacity-30">
                <p className="text-sm font-black uppercase tracking-widest">Здесь пока пусто</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profileData={profileData}
        />
      )}
    </div>
  );
}