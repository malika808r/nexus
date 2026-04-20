import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/store';
import { motion } from 'framer-motion';
import { Save, ChevronLeft, Loader2, Edit3, Trash2 } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';

export default function EditPostPage() {
  const { id } = useParams();
  const { fetchCheckpointById, updateCheckpoint, deleteCheckpoint, user } = useAppStore();
  const [content, setContent] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState(null);
  const navigate = useNavigate();
  const { show } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const loadPost = async () => {
      const data = await fetchCheckpointById(id);
      if (data) {
        // Проверка владельца
        if (data.goals?.user_id !== user?.id) {
          show(t('common.error'), 'error');
          navigate('/app/feed');
          return;
        }
        setPost(data);
        setContent(data.content);
      } else {
        show(t('common.noResults'), 'error');
        navigate('/app/feed');
      }
      setInitialLoading(false);
    };
    if (user) loadPost();
  }, [id, user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const result = await updateCheckpoint(id, content.trim());
    
    if (result.success) {
      show(t('common.success'), 'success');
      navigate('/app/feed');
    } else {
      show(t('common.error') + ': ' + result.error, 'error');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    
    setIsSubmitting(true);
    const success = await deleteCheckpoint(id);
    if (success) {
      show(t('feed.deleteSuccess'), 'info');
      navigate('/app/feed');
    } else {
      show(t('common.error'), 'error');
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity mb-8"
      >
        <ChevronLeft size={16} /> {t('common.back')}
      </button>

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[2rem] flex items-center justify-center text-white shadow-2xl"
               style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
            <Edit3 size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('feed.editingPost')}</h1>
            <p className="text-[12px] font-black uppercase tracking-widest opacity-40 mt-0.5">{t('feed.createPost')}</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 transition-all active:scale-90"
          title={t('common.delete')}
        >
          <Trash2 size={20} />
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-8"
      >
        <div className="mb-6 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
          <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-1">{t('feed.selectGoal')}</p>
          <p className="text-[15px] font-black text-blue-600">{post?.goals?.title}</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-3 block">{t('feed.editingPost')}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('feed.stepPlaceholder')}
              className="w-full h-40 p-5 rounded-2xl border-2 outline-none transition-all text-[15px] font-medium leading-relaxed resize-none focus:border-blue-500/40"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="btn-pulse w-full h-14 flex items-center justify-center gap-3 shadow-xl disabled:opacity-30 disabled:scale-100"
          >
            {isSubmitting ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <Save size={20} />
                {t('common.save')}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
