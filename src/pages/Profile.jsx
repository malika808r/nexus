import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, MapPin, Check, Camera, Settings, Grid, Activity, 
  ChevronRight, Sparkles, Target, Zap, Search, ShieldCheck
} from 'lucide-react';
import EditProfileModal from '../components/profile/EditProfileModal';
import { useToast } from '../components/ui/Toast';

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
  const navigate = useNavigate();
  const { 
    user, logout, userGoals, userCheckpoints, fetchUserGoalsAndCheckpoints 
  } = useAppStore();
  const { show } = useToast();

  useEffect(() => {
    if (user?.id) fetchUserGoalsAndCheckpoints(user.id);
  }, [user]);

  const [activeTab, setActiveTab] = useState('path');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const profileData = {
    firstName: user?.user_metadata?.firstName || 'Builder',
    lastName: user?.user_metadata?.lastName || '',
    bio: user?.user_metadata?.bio || 'Строю будущее, шаг за шагом.',
    avatarUrl: user?.user_metadata?.avatarUrl || null,
    skills: user?.user_metadata?.skills || ['Product Design', 'React'],
    location: user?.user_metadata?.location || 'Алматы'
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) navigate('/');
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
                : <span className="text-5xl font-black text-pink-500">{initials}</span>
              }
            </motion.div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="absolute -bottom-2 -right-2 w-12 h-12 bg-white dark:bg-slate-900 shadow-xl rounded-2xl flex items-center justify-center border transition-all hover:bg-pink-500 hover:text-white"
              style={{ borderColor: 'var(--border)' }}
            >
              <Camera size={20} />
            </button>
          </div>

          {/* Info Area */}
          <div className="flex-1 text-center md:text-left pt-2">
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <h1 className="text-5xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-lime-500/10 text-lime-600 rounded-full text-[11px] font-black uppercase tracking-widest border border-lime-500/20">
                   <ShieldCheck size={12} /> Verified Builder
                </div>
             </div>
             
             <p className="text-lg font-medium opacity-50 mb-8 max-w-xl leading-relaxed">
               {profileData.bio}
             </p>

             <div className="flex flex-wrap justify-center md:justify-start gap-4">
               <button onClick={() => setIsEditModalOpen(true)}
                       className="h-12 px-8 rounded-2xl font-black text-[14px] bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-all shadow-xl hover:scale-105 active:scale-95">
                 Настройки профиля
               </button>
               <button onClick={handleLogout}
                       className="h-12 px-6 rounded-2xl font-black text-[14px] border-2 transition-all hover:bg-red-500 hover:text-white hover:border-red-500 opacity-40 hover:opacity-100"
                       style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                 <LogOut size={18} />
               </button>
             </div>
          </div>
        </div>
      </section>

      {/* ─── FUNCTIONAL MATRIX ─── */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <DashboardCard 
          title="Пульс Энергии" 
          value="84" 
          sub="+12% к прошлой неделе" 
          icon={Zap} 
          color="#ec4899" 
          delay={0.1} 
        />
        <DashboardCard 
          title="Активные цели" 
          value={userGoals?.length || 0} 
          sub="3 шага до финиша" 
          icon={Target} 
          color="#84cc16" 
          delay={0.2} 
        />
        <DashboardCard 
          title="Найдено связей" 
          value="12" 
          sub="На Радаре" 
          icon={Search} 
          color="#8b5cf6" 
          delay={0.3} 
        />
        <div 
           onClick={() => show('Функции Nexus Pro скоро будут доступны', 'info')}
           className="card p-6 flex flex-col justify-center bg-gradient-to-br from-pink-500 to-lime-500 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer"
        >
           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative z-10 flex flex-col items-center">
              <Sparkles size={32} className="mb-2" />
              <div className="text-center">
                 <div className="text-[12px] font-black uppercase tracking-widest mb-1">Nexus Pro</div>
                 <div className="text-[10px] font-bold opacity-80 leading-tight">Ваши достижения публичны</div>
              </div>
           </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* LEFT: Skills & Radar Status */}
        <div className="lg:col-span-1 space-y-10">
           <div className="space-y-4">
              <h3 className="text-[12px] font-black uppercase tracking-widest opacity-40 px-2 flex items-center gap-2">
                 <Grid size={14} /> Мои суперсилы
              </h3>
              <div className="flex flex-wrap gap-2">
                 {profileData.skills.map((s, i) => (
                    <motion.div 
                      key={s} 
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      className="px-4 py-2 bg-muted-foreground/5 rounded-xl text-[13px] font-bold border border-muted-foreground/10 hover:border-pink-500/20 transition-all cursor-default"
                    >
                      {s}
                    </motion.div>
                 ))}
                 <button 
                    onClick={() => show('Редактирование навыков доступно в настройках профиля', 'info')}
                    className="px-4 py-2 rounded-xl text-[13px] font-black border-2 border-dashed border-muted-foreground/20 opacity-40 hover:opacity-100 transition-opacity"
                 >
                   +
                 </button>
              </div>
           </div>

           <div className="card p-6 border-none shadow-xl bg-muted-foreground/5">
              <h3 className="text-[12px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2">
                 <MapPin size={14} /> Локация и радар
              </h3>
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">🏔️</div>
                 <div>
                    <div className="font-black text-base">{profileData.location}</div>
                    <div className="text-xs font-bold text-pink-500">В поиске: Ко-фаундер</div>
                 </div>
              </div>
              <button 
                onClick={() => navigate('/app/search')}
                className="w-full h-12 rounded-xl bg-white dark:bg-slate-800 font-bold text-[13px] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                 Настроить Radar
              </button>
           </div>
        </div>

        {/* RIGHT: Timeline / Real Path */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-[12px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                 <Activity size={14} /> Хроника достижений
              </h3>
              <button 
                onClick={() => show('Фильтрация событий в разработке', 'info')}
                className="text-[11px] font-black uppercase tracking-widest text-pink-500 hover:underline"
              >
                Фильтр
              </button>
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
                       <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-pink-500 to-lime-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                       <div className="flex items-start justify-between mb-4">
                          <div className="text-[11px] font-bold uppercase tracking-widest opacity-40">
                             {new Date(cp.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                          </div>
                          <Zap size={14} className="opacity-10 group-hover:text-pink-500 group-hover:opacity-100 transition-all" />
                       </div>
                       <p className="text-[16px] font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {cp.content}
                       </p>
                    </motion.div>
                 ))
              ) : (
                 <div className="card p-12 text-center border-dashed border-2 opacity-30">
                    <Zap size={32} className="mx-auto mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">Нет шагов</p>
                    <p className="text-xs mt-1">Начните свой путь сегодня</p>
                 </div>
              )}
           </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profileData}
        setProfileData={() => {}} // Store handles updates
        handleAvatarUpload={() => {}}
      />
    </div>
  );
}