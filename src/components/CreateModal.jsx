import { useState, useRef } from "react";
import { X, ChevronLeft, Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/store";
import { useToast } from "./ui/Toast";
import { supabase } from "../supabase";

export default function CreateModal({ isOpen, onClose }) {
  const [createMode, setCreateMode] = useState("menu");
  const { userGoals, addCheckpoint, addPitch, addGoal, user } = useAppStore();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  const [checkpointText, setCheckpointText] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [pitchTitle, setPitchTitle] = useState("");
  const [pitchDesc, setPitchDesc] = useState("");
  const [pitchStack, setPitchStack] = useState("");
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCreateMode("menu");
      resetForm();
    }, 300);
  };

  const resetForm = () => {
    setCheckpointText(""); setPitchTitle(""); setPitchDesc(""); setPitchStack(""); setNewGoalTitle("");
    setImageFile(null); setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('post_images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('post_images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmitCheckpoint = async () => {
    if (!checkpointText.trim()) return;
    setLoading(true);
    try {
      let goalId = selectedGoalId;
      if (!goalId && newGoalTitle.trim()) {
        const g = await addGoal(newGoalTitle);
        if (g) goalId = g.id;
      }
      
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const ok = await addCheckpoint(goalId, checkpointText, imageUrl);
      if (ok) {
        show("Прогресс сохранен!", "success");
        handleClose();
      }
    } catch (error) {
      show("Ошибка при сохранении", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPitch = async () => {
    if (!pitchTitle.trim() || !pitchDesc.trim()) return;
    setLoading(true);
    try {
      const stack = pitchStack.split(",").map(s => s.trim()).filter(Boolean);
      const ok = await addPitch(pitchTitle, pitchDesc, stack);
      if (ok) {
        show("Питч запущен в Radar!", "success");
        handleClose();
      }
    } catch (error) {
      show("Ошибка при запуске", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
          />
          <motion.div key="sheet"
            initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:w-[480px] md:left-1/2 md:-translate-x-1/2 md:bottom-10 md:rounded-[32px] rounded-t-[32px]"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="w-12 h-1 rounded-full mx-auto mt-4 bg-muted-foreground/20" />
            <div className="px-8 py-8">
              <div className="flex items-center justify-between mb-8">
                {createMode !== "menu" && (
                  <button onClick={() => setCreateMode("menu")} className="p-2 -ml-2 rounded-xl transition-colors hover:bg-muted-foreground/10" style={{ color: "var(--text-primary)" }}>
                    <ChevronLeft size={24} />
                  </button>
                )}
                <h3 className="text-xl font-black flex-1 tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {createMode === "menu" ? "Новое действие" : createMode === "checkpoint" ? "Шаг к цели" : "Питч проекта"}
                </h3>
                <button onClick={handleClose} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-muted-foreground/10" style={{ color: "var(--text-muted)" }}>
                  <X size={20} />
                </button>
              </div>

              {createMode === "menu" && (
                <div className="space-y-3 pb-4">
                  {[
                    { mode: "checkpoint", emoji: "⚡️", title: "Зафиксировать прогресс", sub: "Что вы сделали сегодня?" },
                    { mode: "pitch", emoji: "🎯", title: "Запустить проект", sub: "Найдите команду для идеи" },
                  ].map(item => (
                    <button key={item.mode} onClick={() => setCreateMode(item.mode)}
                      className="w-full flex items-center gap-4 p-5 rounded-3xl text-left border transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)" }}
                    >
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-white shadow-sm">{item.emoji}</div>
                      <div>
                        <div className="font-bold text-[16px]" style={{ color: "var(--text-primary)" }}>{item.title}</div>
                        <div className="text-[13px] font-medium opacity-60" style={{ color: "var(--text-secondary)" }}>{item.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {createMode === "checkpoint" && (
                <div className="space-y-4 pb-4">
                  {userGoals?.length > 0 ? (
                    <select value={selectedGoalId} onChange={e => setSelectedGoalId(e.target.value)} className="input-base">
                      <option value="" disabled>Выберите вашу цель</option>
                      {userGoals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                  ) : (
                    <input type="text" placeholder="Какова ваша глобальная цель?" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} className="input-base" />
                  )}
                  
                  <textarea value={checkpointText} onChange={e => setCheckpointText(e.target.value)} placeholder="Опишите ваш сегодняшний шаг..." rows={4} className="input-base resize-none" />
                  
                  {/* Image Upload Area */}
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="relative w-full h-32 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500/50 transition-all overflow-hidden"
                  >
                    <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <ImageIcon className="text-white" size={24} />
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={24} className="text-muted-foreground/40 mb-2" />
                        <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">Добавить фото</span>
                      </>
                    )}
                  </div>

                  <button 
                    disabled={loading || !checkpointText.trim()}
                    onClick={handleSubmitCheckpoint} 
                    className="btn-pulse w-full mt-2 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {loading ? "Публикация..." : "Опубликовать"}
                  </button>
                </div>
              )}

              {createMode === "pitch" && (
                <div className="space-y-4 pb-4">
                  <input type="text" placeholder="Название проекта" value={pitchTitle} onChange={e => setPitchTitle(e.target.value)} className="input-base" />
                  <textarea value={pitchDesc} onChange={e => setPitchDesc(e.target.value)} placeholder="В чем суть и кого вы ищете?" rows={3} className="input-base resize-none" />
                  <input type="text" placeholder="Стек (React, Figma, AI...)" value={pitchStack} onChange={e => setPitchStack(e.target.value)} className="input-base" />
                  <button 
                    disabled={loading || !pitchTitle.trim()}
                    onClick={handleSubmitPitch} 
                    className="btn-pulse w-full mt-2 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {loading ? "Запуск..." : "Запустить Radar"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
