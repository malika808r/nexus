import { useEffect } from 'react';
import { useAppStore } from '../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, UserPlus, Zap, Bell, Check, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const NOTIFICATION_ICONS = {
  like: { icon: Heart, color: '#ec4899', bg: 'bg-pink-500/10', text: 'оценил(а) ваш шаг' },
  follow: { icon: UserPlus, color: '#8b5cf6', bg: 'bg-purple-500/10', text: 'подписался(ась) на вас' },
  collab_request: { icon: Zap, color: '#84cc16', bg: 'bg-lime-500/10', text: 'хочет коллаборацию!' },
};

export default function Notifications() {
  const { notifications, fetchNotifications, markNotificationRead, markAllNotificationsRead } = useAppStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 md:pt-16 pb-32">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Уведомления</h1>
          <p className="text-sm font-medium opacity-50">Ваша социальная активность</p>
        </div>
        
        {notifications.some(n => !n.read) && (
          <button 
            onClick={handleMarkAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-all"
            style={{ color: 'var(--text-primary)' }}
          >
            <Check size={14} /> Прочитать все
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {notifications.length > 0 ? (
            notifications.map((n, idx) => {
              const config = NOTIFICATION_ICONS[n.type] || { icon: Bell, color: 'gray', bg: 'bg-gray-500/10', text: 'совершил(а) действие' };
              const Icon = config.icon;

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`card p-4 flex items-center gap-4 border-none transition-all hover:translate-x-1 ${!n.read ? 'bg-white dark:bg-slate-800 shadow-xl' : 'opacity-60 grayscale-[0.5]'}`}
                >
                  <Link to={`/app/profile/${n.actor_id}`} className="shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl overflow-hidden border-2 border-white dark:border-slate-600">
                       {n.actor?.avatar !== '👤' ? <img src={n.actor?.avatar} className="w-full h-full object-cover" /> : '👤'}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-[15px] truncate" style={{ color: 'var(--text-primary)' }}>
                        {n.actor?.first_name} {n.actor?.last_name}
                      </span>
                      <div className={`p-1 rounded-lg ${config.bg}`} style={{ color: config.color }}>
                        <Icon size={12} strokeWidth={3} />
                      </div>
                    </div>
                    <p className="text-[13px] font-medium text-secondary truncate">
                      {config.text}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 mt-1 block">
                      {new Date(n.created_at).toLocaleDateString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {!n.read && (
                    <button 
                      onClick={() => markNotificationRead(n.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted-foreground/10 transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Check size={18} />
                    </button>
                  )}
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-20 text-center space-y-4"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-muted-foreground/5 flex items-center justify-center mx-auto">
                <Bell size={32} className="opacity-20" />
              </div>
              <div>
                <p className="text-lg font-black opacity-30 uppercase tracking-tighter">Тишина</p>
                <p className="text-sm font-medium opacity-20">Уведомления появятся здесь</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
