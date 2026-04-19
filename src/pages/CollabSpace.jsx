import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/store";
import { Filter, Code, Palette, Microscope, X, Send } from "lucide-react";

const TAGS = [
  { id: 'all', label: 'Все', icon: Filter },
  { id: 'it', label: 'IT/Web', icon: Code },
  { id: 'design', label: 'Art & Design', icon: Palette },
  { id: 'biotech', label: 'BioTech', icon: Microscope },
];

export default function CollabSpace() {
  const { pitches, fetchPitches } = useAppStore();
  const [activeTag, setActiveTag] = useState('all');
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchPitches(); }, []);

  const filteredPitches = activeTag === 'all' ? pitches : pitches?.filter(p => {
    if (!p.tech_stack) return false;
    const n = p.tech_stack.map(s => s.toLowerCase());
    if (activeTag === 'it') return n.some(s => ['react', 'node', 'js', 'python', 'front', 'back'].some(k => s.includes(k)));
    if (activeTag === 'design') return n.some(s => ['figma', 'ui', 'ux', 'design', 'дизайн'].some(k => s.includes(k)));
    if (activeTag === 'biotech') return n.some(s => ['bio', 'med', 'мед'].some(k => s.includes(k)));
    return false;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 h-[52px] flex items-center"
        style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(16px)" }}>
        <span className="font-bold text-[18px]" style={{ color: "var(--text-primary)" }}>Инкубатор</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-5 pb-24">
        {/* Sub */}
        <p className="text-[14px] mb-5" style={{ color: "var(--text-muted)" }}>Находите команды и запускайте проекты</p>

        {/* Фильтры */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-5 no-scrollbar">
          {TAGS.map(tag => (
            <button key={tag.id} onClick={() => setActiveTag(tag.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap text-[13px] font-semibold transition-all shrink-0"
              style={{
                backgroundColor: activeTag === tag.id ? "var(--text-primary)" : "var(--bg-card)",
                color: activeTag === tag.id ? "var(--bg-base)" : "var(--text-secondary)",
                border: "1px solid var(--border)"
              }}
            >
              <tag.icon size={16} />
              {tag.label}
            </button>
          ))}
        </div>

        {/* Карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPitches?.map((pitch, idx) => (
            <motion.div key={pitch.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="rounded-2xl p-5 flex flex-col"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-[16px] font-bold mb-2" style={{ color: "var(--text-primary)" }}>{pitch.title}</h3>
              <p className="text-[13px] leading-relaxed mb-4 flex-1 line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                {pitch.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {pitch.tech_stack?.map((tech, i) => (
                  <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                    style={{ backgroundColor: "rgba(132,204,22,0.1)", color: "#65a30d", border: "1px solid rgba(132,204,22,0.2)" }}>
                    {tech}
                  </span>
                ))}
              </div>
              <button onClick={() => setSelectedPitch(pitch)}
                className="w-full py-3 rounded-xl text-[14px] font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg, #ec4899, #84cc16)" }}>
                Присоединиться
              </button>
            </motion.div>
          ))}
          {(!filteredPitches || filteredPitches.length === 0) && (
            <div className="col-span-full py-20 text-center rounded-2xl text-[14px]"
              style={{ backgroundColor: "var(--bg-card)", border: "1px dashed var(--border)", color: "var(--text-muted)" }}>
              Проектов по этому направлению пока нет
            </div>
          )}
        </div>
      </div>

      {/* Модалка отклика */}
      <AnimatePresence>
        {selectedPitch && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedPitch(null)}
              className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 m-auto z-50 w-full max-w-md h-fit rounded-2xl p-6 shadow-2xl"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[17px] font-bold" style={{ color: "var(--text-primary)" }}>Связаться с автором</h3>
                <button onClick={() => setSelectedPitch(null)} className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--bg-input)", color: "var(--text-muted)" }}>
                  <X size={16} />
                </button>
              </div>
              <div className="p-3 rounded-xl mb-4 text-[13px]" style={{ backgroundColor: "var(--bg-input)" }}>
                <span style={{ color: "var(--text-muted)" }}>Отклик на: </span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{selectedPitch.title}</span>
              </div>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Привет! Я Frontend разработчик, готов помочь с вашим проектом..."
                className="input-base resize-none mb-3" />
              <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--text-primary)" }}>
                <Send size={16} /> Отправить сообщение
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
