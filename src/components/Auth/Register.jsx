import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/store';
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(email, password, firstName, lastName);
    if (result.success) {
      navigate('/app');
    } else {
      setError(result.error || 'Ошибка при регистрации');
    }
  };

  return (
    <div className="p-8 md:p-14">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>Добро пожаловать.</h1>
        <p className="text-[15px] font-medium opacity-50 px-4" style={{ color: 'var(--text-primary)' }}>Создайте аккаунт для продолжения.</p>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 rounded-2xl text-sm flex items-center gap-2 border"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <User className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
              placeholder="Имя" required className="input-base pl-12"
            />
          </div>
          <div className="relative flex-1">
            <User className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
              placeholder="Фамилия" className="input-base pl-12"
            />
          </div>
        </div>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" required className="input-base pl-12"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль" required className="input-base pl-12"
          />
        </div>

        <motion.button
          type="submit" disabled={loading}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="group w-full h-14 mt-2 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-base)' }}
        >
          {loading ? (
            <div className="flex items-center gap-3">
               <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" 
                    style={{ borderColor: 'var(--bg-base)', borderTopColor: 'transparent' }} />
               <span className="text-[14px] uppercase tracking-widest font-black">Синхронизация...</span>
            </div>
          ) : (
            <>
              Начать путь
              <div className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:rotate-45"
                   style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                <ArrowRight size={16} />
              </div>
            </>
          )}
        </motion.button>
      </form>

      <p className="text-center text-sm mt-10 font-medium opacity-50" style={{ color: 'var(--text-primary)' }}>
        Уже есть аккаунт?{' '}
        <Link to="/auth/login" className="font-black text-pink-500 hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}