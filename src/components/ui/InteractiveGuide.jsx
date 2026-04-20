import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Sparkles, Target, LayoutGrid, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function InteractiveGuide({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useTranslation();

  const guideSteps = [
    {
      id: 'welcome',
      title: t('guide.welcome.title'),
      description: t('guide.welcome.description'),
      icon: Sparkles,
      color: '#0891b2'
    },
    {
      id: 'people',
      title: t('guide.people.title'),
      description: t('guide.people.description'),
      icon: Users,
      color: '#2563eb'
    },
    {
      id: 'goals',
      title: t('guide.goals.title'),
      description: t('guide.goals.description'),
      icon: Target,
      color: '#059669'
    },
    {
      id: 'feed',
      title: t('guide.feed.title'),
      description: t('guide.feed.description'),
      icon: LayoutGrid,
      color: '#7c3aed'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentStep(0);
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = guideSteps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md card p-8 overflow-hidden border-none shadow-[0_0_100px_rgba(0,0,0,0.5)]"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          {/* Background Highlight */}
          <div className="absolute top-0 right-0 w-40 h-40 blur-[80px] rounded-full opacity-20"
               style={{ backgroundColor: step.color }} />
          
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors group">
            <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>

          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              key={step.id}
              initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${step.color}, #000)`, color: 'white' }}
            >
              <Icon size={36} />
            </motion.div>

            <motion.h2
              key={step.title}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl font-black mb-4 tracking-tight"
            >
              {step.title}
            </motion.h2>

            <motion.p
              key={step.description}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[15px] leading-relaxed mb-8 opacity-70 font-medium"
            >
              {step.description}
            </motion.p>

            <div className="flex items-center justify-between w-full mt-4">
              <div className="flex gap-1.5">
                {guideSteps.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6' : 'w-1.5'}`}
                       style={{ backgroundColor: idx === currentStep ? step.color : 'var(--border)' }} />
                ))}
              </div>

              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button onClick={handleBack} className="h-12 px-4 rounded-2xl font-bold text-sm bg-muted-foreground/10 hover:bg-muted-foreground/20 transition-all font-outfit uppercase tracking-widest">
                    {t('guide.back')}
                  </button>
                )}
                <button 
                  onClick={handleNext}
                  className="btn-pulse h-12 px-6 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[13px]"
                  style={{ background: step.color }}
                >
                  {currentStep === guideSteps.length - 1 ? t('guide.finish') : t('guide.next')}
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
