import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Sparkles, Map } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Background Mesh */}
      <div className="mesh-bg fixed inset-0 pointer-events-none opacity-40" />
      
      <div className="relative z-10 text-center max-w-lg w-full">
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="card p-12 backdrop-blur-3xl border-2 border-blue-500/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]"
        >
          {/* Animated Icon Bubble */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-emerald-500 mx-auto mb-10 flex items-center justify-center shadow-2xl relative"
          >
            <Map size={40} color="white" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-[inherit] bg-white"
            />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-8xl font-black italic tracking-tighter mb-4"
            style={{ 
              background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))'
            }}
          >
            404
          </motion.h1>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black mb-6 tracking-tight" 
            style={{ color: 'var(--text-primary)' }}
          >
            Маршрут перестроен 🧭
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[16px] leading-relaxed mb-10 font-bold opacity-60" 
            style={{ color: 'var(--text-secondary)' }}
          >
            Кажется, ваша амбиция завела нас в неизведанную область. <br/>
            Давайте вернемся в основную навигацию Nexus.
          </motion.p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/app" 
              className="btn-pulse inline-flex h-16 px-12 rounded-[2rem] font-black text-[15px] uppercase tracking-widest items-center justify-center gap-3 shadow-2xl"
            >
              <Home size={20} />
              На базу Nexus
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-30"
          style={{ color: "var(--text-muted)" }}
        >
          <Sparkles size={12} />
          <span>Error Code: Ambition_Lost_404</span>
        </motion.div>
      </div>
    </div>
  );
}
