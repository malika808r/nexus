import { useState, useEffect } from 'react';
import { useAppStore } from '../store/store';
import { Target, CheckCircle2, Trophy, ArrowRight, LayoutGrid, Sparkles, BookOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ui/Toast';

export default function Basecamp() {
  const { user, userGoals, fetchUserGoalsAndCheckpoints, addGoal } = useAppStore();
  const { show } = useToast();
  const [newGoal, setNewGoal] = useState('');
  const [activeTab, setActiveTab] = useState('goals');

  useEffect(() => {
    if (user?.id) fetchUserGoalsAndCheckpoints(user.id);
  }, [user]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (newGoal.trim()) {
      await addGoal(newGoal.trim());
      setNewGoal('');
    }
  };

  const categories = [
    { id: 'all', label: 'Всё' },
    { id: 'tech', label: 'Tech' },
    { id: 'design', label: 'Design' },
    { id: 'soft', label: 'Soft Skills' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-[2rem] flex items-center justify-center text-white shadow-lg glow-card-lime"
               style={{ background: 'linear-gradient(135deg, #84cc16, #10b981)' }}>
            <Target size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Мои цели</h1>
            <p className="text-sm font-bold uppercase tracking-widest bg-lime-500/10 text-lime-600 px-3 py-1 rounded-full w-fit mt-1">Твой личный трекер развития</p>
          </div>
        </div>

        <div className="card p-6 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)]" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-muted-foreground/5 flex items-center justify-center shrink-0">
              <Sparkles size={24} className="text-lime-500" />
            </div>
            <p className="text-[15px] font-medium leading-relaxed opacity-70">
              Это ваше пространство для фокусировки. Ставьте амбициозные цели, разбивайте их на малые шаги и следите за реальным ростом. Каждое действие имеет значение.
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 mb-8 border-b" style={{ borderColor: 'var(--border)' }}>
        {[
          { id: 'goals', label: 'Мои цели', icon: Target },
          { id: 'edu', label: 'Knowledge Hub', icon: BookOpen }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 flex items-center gap-2 text-[15px] font-black transition-all relative ${activeTab === tab.id ? '' : 'opacity-40 hover:opacity-100'}`}
            style={{ color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            <tab.icon size={18} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="campTab" className="absolute bottom-0 left-0 right-0 h-[4px] rounded-t-full" style={{ backgroundColor: '#84cc16' }} />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'goals' ? (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key="goals" className="space-y-6">
            {/* Add Goal Input */}
            <form onSubmit={handleAddGoal} className="flex gap-4 mb-10">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Чего вы хотите достичь?"
                className="input-base flex-1 shadow-sm"
              />
              <button type="submit" className="btn-pulse px-8 h-14" style={{ background: '#000', color: '#fff' }}>
                Поставить цель
              </button>
            </form>

            {/* Goals List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userGoals?.length === 0 ? (
                <div className="col-span-2 text-center py-20 border-2 border-dashed rounded-[3rem] opacity-30">
                  <Target size={48} className="mx-auto mb-4" />
                  <p className="text-lg font-black uppercase tracking-widest">Целей пока нет</p>
                </div>
              ) : (
                userGoals.map((goal, idx) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="card p-6 hover:shadow-2xl transition-all glow-card-lime relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                       <div className="w-10 h-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-600">
                         <Target size={20} />
                       </div>
                       <Trophy size={18} className="opacity-20" />
                    </div>
                    <h3 className="text-xl font-black mb-3 pr-8">{goal.title}</h3>
                    <div className="relative h-2 bg-muted-foreground/10 rounded-full overflow-hidden mb-6">
                       <div className="absolute top-0 left-0 h-full bg-lime-500 transition-all duration-1000" style={{ width: '30%' }} />
                    </div>
                     <button 
                       onClick={() => show('Загрузка детальной статистики...', 'info')}
                       className="w-full h-12 rounded-xl border-2 font-bold text-sm transition-all hover:bg-slate-900 hover:text-white"
                       style={{ borderColor: 'var(--border)' }}
                     >
                       Открыть трекер
                     </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="edu" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[
                 { title: 'UX Design Mastery', author: 'NEXUS Academy', time: '12h', color: '#ec4899' },
                 { title: 'Python for Startups', author: 'Base Camp Tech', time: '8h', color: '#84cc16' }
               ].map((course, i) => (
                 <div 
                   key={i} 
                   onClick={() => show('Этот курс скоро станет доступным', 'success')}
                   className="card p-5 group cursor-pointer overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full" style={{ backgroundColor: course.color }} />
                    <div className="flex gap-4">
                       <div className="w-20 h-20 rounded-2xl bg-muted-foreground/5 shrink-0 flex items-center justify-center text-2xl">📚</div>
                       <div>
                          <h4 className="font-black text-lg mb-1 leading-tight group-hover:text-pink-500 transition-colors">{course.title}</h4>
                          <p className="text-xs font-bold opacity-50 uppercase tracking-widest">{course.author}</p>
                          <div className="flex items-center gap-3 mt-4">
                             <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest opacity-40"><Clock size={12}/> {course.time}</span>
                             <span className="text-[11px] font-black uppercase tracking-widest text-lime-600 px-2 py-0.5 bg-lime-500/10 rounded-md">Free</span>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
