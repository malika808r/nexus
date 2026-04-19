import { useState } from 'react';
import { HelpCircle, Book, MessageSquare, Shield, ChevronRight, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ui/Toast';

const FAQ = [
  { 
    q: 'Что такое Nexus?', 
    a: 'Nexus — это экосистема для созидателей. Мы верим в действия, а не в слова. Здесь вы ставите цели в одноименном разделе, находите партнеров через Поиск и делитесь реальными шагами в ленте Pulse.' 
  },
  { 
    q: 'Как работает Поиск?', 
    a: 'Раздел Поиска сканирует сообщество на предмет нужных вам навыков. Если вам нужен кодер или дизайнер, просто введите запрос, и система покажет тех, кто готов к коллаборации.' 
  },
  { 
    q: 'Зачем мне раздел Цели?', 
    a: 'Это ваш личный трекер. Здесь вы фиксируете, к чему стремитесь, и разбиваете большие задачи на малые этапы, чтобы не терять фокус.' 
  }
];

export default function Support() {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState(null);
  const { show } = useToast();

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
          <div className="w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl glow-card-pink relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #ec4899, #84cc16)' }}>
            <HelpCircle size={40} strokeWidth={2.5} />
            <motion.div 
              animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full scale-150" 
            />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>Help Center</h1>
            <p className="text-lg font-medium opacity-60 max-w-lg">
              Мы здесь, чтобы помочь вам построить будущее. Ищите ответы или свяжитесь с нами напрямую.
            </p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="relative max-w-2xl group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-500 group-focus-within:scale-110 transition-transform" size={24} />
          <input 
            type="text" 
            placeholder="Как мне запитчить проект? Как найти ментора?..."
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
            <Book className="text-lime-500" /> База знаний
          </h2>
          
          {filteredFaq.map((item, idx) => (
            <div key={idx} className="card overflow-hidden border-none shadow-xl">
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-6 flex items-center justify-between text-left transition-colors hover:bg-muted-foreground/5"
              >
                <span className="font-bold text-[17px] pr-8">{item.q}</span>
                <ChevronRight size={20} className={`transition-transform duration-300 ${openIndex === idx ? 'rotate-90 text-pink-500' : 'opacity-30'}`} />
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
              <p className="text-lg font-black uppercase tracking-widest">Ничего не найдено</p>
            </div>
          )}
        </div>

        {/* Contact Sidebar */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <MessageSquare className="text-pink-500" /> Контакты
          </h2>

          <div className="card p-6 border-none shadow-xl bg-gradient-to-br from-pink-500/5 to-transparent">
            <Sparkles size={24} className="text-pink-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">Прямая связь</h3>
            <p className="text-sm opacity-60 mb-6 leading-relaxed">
              Есть идея по улучшению Nexus или возникла проблема? Напишите нашему основателю напрямую.
            </p>
            <button 
              onClick={() => window.open('https://t.me/nexus_support_mock', '_blank')}
              className="btn-pulse w-full py-4 text-[14px]"
            >
              Написать в Telegram
            </button>
          </div>

          <div className="card p-6 border-none shadow-xl">
            <Shield size={24} className="text-lime-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">Безопасность</h3>
            <p className="text-sm opacity-60 mb-1 leading-relaxed">Nexus — это безопасная среда для всех.</p>
            <button 
              onClick={() => show('Правила загружаются...', 'info')}
              className="text-[14px] font-black uppercase tracking-widest text-pink-500 hover:underline text-left w-full"
            >
              Правила сообщества
            </button>
          </div>
        </div>
      </div>

      {/* Stats/Social visualization */}
      <div className="mt-20 flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
         <div className="text-center">
            <div className="text-3xl font-black">1.2k+</div>
            <div className="text-[10px] font-black uppercase tracking-widest">Builders</div>
         </div>
         <div className="text-center">
            <div className="text-3xl font-black">450</div>
            <div className="text-[10px] font-black uppercase tracking-widest">Projects</div>
         </div>
         <div className="text-center">
            <div className="text-3xl font-black">8.4k</div>
            <div className="text-[10px] font-black uppercase tracking-widest">Checkpoints</div>
         </div>
      </div>
    </div>
  );
}
