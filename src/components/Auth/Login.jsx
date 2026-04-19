import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/store';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../ui/Toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const { show } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/app');
    } else {
      show(result.error || 'Неверный email или пароль', 'error');
    }
  };

  const handleRecover = () => {
    const email = getValues('email');
    if (!email) {
      show('Введите email для восстановления', 'error');
      return;
    }
    show('Инструкции отправлены на вашу почту', 'success');
  };

  return (
    <div className="p-8 md:p-14">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>Добро пожаловать.</h1>
        <p className="text-[15px] font-medium opacity-50 px-4" style={{ color: 'var(--text-primary)' }}>Введите свои данные для продолжения.</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
            <input
              {...register('email')}
              type="email"
              placeholder="Email"
              className={`input-base !pl-12 ${errors.email ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 font-bold ml-2">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
            <input
              {...register('password')}
              type="password"
              placeholder="Пароль"
              className={`input-base !pl-12 ${errors.password ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.password && <p className="text-xs text-red-500 font-bold ml-2">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end pr-2">
          <button 
            type="button"
            onClick={handleRecover}
            className="text-[11px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            Восстановить доступ
          </button>
        </div>

        <motion.button
          type="submit" disabled={loading}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="group w-full h-14 mt-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              Войти
              <div className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:rotate-45"
                   style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                <ArrowRight size={16} />
              </div>
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-12 text-center">
         <p className="text-sm font-medium opacity-50" style={{ color: 'var(--text-primary)' }}>
           Нет аккаунта?{' '}
           <Link to="/auth/register" className="font-black text-pink-500 hover:underline">
             Создать
           </Link>
         </p>
      </div>
    </div>
  );
}