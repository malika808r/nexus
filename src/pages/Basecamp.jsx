import { useState, useEffect } from 'react';
import { useAppStore } from '../store/store';
import { Target, Trophy, Sparkles, BookOpen, Clock, X, Zap, TrendingUp, Calendar, CheckCircle2, BarChart3, Flame, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

// ─── Goal Tracker Modal ─────────────────────────────────────────────
function GoalTrackerModal({ goal, onClose }) {
  const { userCheckpoints } = useAppStore();
  const [checkpoints, setCheckpoints] = useState([]);
  const [newStep, setNewStep] = useState('');
  const [adding, setAdding] = useState(false);

  // Filter checkpoints for this goal
  useEffect(() => {
    const filtered = (userCheckpoints || []).filter(cp => cp.goal_id === goal.id);
    setCheckpoints(filtered.slice().reverse());
  }, [userCheckpoints, goal.id]);

  const progress = Math.min(100, checkpoints.length * 20);

  // Build last 7 days activity map
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
  });

  const activityMap = {};
  checkpoints.forEach(cp => {
    const key = new Date(cp.created_at).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
    activityMap[key] = (activityMap[key] || 0) + 1;
  });
  const maxActivity = Math.max(...last7.map(d => activityMap[d] || 0), 1);

  // Streak: consecutive days with activity
  let streak = 0;
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
    if (activityMap[key]) streak++;
    else if (i < 6) break;
  }

  const handleAddStep = async (e) => {
    e.preventDefault();
    if (!newStep.trim()) return;
    setAdding(true);
    const { addCheckpoint } = useAppStore.getState();
    await addCheckpoint(goal.id, newStep.trim());
    setNewStep('');
    setAdding(false);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed inset-x-4 top-6 bottom-6 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[680px] md:max-h-[88vh] z-50 rounded-[2rem] flex flex-col overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-8 pb-6 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
                 style={{ background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))' }}>
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                {goal.title}
              </h2>
              <p className="text-[12px] font-black uppercase tracking-widest mt-1 opacity-40">
                Создано {new Date(goal.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-muted-foreground/10 shrink-0 ml-4 mt-1"
            style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 no-scrollbar">

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Шагов', value: checkpoints.length, icon: Zap, color: '#3b82f6' },
              { label: 'Прогресс', value: `${progress}%`, icon: TrendingUp, color: '#10b981' },
              { label: 'Серия', value: `${streak}д`, icon: Flame, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="card p-5 border-none shadow-lg flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 blur-2xl opacity-20 rounded-full" style={{ backgroundColor: s.color }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${s.color}18`, color: s.color }}>
                  <s.icon size={20} />
                </div>
                <div className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Progress Bar ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                <BarChart3 size={14} /> Общий прогресс
              </span>
              <span className="text-[13px] font-black" style={{ color: progress === 100 ? '#10b981' : 'var(--color-brand-primary)' }}>
                {progress === 100 ? '✓ Завершено!' : `${progress}%`}
              </span>
            </div>
            <div className="relative h-4 bg-muted-foreground/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ background: progress === 100 ? '#10b981' : 'linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary))' }}
              />
              {/* Milestone ticks */}
              {[25, 50, 75].map(m => (
                <div key={m} className="absolute top-0 bottom-0 w-px bg-white/40" style={{ left: `${m}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] font-bold opacity-30">
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
            <p className="text-[12px] font-medium opacity-50 mt-2">
              {checkpoints.length === 0
                ? 'Добавьте первый шаг ниже, чтобы начать трекинг'
                : `Ещё ${Math.max(0, 5 - checkpoints.length)} шагов до 100% — не останавливайтесь!`}
            </p>
          </div>

          {/* ── Activity Chart (last 7 days) ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} className="opacity-40" />
              <h4 className="text-[12px] font-black uppercase tracking-widest opacity-40">Активность за 7 дней</h4>
            </div>
            <div className="flex items-end gap-2 h-20">
              {last7.map((day, i) => {
                const count = activityMap[day] || 0;
                const height = count ? Math.max(20, (count / maxActivity) * 100) : 8;
                const isToday = i === 6;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                      className="w-full rounded-t-lg relative"
                      style={{
                        background: count > 0
                          ? (isToday ? 'linear-gradient(180deg, var(--color-brand-primary), var(--color-brand-secondary))' : 'var(--color-brand-primary)')
                          : 'var(--border)',
                        opacity: count > 0 ? 1 : 0.4,
                      }}
                    >
                      {count > 0 && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-black" style={{ color: 'var(--color-brand-primary)' }}>
                          {count}
                        </div>
                      )}
                    </motion.div>
                    <span className="text-[9px] font-bold uppercase opacity-30 whitespace-nowrap">{day.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Add new step ── */}
          <div>
            <h4 className="text-[12px] font-black uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">
              <Plus size={14} /> Добавить шаг
            </h4>
            <form onSubmit={handleAddStep} className="flex gap-3">
              <input
                type="text"
                value={newStep}
                onChange={e => setNewStep(e.target.value)}
                placeholder="Что вы сделали сегодня?"
                className="input-base flex-1 text-sm"
              />
              <button
                type="submit"
                disabled={adding || !newStep.trim()}
                className="px-6 h-14 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-50 shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))' }}
              >
                {adding ? '...' : 'Записать'}
              </button>
            </form>
          </div>

          {/* ── Checkpoints Timeline ── */}
          <div>
            <h4 className="text-[12px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} /> История шагов ({checkpoints.length})
            </h4>
            {checkpoints.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-2xl opacity-20">
                <Zap size={32} className="mx-auto mb-3" />
                <p className="text-sm font-black uppercase tracking-widest">Пока нет шагов</p>
                <p className="text-xs mt-1">Добавьте первый шаг выше</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkpoints.map((cp, idx) => (
                  <motion.div
                    key={cp.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-2xl border relative group"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                  >
                    {/* timeline dot */}
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{cp.content}</p>
                      <p className="text-[11px] font-bold uppercase tracking-widest opacity-30 mt-1">
                        {new Date(cp.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0 mt-0.5">+1</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-bold opacity-40">
              {progress === 100 ? '🎉 Цель достигнута! Отличная работа!' : `Продолжайте — ты на ${progress}% пути!`}
            </p>
            <button onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:bg-muted-foreground/10"
              style={{ color: 'var(--text-muted)' }}>
              Закрыть
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function Basecamp() {
  const { user, userGoals, userCheckpoints, fetchUserGoalsAndCheckpoints, addGoal } = useAppStore();
  const [newGoal, setNewGoal] = useState('');
  const [activeTab, setActiveTab] = useState('goals');
  const [selectedGoal, setSelectedGoal] = useState(null);

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-[2rem] flex items-center justify-center text-white shadow-lg glow-card-secondary"
               style={{ background: 'linear-gradient(135deg, var(--color-brand-secondary), var(--color-brand-accent))' }}>
            <Target size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Мои цели</h1>
            <p className="text-sm font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full w-fit mt-1">Твой личный трекер развития</p>
          </div>
        </div>

        <div className="card p-6 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)]" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-muted-foreground/5 flex items-center justify-center shrink-0">
              <Sparkles size={24} className="text-cyan-600" />
            </div>
            <p className="text-[15px] font-medium leading-relaxed opacity-70">
              Ставьте амбициозные цели, разбивайте их на малые шаги и следите за реальным ростом. Нажмите <strong>«Открыть трекер»</strong> чтобы увидеть аналитику.
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
              <motion.div layoutId="campTab" className="absolute bottom-0 left-0 right-0 h-[4px] rounded-t-full" style={{ backgroundColor: 'var(--color-brand-primary)' }} />
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
              <button type="submit" disabled={!newGoal.trim()} className="btn-pulse px-8 h-14 disabled:opacity-50" style={{ background: '#000', color: '#fff' }}>
                Поставить цель
              </button>
            </form>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!userGoals || userGoals.length === 0 ? (
                <div className="col-span-2 text-center py-20 border-2 border-dashed rounded-[3rem] opacity-30">
                  <Target size={48} className="mx-auto mb-4" />
                  <p className="text-lg font-black uppercase tracking-widest">Целей пока нет</p>
                  <p className="text-sm mt-2 opacity-60">Введите цель выше и нажмите «Поставить цель»</p>
                </div>
              ) : (
                userGoals.map((goal, idx) => {
                  const goalCheckpoints = (userCheckpoints || []).filter(cp => cp.goal_id === goal.id);
                  const progress = Math.min(100, goalCheckpoints.length * 20);
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="card p-6 hover:shadow-2xl transition-all relative overflow-hidden group"
                    >
                      {/* Glow bg */}
                      <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-5 rounded-full" style={{ background: 'var(--color-brand-secondary)' }} />

                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                          <Target size={20} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {progress === 100 && <Trophy size={16} className="text-amber-500" />}
                          <span className="text-[11px] font-black uppercase tracking-widest"
                                style={{ color: progress === 100 ? '#10b981' : 'var(--text-muted)' }}>
                            {progress === 100 ? 'Готово!' : `${progress}%`}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-black mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>{goal.title}</h3>

                      {/* Progress bar */}
                      <div className="relative h-2.5 bg-muted-foreground/10 rounded-full overflow-hidden mb-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.2, delay: idx * 0.1, ease: 'easeOut' }}
                          className="absolute top-0 left-0 h-full rounded-full"
                          style={{ background: progress === 100 ? '#10b981' : 'linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary))' }}
                        />
                      </div>
                      <p className="text-[11px] font-bold opacity-30 mb-5">
                        {goalCheckpoints.length} шагов · ещё {Math.max(0, 5 - goalCheckpoints.length)} до 100%
                      </p>

                      {/* Open Tracker Button */}
                      <button
                        onClick={() => setSelectedGoal(goal)}
                        className="w-full h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border-2 hover:scale-[1.02] active:scale-[0.98] group-hover:border-blue-500/30 group-hover:text-blue-600"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      >
                        <BarChart3 size={16} />
                        Открыть трекер
                        <ChevronRight size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="edu" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'UX Design Mastery', author: 'NEXUS Academy', time: '12h', color: 'var(--color-brand-primary)' },
                { title: 'Python for Startups', author: 'Base Camp Tech', time: '8h', color: 'var(--color-brand-accent)' }
              ].map((course, i) => (
                <div
                  key={i}
                  className="card p-5 group cursor-pointer overflow-hidden relative hover:shadow-xl transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full" style={{ backgroundColor: course.color }} />
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-muted-foreground/5 shrink-0 flex items-center justify-center text-2xl">📚</div>
                    <div>
                      <h4 className="font-black text-lg mb-1 leading-tight group-hover:text-blue-600 transition-colors">{course.title}</h4>
                      <p className="text-xs font-bold opacity-50 uppercase tracking-widest">{course.author}</p>
                      <div className="flex items-center gap-3 mt-4">
                        <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest opacity-40"><Clock size={12} /> {course.time}</span>
                        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 px-2 py-0.5 bg-emerald-500/10 rounded-md">Free</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Tracker Modal */}
      <AnimatePresence>
        {selectedGoal && (
          <GoalTrackerModal goal={selectedGoal} onClose={() => setSelectedGoal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
