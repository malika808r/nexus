import { useState, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

function Toast({ message, type, onClose }) {
  const icons = {
    success: <CheckCircle className="text-lime-500" size={18} />,
    error: <AlertCircle className="text-pink-500" size={18} />,
    info: <Info className="text-blue-500" size={18} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className="pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border backdrop-blur-xl transition-all"
      style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderColor: 'var(--border)',
        minWidth: '280px'
      }}
    >
      <div className="shrink-0">{icons[type]}</div>
      <p className="flex-1 text-[13px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{message}</p>
      <button onClick={onClose} className="opacity-30 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </motion.div>
  );
}
