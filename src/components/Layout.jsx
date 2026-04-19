import { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { Home, Map, Target, User, Plus, Moon, Sun, Sparkles, HelpCircle, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/store";
import InteractiveGuide from "./ui/InteractiveGuide";
import CreateModal from "./CreateModal";
import logo from "../assets/logo.svg";

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

const getNavItems = (t, unreadCount) => [
  { path: "/app/feed",      icon: Home,           label: t('nav.feed') },
  { path: "/app/search",    icon: Map,            label: t('nav.search') },
  { isAction: true },
  { path: "/app/notifications", icon: Bell,       label: "Уведомления", badge: unreadCount > 0 ? unreadCount : null },
  { path: "/app/profile",   icon: User,           label: t('nav.profile') },
];

function BottomNav({ onCreateOpen }) {
  const { t } = useTranslation();
  const { unreadNotificationsCount } = useAppStore();
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");
  const NAV_ITEMS = getNavItems(t, unreadNotificationsCount);

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
          <Link key={idx} to={item.path} className="flex flex-col items-center gap-1 transition-all relative">
            <div className={`p-2 rounded-xl transition-all ${active ? 'bg-pink-500/10 scale-110' : ''}`}>
              <Icon
                size={24}
                strokeWidth={active ? 2.5 : 2}
                style={{ color: active ? "#ec4899" : "var(--text-muted)" }}
              />
              {item.badge && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[var(--bg-card)]">
                  {item.badge}
                </span>
              )}
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
  const { unreadNotificationsCount } = useAppStore();
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");
  const navigate = useNavigate();
  const NAV_ITEMS = getNavItems(t, unreadNotificationsCount);

  return (
    <aside className="hidden md:flex flex-col h-screen w-[280px] shrink-0 p-4 sticky top-0 transition-all duration-500">
      <div className="card h-full flex flex-col overflow-hidden border-none shadow-2xl relative bg-white/5 backdrop-blur-3xl">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-pink-500/5 to-transparent pointer-events-none" />
        
        <div className="px-6 py-8 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl bg-white overflow-hidden">
              <img src={logo} alt="Nexus Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-xl tracking-tighter" style={{ color: "var(--text-primary)" }}>NEXUS</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 relative z-10 overflow-y-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateOpen}
            className="btn-pulse w-full flex items-center gap-3 px-4 py-3.5 mb-6 shadow-xl"
          >
            <Plus size={20} strokeWidth={3} />
            Опубликовать
          </motion.button>
          
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
                  <div className="relative">
                    <Icon size={20} strokeWidth={active ? 2.5 : 2} className="relative z-10" 
                          style={{ color: active ? "#ec4899" : "inherit" }} />
                    {item.badge && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Added Goals Link as it's separate from common nav items in some versions */}
            <Link to="/app/goals" className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-bold transition-all ${isActive('/app/goals') ? 'bg-[var(--bg-input)] text-primary' : 'text-muted-foreground'}`}>
               <Target size={20} style={{ color: isActive('/app/goals') ? "#ec4899" : "inherit" }} />
               <span>Basecamp</span>
            </Link>
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
                className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest px-3 py-2 rounded-xl bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-all font-outfit"
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

  useEffect(() => {
    const handleOpenGuide = () => setIsGuideOpen(true);
    const handleOpenCreate = () => setIsCreateOpen(true);
    
    window.addEventListener('open-guide', handleOpenGuide);
    window.addEventListener('open-create', handleOpenCreate);
    
    return () => {
      window.removeEventListener('open-guide', handleOpenGuide);
      window.removeEventListener('open-create', handleOpenCreate);
    };
  }, []);

  return (
    <div className="flex w-full min-h-screen transition-all duration-500" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Mesh Background */}
      <div className="mesh-bg fixed inset-0 pointer-events-none" />
      
      {/* Responsive Wrapper */}
      <div className="flex w-full max-w-[1440px] mx-auto min-h-screen">
        <SideNav onCreateOpen={() => setIsCreateOpen(true)} />
        
        <main className="flex-1 w-full relative transition-all duration-500 pb-[100px] md:pb-4 md:px-4 md:py-4">
           <Outlet />
        </main>
      </div>

      <BottomNav onCreateOpen={() => setIsCreateOpen(true)} />

      <InteractiveGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      
      <CreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}