import { create } from 'zustand';
import { supabase } from '../supabase';

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
        // Initial fetch for social data
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

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
        email,
        password,
        options: {
          data: { firstName, lastName },
        },
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
      console.error('logout error:', error);
      return { success: false, error: error.message };
    }
  },

  updateProfile: async (newData) => {
    try {
      const user = get().user;
      if (!user) return { success: false, error: 'No user signed in' };

      // Update in Supabase auth User metadata
      const { data, error } = await supabase.auth.updateUser({
        data: newData
      });

      if (error) throw error;
      
      // Update local state
      set({ user: data.user });
      return { success: true };
    } catch (error) {
      console.error('updateProfile error:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // 2. ЛЕНТА АМБИЦИЙ И ПИТЧИ
  // ==========================================
  feed: [],
  pitches: [],
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
        .select(`
          *,
          goals ( title, user_id ),
          profiles:goals(profiles(*)),
          reactions ( id, type, user_id )
        `)
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) throw error;

      // Handle profiles mapping (since goal_checkpoints -> goals -> profiles)
      const mappedData = data.map(item => ({
        ...item,
        profiles: item.profiles?.[0] || item.goals?.profiles || { first_name: 'Пользователь' }
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

  fetchPitches: async () => {
    const { data, error } = await supabase
      .from('pitches')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Ошибка загрузки питчей:", error);
    } else {
      set({ pitches: data || [] });
    }
  },

  addCheckpoint: async (goalId, content, imageUrl = null) => {
    const user = get().user;
    if (!user) return false;

    const { data, error } = await supabase
      .from('goal_checkpoints')
      .insert([{ goal_id: goalId, content, image_url: imageUrl }])
      .select('*, goals(title, user_id)')
      .single();

    if (error) {
      console.error("Ошибка добавления чекпоинта:", error);
      return false;
    } else {
      // Add profile info for UI
      const newEntry = { ...data, profiles: user.user_metadata, reactions: [], image_url: imageUrl };
      set((state) => ({ feed: [newEntry, ...state.feed] }));
      return true;
    }
  },

  addPitch: async (title, description, tech_stack) => {
    const user = get().user;
    if (!user) return false;

    const newPitch = {
      user_id: user.id,
      title,
      description,
      tech_stack,
    };

    const { data, error } = await supabase
      .from('pitches')
      .insert([newPitch])
      .select('*, profiles(*)')
      .single();

    if (error) {
      console.error("Ошибка добавления питча:", error);
      return false;
    } else {
      set((state) => ({ pitches: [data, ...state.pitches] }));
      return true;
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

    const { error } = await supabase
      .from('follows')
      .insert([{ follower_id: user.id, following_id: targetId }]);

    if (!error) {
      set(state => ({ following: [...state.following, targetId] }));
      // Notify target
      get().createNotification(targetId, 'follow');
    }
  },

  unfollowUser: async (targetId) => {
    const user = get().user;
    if (!user) return;

    const { error } = await supabase
      .from('follows')
      .delete()
      .match({ follower_id: user.id, following_id: targetId });

    if (!error) {
      set(state => ({ following: state.following.filter(id => id !== targetId) }));
    }
  },

  fetchNotifications: async () => {
    const user = get().user;
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*, actor:profiles!notifications_actor_id_fkey(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      set({ 
        notifications: data,
        unreadNotificationsCount: data.filter(n => !n.read).length
      });
    }
  },

  createNotification: async (userId, type, contentId = null) => {
    const user = get().user;
    if (!user || user.id === userId) return;

    await supabase.from('notifications').insert([{
      user_id: userId,
      actor_id: user.id,
      type,
      content_id: contentId
    }]);
  },

  markNotificationRead: async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

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

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id);

    if (!error) {
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadNotificationsCount: 0 
      }));
    }
  },

  // === ПРОФИЛЬ И ЦЕЛИ ПОЛЬЗОВАТЕЛЯ ===
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

    const { data, error } = await supabase
      .from('goals')
      .insert([{ user_id: user.id, title }])
      .select()
      .single();

    if (error) {
      console.error("Ошибка добавления цели:", error);
      return null;
    } else {
      set((state) => ({ userGoals: [data, ...state.userGoals] }));
      return data;
    }
  },

  sendReaction: async (checkpointId, type, authorId) => {
    const user = get().user;
    if (!user) return;

    const newReaction = { id: Date.now().toString(), checkpoint_id: checkpointId, user_id: user.id, type };
    
    set((state) => ({
      feed: state.feed.map(item => 
        item.id === checkpointId 
          ? { ...item, reactions: [...(item.reactions || []), newReaction] } 
          : item
      )
    }));

    const { error } = await supabase
      .from('reactions')
      .insert([{ checkpoint_id: checkpointId, user_id: user.id, type }]);

    if (!error && authorId) {
      get().createNotification(authorId, 'like', checkpointId);
    }
  },

  // ==========================================
  // 4. НАСТРОЙКИ И ТЕМА
  // ==========================================
  language: localStorage.getItem('app-language') || 'ru',
  theme: localStorage.getItem('app-theme') || 'light',

  setLanguage: (lang) => {
    localStorage.setItem('app-language', lang);
    set({ language: lang });
  },

  setTheme: (theme) => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },

  initTheme: () => {
    const theme = localStorage.getItem('app-theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  }

}));

// Экспортируем второе имя (useAuthStore), чтобы старые файлы, 
// где ты использовала useAuthStore, не сломались и продолжали работать.
export const useAuthStore = useAppStore;