import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/store";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";

export default function PitchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pitches, fetchPitches, sendMessage, user } = useAppStore();
  const [pitch, setPitch] = useState(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Fallback to fetch if not loaded
  useEffect(() => {
    if (!pitches || pitches.length === 0) {
      fetchPitches();
    }
  }, [pitches, fetchPitches]);

  useEffect(() => {
    if (pitches && pitches.length > 0) {
      const found = pitches.find(p => p.id === id);
      setPitch(found);
    }
  }, [id, pitches]);

  const handleSend = async () => {
    if (!message.trim() || !pitch) return;
    setIsSending(true);
    const success = await sendMessage(pitch.id, pitch.user_id, message);
    setIsSending(false);
    if (success) {
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 3000);
    } else {
      alert("Ошибка отправки сообщения (возможно, вы не авторизованы)");
    }
  };

  if (!pitch) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-base)" }}>
        <p style={{ color: "var(--text-muted)" }}>Загрузка или проект не найден...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 h-[52px] flex items-center gap-3"
        style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(16px)" }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5">
          <ArrowLeft size={20} style={{ color: "var(--text-primary)" }} />
        </button>
        <span className="font-bold text-[18px]" style={{ color: "var(--text-primary)" }}>Проект</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 shadow-sm mb-6"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          
          <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{pitch.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {Array.isArray(pitch.tech_stack) ? pitch.tech_stack.map((tech, i) => (
              <span key={i} className="text-[12px] font-semibold px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: "rgba(132,204,22,0.1)", color: "#65a30d", border: "1px solid rgba(132,204,22,0.2)" }}>
                {tech}
              </span>
            )) : null}
          </div>

          <p className="text-[15px] leading-relaxed whitespace-pre-wrap mb-8" style={{ color: "var(--text-secondary)" }}>
            {pitch.description}
          </p>

          <div className="pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: "var(--text-primary)" }}>Связаться с автором</h3>
            
            {pitch.user_id === user?.id ? (
              <p className="text-[13px] italic" style={{ color: "var(--text-muted)" }}>Вы не можете отправить сообщение самому себе.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <textarea 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  rows={4} 
                  placeholder="Привет! Я заинтересован в вашем проекте..."
                  className="input-base resize-none p-3 text-[14px]" 
                  style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border)", width: "100%", outline: "none", borderRadius: "12px" }}
                />
                <button 
                  onClick={handleSend}
                  disabled={isSending || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "var(--text-primary)" }}>
                  <Send size={16} /> {isSending ? 'Отправка...' : 'Отправить сообщение'}
                </button>
                {sent && (
                  <p className="text-[13px] text-center text-green-500 font-medium mt-2">Сообщение успешно отправлено!</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
