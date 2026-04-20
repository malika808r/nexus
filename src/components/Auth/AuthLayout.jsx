import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300" 
         style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* Ambient blobs - they subtly shift with theme via opacity and color */}
      <motion.div 
        animate={{ x: [0, 80, -40, 0], y: [0, -80, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[30%] -left-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full blur-[120px] pointer-events-none opacity-20 dark:opacity-30"
        style={{ backgroundColor: '#1d4ed8' }}
      />
      <motion.div 
        animate={{ x: [0, -100, 60, 0], y: [0, 80, -40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full blur-[120px] pointer-events-none opacity-20 dark:opacity-30"
        style={{ backgroundColor: '#047857' }}
      />

      {/* Logo */}
      <button onClick={() => navigate('/')} className="absolute top-6 left-6 flex items-center gap-2 z-50">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg shadow-xl"
             style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-base)' }}>
          N
        </div>
        <span className="font-black text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>NEXUS</span>
      </button>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        className="relative z-10 w-full max-w-md rounded-[32px] border shadow-[0_32px_80px_rgba(0,0,0,0.1)] overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', backdropFilter: 'blur(40px)' }}
      >
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-[32px]" />
        <div className="relative z-10">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}
