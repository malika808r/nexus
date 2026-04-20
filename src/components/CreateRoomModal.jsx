import { useState } from "react";
import { useAppStore } from "../store/store";
import { useToast } from "./ui/Toast";
import { useTranslation } from "react-i18next";
import { Sparkles, Code, Music, Trophy, MessageCircle, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ICONS = [
  { id: 'Sparkles', icon: Sparkles, label: 'Инсайт' },
  { id: 'Code', icon: Code, label: 'Разработка' },
  { id: 'Music', icon: Music, label: 'Атмосфера' },
  { id: 'Trophy', icon: Trophy, label: 'Победа' },
  { id: 'MessageCircle', icon: MessageCircle, label: 'Общение' },
];

const COLORS = [
  { id: 'blue', name: 'Royal Blue', class: 'from-blue-500 to-indigo-600' },
  { id: 'emerald', name: 'Emerald', class: 'from-emerald-500 to-teal-600' },
  { id: 'pink', name: 'Rose', class: 'from-pink-500 to-rose-600' },
  { id: 'orange', name: 'Vulcan', class: 'from-orange-500 to-red-600' },
];

export default function CreateRoomModal({ isOpen, onClose }) {
  const { addRoom } = useAppStore();
  const { show } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState('MessageCircle');
  const [selectedColor, setSelectedColor] = useState('blue');

  const handleClose = () => {
    onClose();
    setTitle("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    try {
      const colorClass = COLORS.find(c => c.id === selectedColor)?.class || 'from-blue-500 to-indigo-600';
      addRoom(title.trim(), selectedIcon, colorClass);
      show(t('rooms.success'), "success");
      handleClose();
    } catch (err) {
      show(t('common.error'), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-0 m-auto z-50 w-full max-w-[480px] h-fit p-8 rounded-[2.5rem] shadow-2xl overflow-hidden"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {t('rooms.modalTitle')}
                </h3>
                <p className="text-sm font-medium opacity-40 mt-0.5">{t('rooms.modalSubtitle')}</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-xl hover:bg-muted-foreground/10 transition-colors" style={{ color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest opacity-40 mb-3 ml-1">{t('rooms.roomName')}</label>
                <input
                  type="text"
                  placeholder="Напр: Совместный кодинг 💻"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input-base text-base font-bold"
                  autoFocus
                />
              </div>

              {/* Icon selection */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest opacity-40 mb-3 ml-1">{t('rooms.icon')}</label>
                <div className="flex gap-2">
                  {ICONS.map(i => {
                    const IconComp = i.icon;
                    return (
                      <button
                        key={i.id}
                        type="button"
                        onClick={() => setSelectedIcon(i.id)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          selectedIcon === i.id ? 'bg-blue-500 text-white shadow-lg scale-110' : 'bg-muted-foreground/5 opacity-50 hover:opacity-100'
                        }`}
                      >
                        <IconComp size={20} />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Color selection */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest opacity-40 mb-3 ml-1">{t('rooms.color')}</label>
                <div className="flex gap-3">
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.id)}
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.class} transition-all ${
                        selectedColor === c.id ? 'ring-4 ring-offset-4 ring-blue-500 scale-90' : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                 disabled={!title.trim() || loading}
                className="btn-pulse w-full h-14 flex items-center justify-center gap-2 mt-4 shadow-xl disabled:opacity-40"
              >
                {loading && <Loader2 size={24} className="animate-spin" />}
                {loading ? t('rooms.creating') : t('rooms.createRoom')}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
