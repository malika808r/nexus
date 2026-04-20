import { useAppStore } from "../../store/store";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";

const LANGUAGES = ['ru', 'en', 'ky'];

export default function LanguageToggle() {
  const { language, setLanguage } = useAppStore();

  const toggleLanguage = () => {
    const currentIndex = LANGUAGES.indexOf(language);
    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
    setLanguage(LANGUAGES[nextIndex]);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all bg-muted-foreground/5 hover:bg-muted-foreground/10 group"
      title="Change Language"
    >
      <Globe size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-primary)" }} />
      <span className="text-[12px] font-black uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
        {language}
      </span>
    </button>
  );
}
