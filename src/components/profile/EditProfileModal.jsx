import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, XCircle, Camera } from 'lucide-react';
import { useAppStore } from '../../store/store';

export default function EditProfileModal({ 
  isOpen, 
  onClose, 
  profileData, 
  setProfileData,
  handleAvatarUpload
}) {
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !profileData.skills?.includes(skillInput.trim())) {
      setProfileData({ ...profileData, skills: [...(profileData.skills || []), skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setProfileData({ ...profileData, skills: profileData.skills.filter(s => s !== skill) });
  };

  const handleSave = async () => {
    const { updateProfile } = useAppStore.getState();
    await updateProfile({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      bio: profileData.bio,
      skills: profileData.skills,
      interests: profileData.interests,
      avatarUrl: profileData.avatarUrl
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xl"
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ y: '100%', opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] md:top-20 md:bottom-20 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl rounded-t-[40px] md:rounded-[40px] flex flex-col overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)]"
            style={{ backgroundColor: 'var(--bg-base)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-8">
              <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Редактировать</h2>
              <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-full transition-all hover:bg-muted-foreground/10" 
                      style={{ color: 'var(--text-primary)' }}>
                <X size={24} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-12 no-scrollbar">
              
              {/* Avatar Section */}
              <div className="flex items-center gap-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-[2.5rem] border-4 shadow-2xl overflow-hidden bg-muted-foreground/5 flex items-center justify-center"
                       style={{ borderColor: 'var(--bg-card)' }}>
                    {profileData.avatarUrl ? (
                      <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-4xl font-black text-pink-500">{profileData.firstName?.charAt(0) || 'A'}</div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-11 h-11 bg-slate-900 shadow-xl rounded-2xl flex items-center justify-center text-white cursor-pointer transition-transform hover:scale-110 active:scale-95">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div>
                   <h4 className="text-lg font-black mb-1">Фото профиля</h4>
                   <p className="text-sm opacity-40 font-medium">Рекомендуется квадратное изображение</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[12px] font-black uppercase tracking-widest opacity-40 px-1">Имя</label>
                    <input 
                      type="text" 
                      value={profileData.firstName || ''} 
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="input-base h-14 px-6 text-[16px] font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[12px] font-black uppercase tracking-widest opacity-40 px-1">Фамилия</label>
                    <input 
                      type="text" 
                      value={profileData.lastName || ''} 
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="input-base h-14 px-6 text-[16px] font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[12px] font-black uppercase tracking-widest opacity-40 px-1">О себе</label>
                  <textarea 
                    value={profileData.bio || ''} 
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Ваш манифест или цели..."
                    rows={3}
                    className="input-base p-6 text-[16px] font-medium leading-relaxed resize-none" 
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                   <label className="text-[12px] font-black uppercase tracking-widest opacity-40 px-1">Навыки и суперсилы</label>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-20">{profileData.skills?.length || 0}/10</span>
                </div>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={skillInput} 
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    placeholder="Design, React, AI..."
                    className="input-base h-14 px-6 flex-1 text-[16px] font-bold"
                  />
                  <button type="button" onClick={addSkill} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0">
                    <Plus size={24} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills?.map(skill => (
                    <motion.div key={skill} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                         className="flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-bold bg-muted-foreground/5 border border-muted-foreground/10"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="opacity-40 hover:opacity-100 hover:text-red-500 transition-all text-lg leading-none">×</button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="px-10 py-10 border-t" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
              <button 
                onClick={handleSave}
                className="w-full h-18 py-5 rounded-3xl text-white dark:text-slate-900 bg-slate-900 dark:bg-white text-[18px] font-black shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Сохранить изменения
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
