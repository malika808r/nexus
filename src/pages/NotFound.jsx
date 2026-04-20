import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="text-center max-w-sm">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="text-[120px] font-black leading-none mb-4"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #047857)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          404
        </motion.div>
        
        <h1 className="text-2xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>{t('common.notFound')}</h1>
        
        <p className="text-[15px] leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
          {t('common.notFoundDesc')}
        </p>

        <Link to="/app" 
          className="h-14 px-8 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-lg transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-base)' }}
        >
          <Home size={20} />
          {t('common.backToFeed')}
        </Link>
      </div>
    </div>
  );
}
