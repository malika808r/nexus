import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, XCircle, Camera } from 'lucide-react';
import { useAppStore } from '../../store/store';
import { useTranslation } from 'react-i18next';

export default function EditProfileModal({ 
  isOpen, 
  onClose, 
  profileData, 
  setProfileData,
  handleAvatarUpload
}) {
  const [interestInput, setInterestInput] = useState('');
  const { t } = useTranslation();

  const handleSave = async () => {
    const { updateProfile } = useAppStore.getState();
    await updateProfile({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      bio: profileData.bio,
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
            <div className="flex items-center justify-between px-6 md:px-10 py-6 md:py-8">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('editProfile.title')}</h2>
              <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all hover:bg-muted-foreground/10" 
                      style={{ color: 'var(--text-primary)' }}>
                <X size={24} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10 space-y-10 md:space-y-12 no-scrollbar">
              
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 text-center sm:text-left">
                <div className="relative">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] border-4 shadow-2xl overflow-hidden bg-muted-foreground/5 flex items-center justify-center"
                       style={{ borderColor: 'var(--bg-card)' }}>
                    {profileData.avatarUrl ? (
                      <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-3xl md:text-4xl font-black text-blue-600">{profileData.firstName?.charAt(0) || 'A'}</div>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-10 h-10 bg-slate-900 shadow-xl rounded-2xl flex items-center justify-center text-white cursor-pointer transition-transform hover:scale-110 active:scale-95">
                    <Camera size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div>
                   <h4 className="text-lg font-black mb-1">{t('editProfile.avatarTitle')}</h4>
                   <p className="text-sm opacity-40 font-medium">{t('editProfile.avatarDesc')}</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[12px] font-black uppercase tracking-widest opacity-40 px-1">{t('auth.firstName')}</label>
                    <input 
                      type="text" 
                      value={profileData.firstName || ''} 
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="input-base h-14 px-6 text-[16px] font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[12px] font-black uppercase tracking-widest opacity-40 px-1">{t('auth.lastName')}</label>
                    <input 
                      type="text" 
                      value={profileData.lastName || ''} 
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="input-base h-14 px-6 text-[16px] font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[12px] font-black uppercase tracking-widest opacity-40 px-1">{t('profile.activeGoals')}</label>
                  <textarea 
                    value={profileData.bio || ''} 
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder={t('profile.bioPlaceholder')}
                    rows={3}
                    className="input-base p-6 text-[16px] font-medium leading-relaxed resize-none" 
                  />
                </div>
              </div>


            </div>

            {/* Footer Action */}
            <div className="px-6 md:px-10 py-6 md:py-8 border-t shrink-0" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
              <button 
                onClick={handleSave}
                className="w-full h-16 md:h-18 py-4 md:py-5 rounded-2xl md:rounded-3xl text-white dark:text-slate-900 bg-slate-900 dark:bg-white text-[16px] md:text-[18px] font-black shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t('editProfile.saveBtn')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
