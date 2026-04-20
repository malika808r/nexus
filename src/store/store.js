import { create } from 'zustand';
import { supabase } from '../supabase';
import i18n from '../i18n/config';

export const useAppStore = create((set, get) => ({
  // ==========================================
  // 1. АВТОРИЗАЦИЯ И ПОЛЬЗОВАТЕЛЬ (AUTH)
  // ==========================================
  user: null,
  isInitializing: true,
  loading: false,

  checkAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user, isInitializing: false });
        get().fetchFollowing(session.user.id);
        get().fetchNotifications();
      } else {
        set({ isInitializing: false });
      }
    } catch (error) {
      console.error('checkAuth error:', error);
      set({ isInitializing: false });
    }
  },

  login: async (email, password, demoUserData = null) => {
    set({ loading: true });
    try {
      if (demoUserData) {
        set({ user: demoUserData, loading: false });
        return { success: true, user: demoUserData };
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({ user: data.user, loading: false });
      get().fetchFollowing(data.user.id);
      get().fetchNotifications();
      return { success: true, user: data.user };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  register: async (email, password, firstName, lastName) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { firstName, lastName } },
      });
      if (error) throw error;
      set({ user: data.user, loading: false });
      return { success: true, user: data.user };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, following: [], notifications: [] });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateProfile: async (newData) => {
    try {
      const user = get().user;
      if (!user) return { success: false, error: 'No user signed in' };
      const { data, error } = await supabase.auth.updateUser({ data: newData });
      if (error) throw error;
      await supabase.from('profiles').update(newData).eq('id', user.id);
      set({ user: data.user });
      return { success: true };
    } catch (error) {
      console.error('updateProfile error:', error);
      return { success: false, error: error.message };
    }
  },

  // Добавьте эти функции внутрь useAppStore:

  // Удаление своего поста
  deleteCheckpoint: async (checkpointId) => {
    const { error } = await supabase
      .from('goal_checkpoints')
      .delete()
      .eq('id', checkpointId);

    if (!error) {
      set(state => ({
        feed: state.feed.filter(item => item.id !== checkpointId)
      }));
      return true;
    }
    return false;
  },

  // Редактирование поста (Критерий: Update)
  updateCheckpoint: async (checkpointId, content) => {
    const { data, error } = await supabase
      .from('goal_checkpoints')
      .update({ content })
      .eq('id', checkpointId)
      .select()
      .single();

    if (!error) {
      set(state => ({
        feed: state.feed.map(item => item.id === checkpointId ? { ...item, content: data.content } : item)
      }));
      return { success: true };
    }
    return { success: false, error: error.message };
  },

  // Получение данных ОДНОГО профиля по ID (Критерий: Read One)
  fetchProfileById: async (id) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  // Получение одного поста по ID (Критерий: Read One)
  fetchCheckpointById: async (id) => {
    const { data, error } = await supabase
      .from('goal_checkpoints')
      .select('*, goals(id, title), profiles:profiles(id, first_name, last_name, avatar_url)')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  // === DIRECT MESSAGING (1-on-1) ===
  // Используем таблицу 'messages' согласно схеме 001_init.sql
  fetchDirectMessages: async (user1Id, user2Id) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(id, first_name, last_name, avatar_url)')
      .or(`and(sender_id.eq.${user1Id},recipient_id.eq.${user2Id}),and(sender_id.eq.${user2Id},recipient_id.eq.${user1Id})`)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error fetching direct messages:", error);
      return [];
    }
    return data;
  },

  sendDirectMessage: async (recipientId, content) => {
    const user = get().user;
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: user.id,
        recipient_id: recipientId,
        content: content
      }])
      .select('*, sender:profiles!sender_id(id, first_name, last_name, avatar_url)')
      .single();
      
    if (error) {
      console.error("Error sending direct message:", error);
      return null;
    }
    return data;
  },

  // Функции для Админ-панели
  adminData: { users: [], posts: [] },
  fetchAdminData: async () => {
    const [usersRes, postsRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('goal_checkpoints').select('*, goals(title, user_id)')
    ]);
    if (!usersRes.error && !postsRes.error) {
      set({ adminData: { users: usersRes.data, posts: postsRes.data } });
    }
  },

  deleteAnyPost: async (id) => {
    try {
      // 1. Удаляем все связанные данные вручную (FK constraints)
      await Promise.all([
        supabase.from('reactions').delete().eq('checkpoint_id', id),
        supabase.from('comments').delete().eq('checkpoint_id', id),
        supabase.from('notifications').delete().eq('content_id', id)
      ]);
      
      // 2. Теперь удаляем сам пост
      const { error } = await supabase.from('goal_checkpoints').delete().eq('id', id);
      if (error) throw error;
      
      // 3. Обновляем локальные данные в админке
      get().fetchAdminData();
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка полного удаления поста:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // 2. ЛЕНТА (СОЦИАЛЬНАЯ СЕТЬ)
  // ==========================================
  feed: [],
  feedPage: 0,
  hasMoreFeed: true,
  feedLoading: false,

  fetchFeed: async (reset = false) => {
    if (get().feedLoading || (!reset && !get().hasMoreFeed)) return;
    set({ feedLoading: true });
    const page = reset ? 0 : get().feedPage;
    const PAGE_SIZE = 10;
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      const { data, error } = await supabase
        .from('goal_checkpoints')
        .select(`*, goals ( id, title, user_id ), reactions ( id, type, user_id )`)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const mappedData = await Promise.all(data.map(async (item) => {
        const authorId = item.goals?.user_id;
        if (!authorId) return { ...item, profiles: { first_name: 'Пользователь' } };

        // Try to get profile from DB
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .eq('id', authorId)
          .single();

        if (profile) return { ...item, profiles: profile };

        // Fallback: if it's the current user, use metadata
        const currentUser = get().user;
        if (currentUser && currentUser.id === authorId) {
          return {
            ...item,
            profiles: {
              id: authorId,
              first_name: currentUser.user_metadata?.firstName || 'Malika',
              last_name: currentUser.user_metadata?.lastName || '',
              avatar_url: currentUser.user_metadata?.avatarUrl || null
            }
          };
        }

        return { ...item, profiles: { first_name: 'Builder' } };
      }));

      set((state) => ({
        feed: reset ? mappedData : [...state.feed, ...mappedData],
        feedPage: page + 1,
        hasMoreFeed: data.length === PAGE_SIZE,
        feedLoading: false
      }));
    } catch (error) {
      console.error("Ошибка загрузки ленты:", error);
      set({ feedLoading: false });
    }
  },

  addCheckpoint: async (goalId, content) => {
    const user = get().user;
    if (!user) return false;
    const { data, error } = await supabase
      .from('goal_checkpoints')
      .insert([{ goal_id: goalId, content }])
      .select('*, goals(id, title, user_id)')
      .single();
    if (error) { console.error("Ошибка добавления:", error); return false; }
    const newEntry = {
      ...data,
      profiles: {
        id: user.id,
        first_name: user.user_metadata?.firstName || 'Malika',
        last_name: user.user_metadata?.lastName || '',
        avatar_url: user.user_metadata?.avatarUrl || null
      },
      reactions: [],
      comments: []
    };
    set((state) => ({ feed: [newEntry, ...state.feed] }));
    return true;
  },

  sendReaction: async (checkpointId, type, authorId) => {
    const user = get().user;
    if (!user) return;
    const feedItem = get().feed.find(f => f.id === checkpointId);
    const alreadyReacted = feedItem?.reactions?.some(r => r.user_id === user.id);
    if (alreadyReacted) return;

    const newReaction = { id: Date.now().toString(), checkpoint_id: checkpointId, user_id: user.id, type };
    set((state) => ({
      feed: state.feed.map(item =>
        item.id === checkpointId
          ? { ...item, reactions: [...(item.reactions || []), newReaction] }
          : item
      )
    }));
    const { error } = await supabase.from('reactions').insert([{ checkpoint_id: checkpointId, user_id: user.id, type }]);
    if (!error && authorId) get().createNotification(authorId, 'like', checkpointId);
  },

  // ── КОММЕНТАРИИ ──
  comments: {}, // { [checkpointId]: [...] }

  fetchComments: async (checkpointId) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles!user_id(id, first_name, last_name, avatar_url)')
      .eq('checkpoint_id', checkpointId)
      .order('created_at', { ascending: true });
    if (!error) {
      set(state => ({ comments: { ...state.comments, [checkpointId]: data } }));
    }
  },

  addComment: async (checkpointId, text, authorId) => {
    const user = get().user;
    if (!user || !text.trim()) return false;
    const { data, error } = await supabase
      .from('comments')
      .insert([{ checkpoint_id: checkpointId, user_id: user.id, text }])
      .select('*, profiles!user_id(id, first_name, last_name, avatar_url)')
      .single();
    if (error) { console.error("Ошибка комментария:", error); return false; }
    set(state => ({
      comments: {
        ...state.comments,
        [checkpointId]: [...(state.comments[checkpointId] || []), data]
      }
    }));
    if (authorId) get().createNotification(authorId, 'comment', checkpointId);
    return true;
  },

  // ── ЛЮДИ (ПОЛЬЗОВАТЕЛИ) ──
  people: [],
  peopleLoading: false,

  fetchPeople: async (search = '') => {
    set({ peopleLoading: true });
    try {
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, bio')
        .order('created_at', { ascending: false })
        .limit(60);

      if (search.trim().length > 0) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (!error) set({ people: data || [], peopleLoading: false });
      else { console.error('fetchPeople error:', error); set({ peopleLoading: false }); }
    } catch (e) {
      console.error('fetchPeople exception:', e);
      set({ peopleLoading: false });
    }
  },

  // ==========================================
  // 3. СОЦИАЛЬНЫЙ ГРАФ (FOLLOWS & NOTIFICATIONS)
  // ==========================================
  following: [],
  notifications: [],
  unreadNotificationsCount: 0,

  fetchFollowing: async (userId) => {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    if (!error) set({ following: data.map(f => f.following_id) });
  },

  followUser: async (targetId) => {
    const user = get().user;
    if (!user) return;
    const { error } = await supabase.from('follows').insert([{ follower_id: user.id, following_id: targetId }]);
    if (!error) {
      set(state => ({ following: [...state.following, targetId] }));
      get().createNotification(targetId, 'follow');
    }
  },

  unfollowUser: async (targetId) => {
    const user = get().user;
    if (!user) return;
    const { error } = await supabase.from('follows').delete().match({ follower_id: user.id, following_id: targetId });
    if (!error) set(state => ({ following: state.following.filter(id => id !== targetId) }));
  },

  fetchNotifications: async () => {
    const user = get().user;
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*, actor:profiles!actor_id(id, first_name, last_name, avatar_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) {
      set({ notifications: data, unreadNotificationsCount: data.filter(n => !n.read).length });
    }
  },

  createNotification: async (userId, type, contentId = null) => {
    const user = get().user;
    if (!user || user.id === userId) return;
    await supabase.from('notifications').insert([{ user_id: userId, actor_id: user.id, type, content_id: contentId }]);
  },

  markNotificationRead: async (id) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (!error) {
      set(state => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        unreadNotificationsCount: Math.max(0, state.unreadNotificationsCount - 1)
      }));
    }
  },

  markAllNotificationsRead: async () => {
    const user = get().user;
    if (!user) return;
    const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
    if (!error) {
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadNotificationsCount: 0
      }));
    }
  },

  // ── ПРОФИЛЬ И ЦЕЛИ ──
  userGoals: [],
  userCheckpoints: [],

  fetchUserGoalsAndCheckpoints: async (userId) => {
    if (!userId) return;
    const [goalsRes, checkRes] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('goal_checkpoints').select('*, goals!inner(user_id)').eq('goals.user_id', userId).order('created_at', { ascending: false })
    ]);
    if (!goalsRes.error) set({ userGoals: goalsRes.data });
    if (!checkRes.error) set({ userCheckpoints: checkRes.data });
  },

  addGoal: async (title) => {
    const user = get().user;
    if (!user) return null;
    const { data, error } = await supabase.from('goals').insert([{ user_id: user.id, title }]).select().single();
    if (error) { console.error("Ошибка добавления цели:", error); return null; }
    set((state) => ({ userGoals: [data, ...state.userGoals] }));
    return data;
  },

  // ==========================================
  // 4. НАСТРОЙКИ И ТЕМА
  // ==========================================
  language: localStorage.getItem('app-language') || 'en',
  theme: localStorage.getItem('app-theme') || 'light',

  setLanguage: (lang) => { 
    localStorage.setItem('app-language', lang); 
    i18n.changeLanguage(lang);
    set({ language: lang }); 
  },

  setTheme: (theme) => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },

  // ── КОМНАТЫ СООБЩЕСТВА (COMMUNITY ROOMS) ──
  rooms: [
    { id: 'general', title: 'Общий чат 👋', icon: 'Sparkles', color: 'from-blue-500 to-indigo-500', count: 124 },
    { id: 'it', title: 'Идеи и Проекты 💡', icon: 'Code', color: 'from-emerald-500 to-teal-500', count: 42 },
    { id: 'aesthetic', title: 'Вдохновение ✨', icon: 'Music', color: 'from-pink-500 to-rose-500', count: 88 },
    { id: 'sport', title: 'Личные цели 🎯', icon: 'Trophy', color: 'from-orange-500 to-red-500', count: 56 },
  ],

  fetchRooms: () => {
    const saved = localStorage.getItem('nexus-custom-rooms');
    if (saved) {
      const custom = JSON.parse(saved);
      const defaults = [
        { id: 'general', title: 'Общий чат 👋', icon: 'Sparkles', color: 'from-blue-500 to-indigo-500', count: 124 },
        { id: 'it', title: 'Идеи и Проекты 💡', icon: 'Code', color: 'from-emerald-500 to-teal-500', count: 42 },
        { id: 'aesthetic', title: 'Вдохновение ✨', icon: 'Music', color: 'from-pink-500 to-rose-500', count: 88 },
        { id: 'sport', title: 'Личные цели 🎯', icon: 'Trophy', color: 'from-orange-500 to-red-500', count: 56 },
      ];
      set({ rooms: [...defaults, ...custom] });
    }
  },

  addRoom: (title, icon, color) => {
    const newRoom = {
      id: `custom_${Date.now()}`,
      title,
      icon,
      color,
      count: 0
    };
    
    set(state => {
      const updated = [...state.rooms, newRoom];
      const customOnly = updated.filter(r => r.id.startsWith('custom_'));
      localStorage.setItem('nexus-custom-rooms', JSON.stringify(customOnly));
      return { rooms: updated };
    });
    
    return newRoom;
  },

  initTheme: () => {
    const theme = localStorage.getItem('app-theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  }
}));




export const useAuthStore = useAppStore;