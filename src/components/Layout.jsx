import { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { Home, Zap, Map, Target, MessageCircle, User, Plus, X, ChevronLeft, Moon, Sun, Sparkles, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/store";
import InteractiveGuide from "./ui/InteractiveGuide";
import logo from "../assets/logo.svg";

const getNavItems = (t) => [
  { path: "/app/feed",      icon: Home,           label: t('nav.feed') },
  { path: "/app/search",    icon: Map,            label: t('nav.search') },
  { isAction: true },
  { path: "/app/goals",     icon: Target,         label: t('nav.goals') },
  { path: "/app/profile",   icon: User,           label: t('nav.profile') },
];

function ThemeToggle() {
  const { theme, setTheme } = useAppStore();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-muted-foreground/5 hover:bg-muted-foreground/10"
      style={{ color: "var(--text-primary)" }}
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

function BottomNav({ onCreateOpen }) {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");
  const NAV_ITEMS = getNavItems(t);

  return (
    <nav
      className="md:hidden fixed bottom-6 left-4 right-4 z-40 h-20 rounded-[2.5rem] flex justify-around items-center px-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border transition-all duration-500"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border)",
        backdropFilter: "blur(40px)",
      }}
    >
      {NAV_ITEMS.map((item, idx) => {
        if (item.isAction) {
          return (
            <button
              key={idx}
              onClick={onCreateOpen}
              className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-lg active:scale-95 transition-all -mt-8"
              style={{ background: "linear-gradient(135deg, #ec4899, #84cc16)" }}
            >
              <Plus size={28} strokeWidth={3} color="white" />
            </button>
          );
        }
        const active = isActive(item.path);
        const Icon = item.icon;
        return (
          <Link key={idx} to={item.path} className="flex flex-col items-center gap-1 transition-all">
            <div className={`p-2 rounded-xl transition-all ${active ? 'bg-pink-500/10 scale-110' : ''}`}>
              <Icon
                size={24}
                strokeWidth={active ? 2.5 : 2}
                style={{ color: active ? "#ec4899" : "var(--text-muted)" }}
              />
            </div>
            {active && <div className="w-1 h-1 rounded-full bg-pink-500" />}
          </Link>
        );
      })}
    </nav>
  );
}

function SideNav({ onCreateOpen }) {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");
  const navigate = useNavigate();
  const NAV_ITEMS = getNavItems(t);

  return (
    <aside className="hidden md:flex flex-col h-full w-[260px] shrink-0 p-4 transition-all duration-500">
      <div className="card h-full flex flex-col overflow-hidden border-none shadow-2xl relative">
        {/* Glow behind logo */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-pink-500/5 to-transparent pointer-events-none" />
        
        <div className="px-6 py-8 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl bg-white overflow-hidden">
              <img src={logo} alt="Nexus Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-xl tracking-tighter cursor-pointer" style={{ color: "var(--text-primary)" }} onClick={() => navigate('/')}>NEXUS</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 relative z-10">
          <button
            onClick={onCreateOpen}
            className="btn-pulse w-full flex items-center gap-3 px-4 py-3.5 mb-6 shadow-xl"
          >
            <Plus size={20} strokeWidth={3} />
            Создать
          </button>
          
          <div className="space-y-1">
            {NAV_ITEMS.filter(i => !i.isAction).map((item, idx) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-bold transition-all relative overflow-hidden"
                  style={{
                    backgroundColor: active ? "var(--bg-input)" : "transparent",
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  {active && <motion.div layoutId="nav-glow" className="absolute inset-0 bg-pink-500/5 glow-card-pink pointer-events-none" />}
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} className="relative z-10" 
                        style={{ color: active ? "#ec4899" : "inherit" }} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t relative z-10 space-y-4" style={{ borderColor: "var(--border)" }}>
           <Link
             to="/app/support"
             className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-bold transition-all ${isActive('/app/support') ? 'bg-muted-foreground/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
           >
             <HelpCircle size={18} />
             Поддержка
           </Link>

           <div className="flex items-center justify-between px-2">
              <ThemeToggle />
              <button 
                onClick={() => window.dispatchEvent(new Event('open-guide'))}
                className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest px-3 py-2 rounded-xl bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-all"
                style={{ color: "var(--text-muted)" }}
              >
                <Sparkles size={14} /> Гид
              </button>
           </div>
        </div>
      </div>
    </aside>
  );
}

export default function Layout() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState("menu");
  const { userGoals, addCheckpoint, addPitch, addGoal } = useAppStore();

  const [checkpointText, setCheckpointText] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [pitchTitle, setPitchTitle] = useState("");
  const [pitchDesc, setPitchDesc] = useState("");
  const [pitchStack, setPitchStack] = useState("");

  useEffect(() => {
    const handleOpenGuide = () => setIsGuideOpen(true);
    const handleOpenCreate = () => setIsCreateOpen(true);
    
    window.addEventListener('open-guide', handleOpenGuide);
    window.addEventListener('open-create', handleOpenCreate);
    
    // Auto-open for new sessions (mock check)
    const hasSeenGuide = localStorage.getItem('hasSeenGuide');
    if (!hasSeenGuide) {
      setTimeout(() => setIsGuideOpen(true), 1500);
      localStorage.setItem('hasSeenGuide', 'true');
    }

    return () => {
      window.removeEventListener('open-guide', handleOpenGuide);
      window.removeEventListener('open-create', handleOpenCreate);
    };
  }, []);

  const handleClose = () => {
    setIsCreateOpen(false);
    setTimeout(() => {
      setCreateMode("menu");
      setCheckpointText(""); setPitchTitle(""); setPitchDesc(""); setPitchStack(""); setNewGoalTitle("");
    }, 300);
  };

  const handleSubmitCheckpoint = async () => {
    let goalId = selectedGoalId;
    if (!goalId && newGoalTitle.trim()) {
      const g = await addGoal(newGoalTitle);
      if (g) goalId = g.id;
    }
    if (goalId && checkpointText.trim()) {
      await addCheckpoint(goalId, checkpointText);
      handleClose();
    }
  };

  const handleSubmitPitch = async () => {
    if (pitchTitle.trim() && pitchDesc.trim()) {
      const stack = pitchStack.split(",").map(s => s.trim()).filter(Boolean);
      const ok = await addPitch(pitchTitle, pitchDesc, stack);
      if (ok) handleClose();
    }
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden transition-all duration-500 overflow-x-hidden md:p-4" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Mesh Background */}
      <div className="mesh-bg" />
      
      <SideNav onCreateOpen={() => setIsCreateOpen(true)} />
      
      <main className="flex-1 overflow-y-auto pb-[120px] md:pb-4 md:rounded-[2.5rem] relative transition-all duration-500">
        <div className="md:p-4">
           <Outlet />
        </div>
      </main>

      <BottomNav onCreateOpen={() => setIsCreateOpen(true)} />

      <InteractiveGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* ── CREATE MODAL ── */}
      <AnimatePresence>
        {isCreateOpen && (
          <>
            <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleClose} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
            />
            <motion.div key="sheet"
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:w-[480px] md:left-1/2 md:-translate-x-1/2 md:bottom-10 md:rounded-[32px] rounded-t-[32px]"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
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

                {/* Forms follow the same design update... */}
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
                    <button onClick={handleSubmitCheckpoint} className="btn-pulse w-full mt-2">Опубликовать</button>
                  </div>
                )}

                {createMode === "pitch" && (
                  <div className="space-y-4 pb-4">
                    <input type="text" placeholder="Название проекта" value={pitchTitle} onChange={e => setPitchTitle(e.target.value)} className="input-base" />
                    <textarea value={pitchDesc} onChange={e => setPitchDesc(e.target.value)} placeholder="В чем суть и кого вы ищете?" rows={3} className="input-base resize-none" />
                    <input type="text" placeholder="Стек (React, Figma, AI...)" value={pitchStack} onChange={e => setPitchStack(e.target.value)} className="input-base" />
                    <button onClick={handleSubmitPitch} className="btn-pulse w-full mt-2">Запустить Radar</button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}