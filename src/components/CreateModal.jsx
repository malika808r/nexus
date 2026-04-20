import { useState, useRef } from "react";
import { useAppStore } from "../store/store";
import { useToast } from "./ui/Toast";
import { supabase } from "../supabase";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";

export default function CreateModal({ isOpen, onClose }) {
  const { userGoals, addCheckpoint, addGoal, user } = useAppStore();
  const { show } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [checkpointText, setCheckpointText] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [newGoalTitle, setNewGoalTitle] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleClose = () => {
    onClose();
    setTimeout(() => resetForm(), 300);
  };

  const resetForm = () => {
    setCheckpointText(""); setNewGoalTitle(""); setSelectedGoalId("");
    setImageFile(null); setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('post_images').upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from('post_images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!checkpointText.trim()) return;
    setLoading(true);
    try {
      let goalId = selectedGoalId;
      
      // If no goal is selected, try to find or create a default one
      if (!goalId) {
        if (newGoalTitle.trim()) {
           const g = await addGoal(newGoalTitle);
           if (g) goalId = g.id;
        } else if (userGoals && userGoals.length > 0) {
           // Use the most recent goal as default
           goalId = userGoals[0].id;
        } else {
           // Create a default life goal
           const g = await addGoal(t('feed.defaultGoal'));
           if (g) goalId = g.id;
        }
      }

      let imageUrl = null;
      if (imageFile) imageUrl = await uploadImage(imageFile);
      const ok = await addCheckpoint(goalId, checkpointText, imageUrl);
      if (ok) {
        show(t('feed.successPublish'), "success");
        handleClose();
      } else {
        show(t('common.error'), "error");
      }
    } catch (err) {
      show(t('common.error'), "error");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = checkpointText.trim().length > 0 && !loading;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
          />

          {/* Sheet */}
          <motion.div key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:w-[520px] md:left-1/2 md:-translate-x-1/2 md:bottom-10 md:rounded-[2rem] rounded-t-[2rem]"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)" }}
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full mx-auto mt-4 bg-muted-foreground/20" />

            <div className="px-7 py-7">
              {/* Header */}
              <div className="flex items-center justify-between mb-7">
                <div>
                  <h3 className="text-[22px] font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                    {t('feed.shareStep')}
                  </h3>
                  <p className="text-[13px] font-medium opacity-40 mt-0.5">{t('feed.whatYouDid')}</p>
                </div>
                <button onClick={handleClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-muted-foreground/10"
                  style={{ color: "var(--text-muted)" }}>
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Goal selector */}
                {userGoals?.length > 0 ? (
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest opacity-40 mb-2" style={{ color: "var(--text-secondary)" }}>
                      {t('feed.toWhichGoal')}
                    </label>
                    <select
                      value={selectedGoalId}
                      onChange={e => setSelectedGoalId(e.target.value)}
                      className="input-base text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <option value="">{t('feed.noGoalSelected')}</option>
                      {userGoals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest opacity-40 mb-2" style={{ color: "var(--text-secondary)" }}>
                      {t('feed.goalNamePlaceholder')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('feed.goalExample')}
                      value={newGoalTitle}
                      onChange={e => setNewGoalTitle(e.target.value)}
                      className="input-base text-sm"
                    />
                  </div>
                )}

                {/* Post text */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest opacity-40 mb-2" style={{ color: "var(--text-secondary)" }}>
                    {t('feed.shareStep')} *
                  </label>
                  <textarea
                    value={checkpointText}
                    onChange={e => setCheckpointText(e.target.value)}
                    placeholder={t('feed.stepPlaceholder')}
                    rows={4}
                    className="input-base resize-none text-[15px]"
                    autoFocus
                  />
                </div>

                {/* Image Upload */}
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="relative w-full h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all overflow-hidden"
                  style={{ borderColor: "var(--border)" }}
                >
                  <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <ImageIcon className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={22} className="mb-1.5 opacity-30" />
                      <span className="text-[11px] font-black uppercase tracking-widest opacity-30">{t('feed.addPhoto')}</span>
                    </>
                  )}
                </div>

                {/* Submit */}
                <button
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  className="btn-pulse w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? t('feed.publishing') : t('feed.publishToFeed')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
