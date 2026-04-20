import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Music, Code, Trophy, Sparkles, Plus, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/store';
import CreateRoomModal from '../components/CreateRoomModal';

const ICON_MAP = {
  Sparkles,
  Music,
  Code,
  Trophy,
  MessageCircle
};

export default function CommunityRooms() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { rooms, fetchRooms } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-[2rem] flex items-center justify-center text-white shadow-lg glow-card-pink"
               style={{ background: 'linear-gradient(135deg, #1d4ed8, #8b5cf6)' }}>
            <MessageCircle size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('rooms.title')}</h1>
            <p className="text-sm font-bold uppercase tracking-widest bg-blue-600/10 text-pink-600 px-3 py-1 rounded-full w-fit mt-1">{t('rooms.subtitle')}</p>
          </div>
        </div>

        <div className="card p-6 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)]" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-muted-foreground/5 flex items-center justify-center shrink-0">
              <Info size={24} className="text-blue-600" />
            </div>
            <p className="text-[15px] font-medium leading-relaxed opacity-70">
              {t('rooms.description')}
            </p>
          </div>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room, idx) => {
          const IconComp = ICON_MAP[room.icon] || MessageCircle;
          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/app/chats/${room.id}`)}
              className="card p-8 cursor-pointer group hover:glow-card-pink relative overflow-hidden"
            >
               {/* Background Pattern */}
               <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 rounded-full bg-gradient-to-br from-white to-transparent" />
               
               <div className="flex items-start justify-between relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl bg-gradient-to-br ${room.color} group-hover:scale-110 transition-transform`}>
                     <IconComp size={26} />
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Now</span>
                     <span className="text-[18px] font-black">{room.count}</span>
                  </div>
               </div>

               <div className="mt-8 relative z-10">
                  <h3 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{room.title}</h3>
                  <p className="text-sm font-medium opacity-50">{t('rooms.description').split('.')[0]}</p>
               </div>

               <div className="mt-6 flex items-center gap-2 relative z-10">
                  <div className="flex -space-x-2">
                     {[1,2,3].map(i => (
                       <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden bg-slate-200">
                          <img src={`https://i.pravatar.cc/30?img=${i+idx*10}`} alt="avatar" />
                       </div>
                     ))}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest opacity-40">+{Math.max(0, room.count - 3)} {t('common.others')}</span>
               </div>
            </motion.div>
          );
        })}

        {/* Create Custom Room Placeholder */}
        <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="card p-8 border-dashed flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer min-h-[220px]"
        >
           <div className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center mb-4 transition-colors group-hover:border-blue-500">
              <Plus size={24} />
           </div>
           <p className="font-black uppercase tracking-widest text-[12px]">{t('rooms.createRoom')}</p>
        </motion.div>
      </div>

      <CreateRoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
