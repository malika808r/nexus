import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/store';
import { Heart, MessageCircle, Zap, Sparkles, Send, ChevronDown, ChevronUp, Loader2, Edit3, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ui/Toast';
import { useInView } from 'react-intersection-observer';
import PostSkeleton from '../components/ui/PostSkeleton';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// ─── Reaction Bar ───────────────────────────────────────────────────
const REACTIONS = [
  { type: 'zap', emoji: '⚡️', key: 'feed.reactions.zap' },
  { type: 'fire', emoji: '🔥', key: 'feed.reactions.fire' },
  { type: 'heart', emoji: '❤️', key: 'feed.reactions.heart' },
  { type: 'clap', emoji: '👏', key: 'feed.reactions.clap' },
];

function ReactionBar({ post, user, onReact }) {
  const [showPicker, setShowPicker] = useState(false);
  const { t } = useTranslation();
  const myReaction = post.reactions?.find(r => r.user_id === user?.id);

  // Group reactions by type
  const counts = {};
  (post.reactions || []).forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });

  return (
    <div className="relative flex items-center gap-1">
      {/* Reaction summary bubbles */}
      {Object.entries(counts).map(([type, count]) => {
        const r = REACTIONS.find(x => x.type === type);
        if (!r) return null;
        return (
          <span key={type} className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[12px] font-bold"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
            {r.emoji} {count}
          </span>
        );
      })}

      {/* Toggle picker */}
      <button
        onClick={() => setShowPicker(v => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold transition-all hover:bg-muted-foreground/10"
        style={{ color: myReaction ? 'var(--color-brand-primary)' : 'var(--text-muted)' }}
      >
        {myReaction ? REACTIONS.find(r => r.type === myReaction.type)?.emoji : '＋'}
        <span className="hidden sm:inline">{myReaction ? t(REACTIONS.find(r => r.type === myReaction.type)?.key) : t('feed.reactions.reaction')}</span>
      </button>

      {/* Picker popup */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            className="absolute bottom-full left-0 mb-2 z-20 flex gap-2 p-2 rounded-2xl shadow-2xl border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            {REACTIONS.map(r => (
              <button key={r.type}
                onClick={() => { onReact(post.id, r.type, post.goals?.user_id); setShowPicker(false); }}
                className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted-foreground/10 transition-all hover:scale-110 active:scale-95"
                title={t(r.key)}
              >
                {r.emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Comments Section ───────────────────────────────────────────────
function CommentsSection({ postId, authorId }) {
  const { comments, fetchComments, addComment, user } = useAppStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { t, i18n } = useTranslation();
  const inputRef = useRef(null);

  const postComments = comments[postId] || [];

  useEffect(() => {
    if (!loaded) {
      fetchComments(postId);
      setLoaded(true);
    }
  }, [postId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    await addComment(postId, text.trim(), authorId);
    setText('');
    setSending(false);
  };

  return (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
      {/* Comments list */}
      {postComments.length > 0 ? (
        <div className="space-y-3 mb-4">
          {postComments.map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 overflow-hidden"
                   style={{ background: 'linear-gradient(135deg, #dbeafe, #ccfbf1)', color: 'var(--color-brand-primary)' }}>
                {c.profiles?.avatar_url && c.profiles.avatar_url !== '👤'
                  ? <img src={c.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                  : (c.profiles?.first_name || 'U').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[13px] font-black" style={{ color: 'var(--text-primary)' }}>
                    {c.profiles?.first_name} {c.profiles?.last_name || ''}
                  </span>
                  <span className="text-[11px] opacity-30 font-bold">
                    {new Date(c.created_at).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[14px] font-medium mt-0.5 leading-snug" style={{ color: 'var(--text-primary)' }}>{c.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 opacity-20">
          <MessageCircle size={32} />
          <p className="text-[10px] font-black uppercase tracking-widest">{t('feed.noComments')}</p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #dbeafe, #ccfbf1)', color: 'var(--color-brand-primary)' }}>
          {user?.user_metadata?.avatarUrl
            ? <img src={user.user_metadata.avatarUrl} className="w-full h-full object-cover" alt="" />
            : (user?.user_metadata?.firstName || 'U').charAt(0)}
        </div>
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all focus-within:border-blue-500/40"
             style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t('feed.writeComment')}
            className="input-base text-sm h-11 pr-12 focus:ring-1 focus:ring-blue-500/20"
            style={{ color: 'var(--text-primary)' }}
          />
          <button type="submit" disabled={sending || !text.trim()}
            className="text-blue-600 disabled:opacity-30 transition-all hover:scale-110 active:scale-95">
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Post Card ──────────────────────────────────────────────────────
function PostCard({ post, user, onReact, navigate }) {
  const [showComments, setShowComments] = useState(false);
  const { t, i18n } = useTranslation();
  const commentCount = (useAppStore.getState().comments[post.id] || []).length;
  const reactionCount = post.reactions?.length || 0;
  const authorId = post.goals?.user_id || post.profiles?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="card p-6 hover:shadow-xl transition-all relative"
    >
      {/* Author */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => authorId && navigate(`/app/profile/${authorId}`)}
          className="flex items-center gap-3 group"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base overflow-hidden border-2 shadow-sm"
               style={{ background: 'linear-gradient(135deg, #dbeafe, #ccfbf1)', color: 'var(--color-brand-primary)', borderColor: 'var(--bg-card)' }}>
            {post.profiles?.avatar_url && post.profiles.avatar_url !== '👤'
              ? <img src={post.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
              : <span className="font-black">{(post.profiles?.first_name || '👤').charAt(0)}</span>}
          </div>
          <div className="text-left">
            <p className="font-black text-[15px] group-hover:text-blue-600 transition-colors leading-tight" style={{ color: 'var(--text-primary)' }}>
              {post.profiles?.first_name} {post.profiles?.last_name || ''}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-40">
              {new Date(post.created_at).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' })}
              {post.goals?.title && <span> · {post.goals.title}</span>}
            </p>
          </div>
        </button>

        {/* Goal badge */}
        {post.goals?.title && (
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black text-emerald-600 bg-emerald-500/10 border border-emerald-500/20">
            🎯 {t('feed.goalBadge')}
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-[16px] leading-relaxed font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
        {post.content}
      </p>

      {/* Actions bar */}
      <div className="flex items-center gap-4 pt-3 border-t flex-wrap" style={{ borderColor: 'var(--border)' }}>
        {/* Reactions */}
        <ReactionBar post={post} user={user} onReact={onReact} />

        {/* Comments toggle */}
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold transition-all hover:bg-muted-foreground/10"
          style={{ color: showComments ? 'var(--color-brand-primary)' : 'var(--text-muted)' }}
        >
          <MessageCircle size={18} className="opacity-40" />
          <span className="text-[12px] font-black uppercase tracking-widest opacity-40">{t('feed.comments')}</span>
          {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Edit button (Only for author) */}
        {authorId === user?.id && (
          <button
            onClick={() => navigate(`/app/feed/${post.id}/edit`)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600/10 transition-colors ml-auto"
          >
            <Edit3 size={14} /> {t('common.edit')}
          </button>
        )}
      </div>

      {/* Expandable comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <CommentsSection postId={post.id} authorId={authorId} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Feed Page ──────────────────────────────────────────────────────
export default function Feed() {
  const { feed, fetchFeed, user, feedLoading, hasMoreFeed, sendReaction } = useAppStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '300px' });

  useEffect(() => { fetchFeed(true); }, []);

  useEffect(() => {
    if (inView && hasMoreFeed && !feedLoading) fetchFeed();
  }, [inView, hasMoreFeed, feedLoading]);

  const handleReact = (postId, type, authorId) => {
    sendReaction(postId, type, authorId);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
               style={{ background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))' }}>
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('nav.feed')}</h1>
            <p className="text-[12px] font-black uppercase tracking-widest opacity-40">{t('feed.communitySteps')}</p>
          </div>
        </div>

        {/* Post button shortcut */}
        <button
          onClick={() => navigate('/app/feed/create')}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-dashed text-left transition-all hover:border-blue-500/40 hover:bg-blue-500/5 group"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-base overflow-hidden shrink-0"
               style={{ background: 'linear-gradient(135deg, #dbeafe, #ccfbf1)', color: 'var(--color-brand-primary)' }}>
            {user?.user_metadata?.avatarUrl
              ? <img src={user.user_metadata.avatarUrl} className="w-full h-full object-cover" alt="" />
              : (user?.user_metadata?.firstName || 'B').charAt(0)}
          </div>
          <span className="text-[14px] font-medium opacity-40 group-hover:opacity-70 transition-opacity" style={{ color: 'var(--text-primary)' }}>
            {t('feed.sharePrompt')}
          </span>
        </button>
      </header>

      {/* Feed */}
      <div className="space-y-6">
        {feedLoading && (!feed || feed.length === 0) ? (
          <div className="space-y-6">
            <PostSkeleton /><PostSkeleton /><PostSkeleton />
          </div>
        ) : !feed || (feed.length === 0 && !feedLoading) ? (
          <div className="text-center py-24 border-2 border-dashed rounded-[2.5rem]"
               style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-col items-center">
              <Sparkles size={48} className="mb-4 opacity-10" />
              <p className="text-lg font-black uppercase tracking-widest opacity-20">{t('feed.noPosts')}</p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new Event('open-create'))}
              className="mt-6 btn-pulse"
            >
              <Plus size={20} className="relative z-10" />
              <span className="font-bold relative z-10">{t('feed.newStep')}</span>
            </button>
          </div>
        ) : (
          <>
            {feed.map(post => (
              <PostCard key={post.id} post={post} user={user} onReact={handleReact} navigate={navigate} />
            ))}

            {/* Infinite scroll trigger */}
            <div ref={ref} className="py-8 flex justify-center">
              {feedLoading ? (
                <div className="space-y-6 w-full"><PostSkeleton /><PostSkeleton /></div>
              ) : hasMoreFeed ? (
                <Loader2 className="animate-spin" style={{ color: 'var(--color-brand-primary)' }} />
              ) : (
                <p className="text-center text-[11px] font-black uppercase tracking-[0.2em] opacity-20">
                  {t('feed.allCaughtUp')}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
