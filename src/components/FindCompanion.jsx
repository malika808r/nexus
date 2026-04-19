import { useState } from 'react';
import { Search, MapPin, MessageCircle, Code, Palette, Sparkles, Map, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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

export default function FindCompanion() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');

  const filtered = mockUsers.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'all' ||
      (cat === 'IT' && u.skills.some(s => ['React', 'Node.js', 'Python', 'ML', 'SQL'].includes(s))) ||
      (cat === 'Design' && u.skills.some(s => ['Figma', 'UI/UX', 'Branding'].includes(s))) ||
      (cat === 'Mentorship' && u.availability.includes('ментор'));
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-[2rem] flex items-center justify-center text-white shadow-lg glow-card-pink relative"
               style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
            <Map size={28} />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-[2rem] border-2 border-pink-500"
            />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Поиск людей</h1>
            <p className="text-sm font-bold uppercase tracking-widest bg-pink-500/10 text-pink-600 px-3 py-1 rounded-full w-fit mt-1">Находите созидателей рядом</p>
          </div>
        </div>

        <div className="card p-6 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)]" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-muted-foreground/5 flex items-center justify-center shrink-0">
              <Info size={24} className="text-pink-500" />
            </div>
            <p className="text-[15px] font-medium leading-relaxed opacity-70">
              Находите партнеров по навыкам, менторов или единомышленников. Наш поиск поможет вам собрать команду мечты для реализации самых смелых идей.
            </p>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="space-y-6 mb-10">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-pink-500 transition-colors" size={20} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Ищите кодеров, дизайнеров или мечты..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-base pl-14 h-16 shadow-sm"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap text-[14px] font-black transition-all shrink-0 border"
              style={{
                backgroundColor: cat === c.id ? "var(--text-primary)" : "var(--bg-card)",
                color: cat === c.id ? "var(--bg-base)" : "var(--text-secondary)",
                borderColor: cat === c.id ? "var(--text-primary)" : "var(--border)"
              }}
            >
              <c.icon size={16} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {filtered.map((user, idx) => (
            <motion.div key={user.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-6 flex flex-col justify-between group hover:glow-card-pink"
            >
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black shadow-inner"
                      style={{ background: "linear-gradient(135deg, #fce7f3, #d9f99d)", color: "#ec4899" }}>
                      {user.initials}
                    </div>
                    {user.status === 'online' && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-lime-500" />
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/app/chats')}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-muted-foreground/5 hover:bg-pink-500 hover:text-white"
                  >
                    <MessageCircle size={22} />
                  </button>
                </div>

                <div className="mb-4">
                  <h3 className="font-black text-xl mb-1" style={{ color: "var(--text-primary)" }}>{user.name}</h3>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50">
                    <span className="text-pink-500">{user.role}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span className="flex items-center gap-1"><MapPin size={12} /> {user.location}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {user.skills.map(s => (
                    <span key={s} className="text-[11px] px-3 py-1 rounded-lg font-black uppercase tracking-wider"
                      style={{ backgroundColor: "var(--bg-input)", color: "var(--text-secondary)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                 <p className="text-[13px] font-medium opacity-60 italic leading-snug">"{user.availability}"</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-24 opacity-30">
            <Search size={48} className="mx-auto mb-4" />
            <p className="text-xl font-black uppercase tracking-widest">Никого не нашли</p>
          </div>
        )}
      </div>
    </div>
  );
}