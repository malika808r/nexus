import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Calendar, Plus, X, Zap, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SavedSection({ user }) {
  const [activeSubTab, setActiveSubTab] = useState('notes');
  
  const [notes, setNotes] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedProfiles, setSavedProfiles] = useState([]);
  
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    // 1. Мероприятия (Заметки)
    const { data: nData } = await supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (nData) setNotes(nData);

    // 2. Сохраненные посты
    const { data: pData } = await supabase
      .from('saved_posts')
      .select('post_id, posts(*, profiles:user_id(first_name, last_name, avatar))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (pData) {
      const formattedPosts = pData.map(saved => ({
        id: saved.posts.id,
        content: saved.posts.content,
        image_url: saved.posts.image_url,
        likes_count: saved.posts.likes_count,
        comments_count: saved.posts.comments_count,
        authorName: saved.posts.profiles?.first_name ? `${saved.posts.profiles.first_name} ${saved.posts.profiles.last_name || ''}` : 'Пользователь',
        authorAvatar: saved.posts.profiles?.avatar,
        time: new Date(saved.posts.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }));
      setSavedPosts(formattedPosts);
    }

    // 3. Сохраненные пользователи
    const { data: uData } = await supabase
      .from('saved_users')
      .select('saved_profile_id, profiles!saved_users_saved_profile_id_fkey(id, first_name, last_name, avatar, interests, skills)')
      .eq('user_id', user.id);
      
    if (uData) {
      const formattedUsers = uData.map(saved => ({
        id: saved.profiles?.id,
        name: saved.profiles?.first_name ? `${saved.profiles.first_name} ${saved.profiles.last_name || ''}` : '',
        avatar: saved.profiles?.avatar,
        tags: saved.profiles?.interests || [],
        skills: saved.profiles?.skills || []
      })).filter(u => u.name);
      setSavedProfiles(formattedUsers);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const { data } = await supabase.from('notes').insert([{ user_id: user.id, content: newNote }]).select().single();
    if (data) {
      setNotes([data, ...notes]);
      setNewNote('');
    }
  };

  const handleDeleteNote = async (id) => {
    await supabase.from('notes').delete().eq('id', id);
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Под-вкладки */}
      <div className="flex p-1 rounded-2xl mx-5 border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}>
        {[
          { id: 'notes', label: 'Планы' },
          { id: 'posts', label: 'Посты' },
          { id: 'profiles', label: 'Люди' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)} 
            className={`flex-1 py-1.5 text-[13px] font-bold rounded-xl transition-all ${activeSubTab === tab.id ? 'shadow-sm' : ''}`}
            style={{ 
              backgroundColor: activeSubTab === tab.id ? 'var(--bg-card)' : 'transparent',
              color: activeSubTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-5 pb-20">
        
        {/* === МЕРОПРИЯТИЯ === */}
        {activeSubTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                 type="text" 
                 value={newNote}
                 onChange={(e) => setNewNote(e.target.value)}
                 placeholder="Добавить план или идею..." 
                 className="input-base flex-1"
              />
              <button 
                onClick={handleAddNote} 
                className="w-12 h-12 flex items-center justify-center rounded-xl transition-all active:scale-95 shrink-0"
                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-base)' }}
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              {notes.length === 0 && (
                <div className="text-center py-12 text-[14px]" style={{ color: 'var(--text-muted)' }}>
                  Тут будут ваши заметки и планы 📅
                </div>
              )}
              {notes.map(note => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={note.id} 
                  className="card p-4 relative group"
                >
                  <button 
                    onClick={() => handleDeleteNote(note.id)} 
                    className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}
                  >
                    <X size={14} />
                  </button>
                  <div className="flex gap-3 pr-8">
                    <Calendar size={18} style={{ color: '#ec4899' }} className="shrink-0 mt-0.5" /> 
                    <p className="text-[14px] leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>{note.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* === ПОСТЫ === */}
        {activeSubTab === 'posts' && (
          <div className="space-y-4">
            {savedPosts.length === 0 && (
              <div className="text-center py-12 text-[14px]" style={{ color: 'var(--text-muted)' }}>
                Вы еще не сохраняли посты 🔖
              </div>
            )}
            {savedPosts.map(post => (
              <div key={post.id} className="card p-4">
                <div className="flex gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold overflow-hidden"
                       style={{ background: 'linear-gradient(135deg, #fce7f3, #d9f99d)', color: '#ec4899' }}>
                    {post.authorAvatar ? (
                      <img src={post.authorAvatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      post.authorName?.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{post.authorName}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{post.time}</p>
                  </div>
                </div>
                <p className="text-[14px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>
                {post.image_url && <img src={post.image_url} className="w-full h-auto max-h-[300px] object-cover rounded-xl mb-4 border" style={{ borderColor: 'var(--border)' }} />}
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: 'var(--text-muted)' }}>
                    <Zap size={14}/> {post.likes_count || 0}
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: 'var(--text-muted)' }}>
                    <MessageCircle size={14}/> {post.comments_count || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === ЛЮДИ === */}
        {activeSubTab === 'profiles' && (
          <div className="grid grid-cols-2 gap-3">
            {savedProfiles.length === 0 && (
              <div className="col-span-2 text-center py-12 text-[14px]" style={{ color: 'var(--text-muted)' }}>
                Вы еще не сохраняли людей 👩‍💻
              </div>
            )}
            {savedProfiles.map(p => (
              <div key={p.id} className="card p-4 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mb-3 border-2 overflow-hidden shadow-sm"
                     style={{ background: 'linear-gradient(135deg, #fce7f3, #d9f99d)', color: '#ec4899', borderColor: 'var(--bg-card)' }}>
                  {p.avatar ? (
                    <img src={p.avatar} className="w-full h-full object-cover" />
                  ) : (
                    p.name?.charAt(0)
                  )}
                </div>
                <h3 className="text-[14px] font-bold w-full truncate mb-1" style={{ color: 'var(--text-primary)' }}>{p.name}</h3>
                <p className="text-[11px] font-semibold" style={{ color: '#ec4899' }}>{p.tags?.[0] || 'Пользователь'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
