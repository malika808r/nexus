import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/store";
import { Filter, Code, Palette, Microscope, X, Search, Trash, Edit3, Save, Users, Rocket, MapPin, MessageCircle, Sparkles, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TAGS = [
  { id: 'all', label: 'Все', icon: Filter },
  { id: 'it', label: 'IT/Web', icon: Code },
  { id: 'design', label: 'Art & Design', icon: Palette },
  { id: 'biotech', label: 'BioTech', icon: Microscope },
];

const mockUsers = [
  { id: 1, name: 'Алексей К.', initials: 'АК', role: 'Full Stack Developer', skills: ['React', 'Node.js', 'Python'], location: 'Алматы', availability: 'Доступен для стартапов', status: 'online' },
  { id: 2, name: 'Мария С.', initials: 'МС', role: 'UI/UX Designer', skills: ['Figma', 'UI/UX', 'Branding'], location: 'Алматы', availability: 'Ищу команду', status: 'online' },
  { id: 3, name: 'Дмитрий В.', initials: 'ДВ', role: 'Data Scientist', skills: ['Python', 'ML', 'SQL'], location: 'Астана', availability: 'Открыт к менторству', status: 'idle' },
  { id: 4, name: 'Анеля М.', initials: 'АМ', role: 'BioTech Researcher', skills: ['BioTech', 'Data Analysis'], location: 'Алматы', availability: 'Ищу ко-фаундера', status: 'online' },
];

const CATS = [
  { id: 'all', label: 'Все', icon: Search },
  { id: 'IT', label: 'Tech', icon: Code },
  { id: 'Design', label: 'Design', icon: Palette },
  { id: 'Mentorship', label: 'Mentors', icon: Sparkles },
];

export default function CollabSpace() {
  const navigate = useNavigate();
  const { pitches, fetchPitches, deletePitch, updatePitch, user } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'people'
  const [activeTag, setActiveTag] = useState('all');
  const [activeCat, setActiveCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for edit modal
  const [editingPitch, setEditingPitch] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTech, setEditTech] = useState('');

  useEffect(() => { fetchPitches(); }, []);

  const filteredPitches = pitches?.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSearch = p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    if (activeTag === 'all') return true;
    if (!p.tech_stack) return false;
    
    const n = Array.isArray(p.tech_stack) ? p.tech_stack.map(s => s.toLowerCase()) : [];
    
    if (activeTag === 'it') return n.some(s => ['react', 'node', 'js', 'python', 'front', 'back'].some(k => s.includes(k)));
    if (activeTag === 'design') return n.some(s => ['figma', 'ui', 'ux', 'design', 'дизайн'].some(k => s.includes(k)));
    if (activeTag === 'biotech') return n.some(s => ['bio', 'med', 'мед'].some(k => s.includes(k)));
    return false;
  });

  const filteredUsers = mockUsers.filter(u => {
    const matchSearch = !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCat === 'all' ||
      (activeCat === 'IT' && u.skills.some(s => ['React', 'Node.js', 'Python', 'ML', 'SQL'].includes(s))) ||
      (activeCat === 'Design' && u.skills.some(s => ['Figma', 'UI/UX', 'Branding'].includes(s))) ||
      (activeCat === 'Mentorship' && u.availability.includes('ментор'));
    return matchSearch && matchCat;
  });

  const handleDelete = async (e, pitchId) => {
    e.stopPropagation();
    if(window.confirm("Уверены что хотите удалить питч?")) {
      await deletePitch(pitchId);
    }
  };

  const openEditModal = (e, pitch) => {
    e.stopPropagation();
    setEditingPitch(pitch);
    setEditTitle(pitch.title || '');
    setEditDesc(pitch.description || '');
    setEditTech(Array.isArray(pitch.tech_stack) ? pitch.tech_stack.join(', ') : pitch.tech_stack || '');
  };

  const handleSaveEdit = async () => {
    if(!editTitle || !editDesc) return;
    const techArr = editTech.split(',').map(s=>s.trim()).filter(Boolean);
    const success = await updatePitch(editingPitch.id, { 
      title: editTitle, 
      description: editDesc, 
      tech_stack: techArr 
    });
    if (success) setEditingPitch(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 h-[64px] flex items-center justify-between"
        style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-2">
            <Rocket size={20} className="text-blue-500" />
            <span className="font-black text-[20px] tracking-tight" style={{ color: "var(--text-primary)" }}>Проекты</span>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-muted-foreground/5 p-1 rounded-2xl border border-[var(--border)]">
          <button 
            onClick={() => {setActiveTab('projects'); setSearchQuery('');}}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'projects' ? 'bg-white dark:bg-white/10 shadow-sm text-blue-500' : 'text-muted-foreground'}`}
          >
            <Rocket size={14} /> Проекты
          </button>
          <button 
            onClick={() => {setActiveTab('people'); setSearchQuery('');}}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'people' ? 'bg-white dark:bg-white/10 shadow-sm text-blue-500' : 'text-muted-foreground'}`}
          >
            <Users size={14} /> Люди
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-24">
        {/* Info Box */}
        <div className="mb-8 p-6 rounded-3xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex items-center gap-4" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Info size={24} className="text-blue-500" />
            </div>
            <p className="text-[14px] font-medium leading-relaxed opacity-70">
                {activeTab === 'projects' 
                    ? "Находите команды и запускайте проекты. Здесь собраны идеи со всего сообщества — нажмите «Опубликовать», чтобы добавить свою."
                    : "Находите партнеров по навыкам, менторов или единомышленников. Объединяйтесь для создания будущего."}
            </p>
        </div>

        {/* Global Search */}
        <div className="mb-6 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors text-gray-400" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'projects' ? "Поиск проектов..." : "Поиск людей по имени или роли..."}
            className="w-full pl-12 pr-4 py-4 rounded-2xl text-[15px] font-medium transition-all shadow-sm group-focus-within:shadow-md"
            style={{ 
              backgroundColor: "var(--bg-card)", 
              color: "var(--text-primary)", 
              border: "1px solid var(--border)",
              outline: "none"
            }}
          />
        </div>

        {/* Dynamic Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {(activeTab === 'projects' ? TAGS : CATS).map(item => (
            <button key={item.id} 
              onClick={() => activeTab === 'projects' ? setActiveTag(item.id) : setActiveCat(item.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap text-[13px] font-bold transition-all shrink-0 border"
              style={{
                backgroundColor: (activeTab === 'projects' ? activeTag : activeCat) === item.id ? "var(--text-primary)" : "var(--bg-card)",
                color: (activeTab === 'projects' ? activeTag : activeCat) === item.id ? "var(--bg-base)" : "var(--text-secondary)",
                borderColor: (activeTab === 'projects' ? activeTag : activeCat) === item.id ? "var(--text-primary)" : "var(--border)"
              }}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'projects' ? (
            <motion.div 
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {filteredPitches?.map((pitch, idx) => (
                <motion.div key={pitch.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="rounded-3xl p-6 flex flex-col relative group hover:shadow-xl transition-all duration-300"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  {pitch.user_id === user?.id && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={(e) => openEditModal(e, pitch)} className="p-2 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors">
                        <Edit3 size={15} style={{color: "var(--text-secondary)"}} />
                      </button>
                      <button onClick={(e) => handleDelete(e, pitch.id)} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors">
                        <Trash size={15} className="text-red-500" />
                      </button>
                    </div>
                  )}

                  <h3 className="text-[18px] font-black mb-2 pr-16" style={{ color: "var(--text-primary)" }}>{pitch.title}</h3>
                  <p className="text-[14px] leading-relaxed mb-6 flex-1 line-clamp-3 opacity-70" style={{ color: "var(--text-secondary)" }}>
                    {pitch.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {Array.isArray(pitch.tech_stack) && pitch.tech_stack.map((tech, i) => (
                      <span key={i} className="text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl"
                        style={{ backgroundColor: "rgba(132,204,22,0.1)", color: "#65a30d", border: "1px solid rgba(132,204,22,0.2)" }}>
                        {tech}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => navigate('/app/collab/' + pitch.id)}
                    className="w-full py-4 rounded-2xl text-[14px] font-bold text-white hover:opacity-90 transition-opacity shadow-lg"
                    style={{ background: "linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary), var(--color-brand-accent))" }}>
                    Подробнее & Присоединиться
                  </button>
                </motion.div>
              ))}
              {(!filteredPitches || filteredPitches.length === 0) && (
                <div className="col-span-full py-24 text-center rounded-3xl border-2 border-dashed border-[var(--border)] opacity-30">
                  <Rocket size={48} className="mx-auto mb-4" />
                  <p className="text-lg font-black uppercase tracking-tighter">Проектов не найдено</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="people"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {filteredUsers.map((u, idx) => (
                <motion.div key={u.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card p-6 flex flex-col justify-between group hover:shadow-2xl transition-all duration-300 rounded-3xl"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div>
                    <div className="flex items-start justify-between mb-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black shadow-inner"
                          style={{ background: "linear-gradient(135deg, #dbeafe, #ccfbf1)", color: "var(--color-brand-primary)" }}>
                          {u.initials}
                        </div>
                        {u.status === 'online' && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-emerald-500 shadow-sm" />
                        )}
                      </div>
                      <button
                        onClick={() => navigate('/app/chats')}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-muted-foreground/5 hover:bg-blue-600 hover:text-white"
                      >
                        <MessageCircle size={22} />
                      </button>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-black text-xl mb-1" style={{ color: "var(--text-primary)" }}>{u.name}</h3>
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest opacity-50">
                        <span className="text-blue-600">{u.role}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <span className="flex items-center gap-1"><MapPin size={12} /> {u.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {u.skills.map(s => (
                        <span key={s} className="text-[11px] px-3 py-1.5 rounded-xl font-black uppercase tracking-wider"
                          style={{ backgroundColor: "var(--bg-input)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border)]">
                     <p className="text-[13px] font-medium opacity-60 italic leading-snug">"{u.availability}"</p>
                  </div>
                </motion.div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="col-span-2 text-center py-24 opacity-30">
                  <Search size={48} className="mx-auto mb-4" />
                  <p className="text-lg font-black uppercase tracking-tighter">Никого не нашли</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPitch && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingPitch(null)}
              className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 top-[10%] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-auto md:w-[500px] h-fit max-h-[80vh] overflow-y-auto rounded-[2rem] p-8 shadow-2xl"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[22px] font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Редактировать проект</h3>
                <button onClick={() => setEditingPitch(null)} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: "var(--text-muted)" }}>
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-widest mb-2 opacity-50" style={{ color: "var(--text-secondary)" }}>Название</label>
                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                         className="w-full px-5 py-4 rounded-2xl text-[15px] font-medium border outline-none focus:border-pink-500 transition-all"
                         style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                </div>
                
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-widest mb-2 opacity-50" style={{ color: "var(--text-secondary)" }}>Стек технологий (через запятую)</label>
                  <input type="text" value={editTech} onChange={e => setEditTech(e.target.value)} placeholder="React, Tailwind, Node"
                         className="w-full px-5 py-4 rounded-2xl text-[15px] font-medium border outline-none focus:border-pink-500 transition-all"
                         style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                </div>

                <div>
                  <label className="block text-[12px] font-black uppercase tracking-widest mb-2 opacity-50" style={{ color: "var(--text-secondary)" }}>Описание проекта</label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={5}
                            className="w-full px-5 py-4 rounded-2xl text-[15px] font-medium border outline-none focus:border-pink-500 transition-all resize-none"
                            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                </div>

                <div className="mt-4 flex gap-4">
                  <button onClick={() => setEditingPitch(null)} className="flex-1 py-4 rounded-2xl text-[15px] font-bold transition-all hover:bg-black/10 dark:hover:bg-white/10"
                    style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}>
                    Отмена
                  </button>
                  <button onClick={handleSaveEdit} disabled={!editTitle || !editDesc} className="flex-1 py-4 rounded-2xl text-[15px] font-bold text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-accent))" }}>
                    <Save size={20} /> Сохранить
                  </button>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

