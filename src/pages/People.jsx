import { useEffect, useState } from 'react';
import { useAppStore } from '../store/store';
import { motion } from 'framer-motion';
import { Search, Users, MapPin, MessageCircle, UserPlus, UserMinus, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../hooks/useDebounce';

/*
- [x] Update `Profile.jsx` to generate deterministic private room IDs
- [x] Update `ChatInterface.jsx` to support private room headers (fetch partner's identity)
- [x] Update `People.jsx` to fix the 'Message' button redirection
- [ ] Ensure `sendMessage` and `loadMessages` work with private room IDs in the `posts` table
- [ ] Final verification in browser
*/

export default function People() {
  const { people, peopleLoading, fetchPeople, following, followUser, unfollowUser, user } = useAppStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // or 'name'
  const [filterBy, setFilterBy] = useState('all'); // 'all' or 'following'
  const navigate = useNavigate();
  const { show } = useToast();
  const { t } = useTranslation();
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => { 
    fetchPeople(debouncedSearch); 
  }, [debouncedSearch]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleFollow = async (personId) => {
    if (following.includes(personId)) {
      await unfollowUser(personId);
      show(t('profile.unfollowed'), 'info');
    } else {
      await followUser(personId);
      show(t('profile.followed'), 'success');
    }
  };

  // Filter out yourself
  let filteredPeople = (people || []).filter(p => p.id !== user?.id);

  // Apply Filter
  if (filterBy === 'following') {
    filteredPeople = filteredPeople.filter(p => following.includes(p.id));
  }

  // Apply Sorting
  filteredPeople = [...filteredPeople].sort((a, b) => {
    if (sortBy === 'name') return a.first_name.localeCompare(b.first_name, 'ru');
    return 0; // Default: newest (assuming API returns newest first)
  });

  const fallbackPeople = [
    { id: '00000000-0000-0000-0000-0000000000f1', first_name: 'Алина', last_name: 'Дизайнер', bio: 'Создаю интерфейсы для созидателей.', avatar_url: '👩‍🎨', isFallback: true },
    { id: '00000000-0000-0000-0000-0000000000f2', first_name: 'Арман', last_name: 'Frontend', bio: 'Пишу на React и люблю горы.', avatar_url: '👨‍💻', isFallback: true },
    { id: '00000000-0000-0000-0000-0000000000f3', first_name: 'Зарина', last_name: 'Созидатель', bio: 'Меняю мир через маленькие шаги.', avatar_url: '👩‍💼', isFallback: true },
  ];

  // Show real people first, then fallbacks if empty
  const displayPeople = filteredPeople.length > 0 ? filteredPeople : fallbackPeople;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-[2rem] flex items-center justify-center text-white shadow-2xl"
               style={{ background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))' }}>
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('people.title')}</h1>
            <p className="text-[12px] font-black uppercase tracking-widest opacity-40 mt-0.5">{t('people.subtitle')}</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative group flex-1">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:scale-110 transition-transform opacity-60" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder={t('people.searchPlaceholder')}
              className="input-base pl-14 h-14 text-base shadow-lg w-full"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy(sortBy === 'name' ? 'newest' : 'name')}
              className={`px-4 h-14 rounded-2xl border-2 font-bold text-[13px] transition-all flex items-center gap-2 ${
                sortBy === 'name' ? 'bg-blue-500 border-blue-500 text-white shadow-lg' : 'bg-muted-foreground/5 border-transparent opacity-60'
              }`}
            >
              {sortBy === 'name' ? t('people.sortName') : t('people.sortNewest')}
            </button>
            <button
              onClick={() => setFilterBy(filterBy === 'following' ? 'all' : 'following')}
              className={`px-4 h-14 rounded-2xl border-2 font-bold text-[13px] transition-all flex items-center gap-2 ${
                filterBy === 'following' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-muted-foreground/5 border-transparent opacity-60'
              }`}
            >
              {filterBy === 'following' ? t('people.filterFollowing') : t('people.filterAll')}
            </button>
          </div>
        </div>
      </header>

      {/* People Grid */}
      {peopleLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-brand-primary)' }} />
        </div>
      ) : displayPeople.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-[2.5rem] opacity-30" style={{ borderColor: 'var(--border)' }}>
          <Sparkles size={48} className="mx-auto mb-4" />
          <p className="text-lg font-black uppercase tracking-widest">{t('people.noneFound')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayPeople.map((person, idx) => {
            const isFollowing = following.includes(person.id);
            const initials = (person.first_name || 'U').charAt(0).toUpperCase();
            const name = [person.first_name, person.last_name].filter(Boolean).join(' ') || 'Builder';

            return (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className="card p-6 flex flex-col gap-4 relative group hover:shadow-2xl transition-all duration-300"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity"
                     style={{ background: 'linear-gradient(135deg, var(--color-brand-primary)08, var(--color-brand-secondary)05)' }} />

                {/* Avatar + actions */}
                <div className="flex items-start justify-between relative z-10">
                  <button onClick={() => navigate(`/app/profile/${person.id}`)} className="relative">
                    <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-xl overflow-hidden shadow-md"
                         style={{ background: 'linear-gradient(135deg, #dbeafe, #ccfbf1)', color: 'var(--color-brand-primary)' }}>
                      {person.avatar_url && person.avatar_url !== '👤' ? (
                        person.avatar_url.startsWith('http') || person.avatar_url.startsWith('/') 
                          ? <img src={person.avatar_url} className="w-full h-full object-cover" alt={name} />
                          : <span>{person.avatar_url}</span>
                      ) : (
                        initials
                      )}
                    </div>
                    {/* Online dot */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[var(--bg-card)] bg-emerald-500" />
                  </button>

                  {/* Message + Follow buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const ids = [user.id, person.id].sort();
                        navigate(`/app/chats/private_${ids[0]}_${ids[1]}`);
                      }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-muted-foreground/5 hover:bg-blue-500/10 hover:text-blue-600"
                      title={t('common.write')}
                    >
                      <MessageCircle size={18} />
                    </button>
                    <button
                      onClick={() => handleFollow(person.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isFollowing
                          ? 'bg-muted-foreground/10 hover:bg-red-500/10 hover:text-red-500'
                          : 'bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white'
                      }`}
                      title={isFollowing ? t('people.unfollow') : t('people.follow')}
                    >
                      {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="relative z-10">
                  <button
                    onClick={() => navigate(`/app/profile/${person.id}`)}
                    className="text-left group/name"
                  >
                    <h3 className="font-black text-[17px] leading-tight group-hover/name:text-blue-600 transition-colors"
                        style={{ color: 'var(--text-primary)' }}>
                      {name}
                    </h3>
                  </button>



                  {person.bio && (
                    <p className="text-[13px] font-medium opacity-60 mt-2 leading-snug line-clamp-2">
                      {person.bio}
                    </p>
                  )}
                </div>



                {/* View profile CTA */}
                <button
                  onClick={() => navigate(`/app/profile/${person.id}`)}
                  className="w-full py-3 rounded-xl text-[13px] font-bold transition-all border opacity-0 group-hover:opacity-100 relative z-10"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  {t('common.viewProfile')} →
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
