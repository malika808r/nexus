import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/store';
import { useToast } from '../components/ui/Toast';
import { Sparkles, Zap, Map, Target, ArrowRight, BookOpen, Layers, Users } from 'lucide-react';
import logo from '../assets/logo.svg';
import LanguageToggle from '../components/ui/LanguageToggle';

export default function Welcome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useAppStore();
  const { show } = useToast();
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSupportClick = (item) => {
    show(`${item} ${t('common.loading')}`, 'info');
  };

  return (
    <div className="min-h-screen font-sans antialiased overflow-hidden relative flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Premium Minimal Background */}
      <div className="mesh-bg opacity-20 dark:opacity-40" />
      
      {/* ─── NAV ─── */}
      <header className="w-full px-6 md:px-12 h-[100px] flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-lg overflow-hidden">
            <img src={logo} alt="Nexus Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-black text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>NEXUS</span>
        </div>
        <div className="flex items-center gap-8">
          <LanguageToggle />
          <button onClick={() => navigate('/auth/login')} className="text-[14px] font-bold opacity-60 hover:opacity-100 transition-opacity" style={{ color: 'var(--text-primary)' }}>{t('welcomeHero.loginLink')}</button>
          <button
            onClick={() => navigate('/auth/register')}
            className="h-12 px-8 rounded-full text-white text-[14px] font-bold hover:scale-105 transition-all shadow-2xl"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-base)' }}
          >
            {t('welcomeHero.joinBtn')}
          </button>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 py-12 md:py-32">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="mb-10 inline-flex items-center gap-3 px-6 py-2 rounded-full border border-muted-foreground/10"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
        >
          <Sparkles size={14} className="text-blue-500" />
          <span className="text-[12px] font-bold uppercase tracking-widest opacity-60">{t('welcomeHero.badge')}</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
          className="text-[clamp(2.5rem,10vw,5rem)] font-black leading-[1] tracking-tight max-w-[1000px] mb-10"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('welcomeHero.title')}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
          className="text-[18px] md:text-[22px] max-w-[680px] leading-relaxed mb-16 font-medium opacity-50"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('welcomeHero.subtitle')}
        </motion.p>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col md:flex-row items-center gap-6"
        >
          <button
            onClick={() => navigate('/auth/register')}
            className="h-16 px-12 rounded-full text-[16px] font-black flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-base)' }}
          >
            {t('welcomeHero.joinBtn')}
          </button>
           <button
            onClick={scrollToFeatures}
            className="h-16 px-12 rounded-full text-[16px] font-black border-2 transition-all hover:bg-muted-foreground/5"
            style={{ borderColor: 'var(--text-primary)', color: 'var(--text-primary)' }}
          >
            {t('welcomeHero.learnMore')}
          </button>
        </motion.div>

        {/* ─── Features ─── */}
        <div ref={featuresRef} className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl w-full text-left">
           {[
             { 
               icon: Layers, 
               title: t('welcomeHero.feat1Title'), 
               desc: t('welcomeHero.feat1Desc') 
             },
             { 
               icon: Users, 
               title: t('welcomeHero.feat2Title'), 
               desc: t('welcomeHero.feat2Desc') 
             },
             { 
               icon: BookOpen, 
               title: t('welcomeHero.feat3Title'), 
               desc: t('welcomeHero.feat3Desc') 
             }
           ].map((feat, i) => (
             <motion.div
               key={feat.title}
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8, delay: 0.2 * i }}
               className="flex flex-col"
             >
                <div className="w-12 h-12 rounded-2xl bg-muted-foreground/5 flex items-center justify-center mb-8">
                  <feat.icon size={24} style={{ color: 'var(--text-primary)' }} opacity={0.6} />
                </div>
                <h3 className="text-xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>{feat.title}</h3>
                <p className="text-[15px] font-medium leading-relaxed opacity-50" style={{ color: 'var(--text-primary)' }}>{feat.desc}</p>
             </motion.div>
           ))}
        </div>

        {/* Final CTA */}
        <motion.div 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-60 mb-20 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>{t('welcomeHero.feat1Title')}?</h2>
          <p className="text-lg font-medium opacity-50 mb-10">{t('welcomeHero.subtitle')}</p>
          <button 
            onClick={() => navigate('/auth/register')}
            className="h-16 px-16 rounded-full text-[16px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-base)' }}
          >
            {t('welcomeHero.createAcc')}
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-12 py-10 flex flex-col md:flex-row items-center justify-between border-t z-50" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-base)' }}>
        <span className="text-[13px] font-bold opacity-30 tracking-widest">© 2026 NEXUS ECOSYSTEM</span>
        <div className="flex gap-12 mt-6 md:mt-0">
          <span onClick={() => handleSupportClick('Manifesto')} className="text-[12px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 cursor-pointer transition-opacity">Manifesto</span>
          <span onClick={() => handleSupportClick('Privacy Policy')} className="text-[12px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 cursor-pointer transition-opacity">Privacy Policy</span>
          <span onClick={() => handleSupportClick('Contact Us')} className="text-[12px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 cursor-pointer transition-opacity">Contact Us</span>
        </div>
      </footer>
    </div>
  );
}
