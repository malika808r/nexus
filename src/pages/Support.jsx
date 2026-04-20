import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Search, Book, ChevronRight, MessageSquare, Sparkles, Shield } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';

export default function Support() {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState(null);
  const { show } = useToast();
  const { t } = useTranslation();

  const FAQ = [
    { q: t('support.faq.q1'), a: t('support.faq.a1') },
    { q: t('support.faq.q2'), a: t('support.faq.a2') },
    { q: t('support.faq.q3'), a: t('support.faq.a3') }
  ];

  const filteredFaq = FAQ.filter(item => 
    item.q.toLowerCase().includes(search.toLowerCase()) || 
    item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12 text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center gap-6 mb-8"
        >
          <div className="w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl glow-card-primary relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))' }}>
            <HelpCircle size={40} strokeWidth={2.5} />
            <motion.div 
              animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full scale-150" 
            />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>{t('support.title')}</h1>
            <p className="text-lg font-medium opacity-60 max-w-lg">
              {t('support.subtitle')}
            </p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="relative max-w-2xl group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:scale-110 transition-transform" size={24} />
          <input 
            type="text" 
            placeholder={t('support.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-16 h-20 text-lg shadow-2xl"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Book className="text-emerald-600" /> {t('support.knowledgeBase')}
          </h2>
          
          {filteredFaq.map((item, idx) => (
            <div key={idx} className="card overflow-hidden border-none shadow-xl">
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-6 flex items-center justify-between text-left transition-colors hover:bg-muted-foreground/5"
              >
                <span className="font-bold text-[17px] pr-8">{item.q}</span>
                <ChevronRight size={20} className={`transition-transform duration-300 ${openIndex === idx ? 'rotate-90 text-blue-600' : 'opacity-30'}`} />
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-[15px] leading-relaxed opacity-70 font-medium pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {filteredFaq.length === 0 && (
            <div className="text-center py-12 opacity-30">
              <Search size={48} className="mx-auto mb-4" />
              <p className="text-lg font-black uppercase tracking-widest">{t('support.nothingFound')}</p>
            </div>
          )}
        </div>

        {/* Contact Sidebar */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <MessageSquare className="text-blue-600" /> {t('support.contacts')}
          </h2>

          <div className="card p-6 border-none shadow-xl bg-gradient-to-br from-pink-500/5 to-transparent">
            <Sparkles size={24} className="text-blue-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">{t('support.directLink')}</h3>
            <p className="text-sm opacity-60 mb-6 leading-relaxed">
              {t('support.directLinkDesc')}
            </p>
            <button 
              onClick={() => window.open('https://t.me/nexus_support_mock', '_blank')}
              className="btn-pulse w-full py-4 text-[14px]"
            >
              {t('support.writeTelegram')}
            </button>
          </div>

          <div className="card p-6 border-none shadow-xl">
            <Shield size={24} className="text-emerald-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">{t('support.safety')}</h3>
            <p className="text-sm opacity-60 mb-4 leading-relaxed">{t('support.safetyDesc')}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
