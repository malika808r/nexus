import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/store';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../ui/Toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';

const loginSchema = (t) => z.object({
  email: z.string().email(t('auth.invalidEmail') || 'Invalid email address'),
  password: z.string().min(6, t('auth.passwordTooShort') || 'Password must be at least 6 characters'),
});

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const { show } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({
    resolver: zodResolver(loginSchema(t)),
  });

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/app');
    } else {
      show(result.error || t('auth.invalidCredentials'), 'error');
    }
  };

  const handleRecover = () => {
    const email = getValues('email');
    if (!email) {
      show(t('auth.enterEmailToRecover') || 'Enter email to recover', 'error');
      return;
    }
    show(t('auth.recoverySent') || 'Instructions sent to your email', 'success');
  };

  return (
    <div className="p-8 md:p-14">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>{t('auth.welcome')}</h1>
        <p className="text-[15px] font-medium opacity-50 px-4" style={{ color: 'var(--text-primary)' }}>{t('auth.continue')}</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
            <input
              {...register('email')}
              type="email"
              placeholder={t('auth.email')}
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
              placeholder={t('auth.password')}
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
            {t('auth.recovery')}
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
               <span className="text-[14px] uppercase tracking-widest font-black">{t('auth.syncing')}</span>
            </div>
          ) : (
            <>
              {t('auth.loginButton')}
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
           {t('auth.dontHaveAccount')}{' '}
           <Link to="/auth/register" className="font-black text-blue-600 hover:underline">
             {t('auth.create')}
           </Link>
         </p>
      </div>
    </div>
  );
}
