import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/store';
import { motion } from 'framer-motion';
import { Send, Target, ChevronLeft, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';

export default function CreatePostPage() {
  const { user, userGoals, fetchUserGoalsAndCheckpoints, addCheckpoint } = useAppStore();
  const [content, setContent] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { show } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) fetchUserGoalsAndCheckpoints(user.id);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedGoal || isSubmitting) return;

    setIsSubmitting(true);
    const success = await addCheckpoint(selectedGoal, content.trim());
    
    if (success) {
      show(t('common.success'), 'success');
      navigate('/app/feed');
    } else {
      show(t('common.error'), 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity mb-8"
      >
        <ChevronLeft size={16} /> {t('common.back')}
      </button>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-[2rem] flex items-center justify-center text-white shadow-2xl"
             style={{ background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))' }}>
          <Sparkles size={28} />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('feed.createPost')}</h1>
          <p className="text-[12px] font-black uppercase tracking-widest opacity-40 mt-0.5">{t('feed.whatHappened')}</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 border-2 border-blue-500/10"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-3 block">{t('feed.selectGoal')}</label>
            <div className="grid grid-cols-1 gap-3">
              {userGoals.length === 0 ? (
                <div className="p-4 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2 text-center" style={{ borderColor: 'var(--border)' }}>
                  <Target size={24} className="opacity-20" />
                  <p className="text-[13px] font-medium opacity-40">{t('profile.noSteps')}</p>
                  <button 
                    type="button"
                    onClick={() => navigate('/app/goals')}
                    className="text-[12px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                  >
                    Создать первую цель →
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userGoals.map(goal => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all border-2 ${
                        selectedGoal === goal.id 
                          ? 'border-blue-500 bg-blue-500/10 text-blue-600 scale-105' 
                          : 'border-transparent bg-muted-foreground/5 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {goal.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-3 block">{t('profile.pulse')}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('feed.whatHappened')}
              className="w-full h-40 p-5 rounded-2xl border-2 outline-none transition-all text-[15px] font-medium leading-relaxed resize-none focus:border-blue-500/40"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || !selectedGoal}
            className="btn-pulse w-full h-14 flex items-center justify-center gap-3 shadow-xl disabled:opacity-30 disabled:scale-100"
          >
            {isSubmitting ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <Send size={20} />
                {t('common.publish')}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
