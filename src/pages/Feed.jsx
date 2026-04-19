import { useState, useEffect } from 'react';
import { useAppStore } from '../store/store';
import { Zap, MessageCircle, Heart, Info, Sparkles, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ui/Toast';

export default function Feed() {
  const { feed, fetchFeed, user } = useAppStore();
  const { show } = useToast();

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleZap = (name) => {
    show(`Вы зарядили дисциплину: ${name}`, 'success');
  };

  const handlePitch = (name) => {
    show(`Переход к обсуждению проекта с ${name}...`, 'info');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      {/* Header with Explanation */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg glow-card-pink" 
               style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
            <Zap size={24} fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Pulse Feed</h1>
        </div>
        
        <div className="card p-6 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-gradient-to-br from-pink-500/10 to-lime-500/10">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
              <Info size={20} className="text-pink-500" />
            </div>
            <div>
              <h3 className="font-bold text-[16px] mb-1">Лента действий</h3>
              <p className="text-sm opacity-70 leading-relaxed font-medium">
                Здесь мы не хвастаемся результатом. Мы показываем ежедневные шаги. 
                <span className="block mt-2 font-black text-pink-500">Видите кнопку «Зарядить»? Это способ поддержать чужую дисциплину.</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        {!feed || feed.length === 0 ? (
          <div className="text-center py-20 bg-muted-foreground/5 rounded-[2.5rem] border-2 border-dashed border-muted-foreground/10">
            <Sparkles size={40} className="mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-bold" style={{ color: 'var(--text-muted)' }}>Пока здесь пусто.</p>
            <p className="text-sm font-medium mt-1 opacity-50 px-10">Будьте первой! Поделитесь своим сегодняшним маленьким шагом к большой цели.</p>
            <button 
              onClick={() => window.dispatchEvent(new Event('open-create'))}
              className="mt-6 btn-pulse"
            >
              Сделать шаг
            </button>
          </div>
        ) : (
          feed.map((post, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={post.id}
              className="card p-6 hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden border-2 shadow-sm"
                     style={{ background: 'linear-gradient(135deg, #fce7f3, #d9f99d)', color: '#ec4899', borderColor: 'var(--bg-card)' }}>
                  {post.profiles?.avatar ? (
                    <img src={post.profiles.avatar} className="w-full h-full object-cover" />
                  ) : (
                    post.profiles?.first_name?.charAt(0) || '👤'
                  )}
                </div>
                <div>
                  <h3 className="font-black text-[16px] leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {post.profiles?.first_name} {post.profiles?.last_name}
                  </h3>
                  <p className="text-[11px] font-black uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Дисциплина
                  </p>
                </div>
              </div>

              <p className="text-[17px] leading-relaxed mb-6 font-medium" style={{ color: 'var(--text-primary)' }}>
                {post.content}
              </p>

              <div className="flex items-center gap-8 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <button 
                  onClick={() => handleZap(post.profiles?.first_name)}
                  className="flex items-center gap-2 group transition-all"
                >
                  <div className="p-2 rounded-xl group-hover:bg-amber-500/10 group-active:scale-95 transition-all">
                    <Zap size={22} className="text-muted-foreground group-hover:text-amber-500 transition-colors" />
                  </div>
                  <span className="text-[13px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-amber-500">Зарядить</span>
                </button>
                <button 
                  onClick={() => handlePitch(post.profiles?.first_name)}
                  className="flex items-center gap-2 group transition-all"
                >
                  <div className="p-2 rounded-xl group-hover:bg-pink-500/10 group-active:scale-95 transition-all">
                    <MessageCircle size={22} className="text-muted-foreground group-hover:text-pink-500 transition-colors" />
                  </div>
                  <span className="text-[13px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-pink-500">Питч</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
