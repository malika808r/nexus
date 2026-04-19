import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/store';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../ui/Toast';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Имя должно быть не менее 2 символов'),
  lastName: z.string().min(2, 'Фамилия должна быть не менее 2 символов'),
  email: z.string().email('Некорректный email адрес'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export default function Register() {
  const navigate = useNavigate();
  const { register: signUp, loading } = useAuthStore();
  const { show } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const result = await signUp(data.email, data.password, data.firstName, data.lastName);
    if (result.success) {
      navigate('/app');
    } else {
      show(result.error || 'Ошибка при регистрации', 'error');
    }
  };

  return (
    <div className="p-8 md:p-14">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>Добро пожаловать.</h1>
        <p className="text-[15px] font-medium opacity-50 px-4" style={{ color: 'var(--text-primary)' }}>Создайте аккаунт для продолжения.</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                {...register('firstName')}
                type="text"
                placeholder="Имя"
                className={`input-base !pl-12 ${errors.firstName ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.firstName && <p className="text-xs text-red-500 font-bold ml-2">{errors.firstName.message}</p>}
          </div>
          <div className="flex-1 space-y-1">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                {...register('lastName')}
                type="text"
                placeholder="Фамилия"
                className={`input-base !pl-12 ${errors.lastName ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.lastName && <p className="text-xs text-red-500 font-bold ml-2">{errors.lastName.message}</p>}
          </div>
        </div>

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