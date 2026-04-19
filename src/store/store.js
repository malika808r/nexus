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
      set({ user: session?.user || null, isInitializing: false });
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
      set({ user: null });
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
  
  fetchFeed: async () => {
    // Подтягиваем чекпоинты, их глобальные цели и реакции к ним
    const { data, error } = await supabase
      .from('goal_checkpoints')
      .select(`
        *,
        goals ( title, user_id ),
        reactions ( id, type, user_id )
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Ошибка загрузки ленты:", error);
    } else {
      set({ feed: data || [] });
    }
  },

  fetchPitches: async () => {
    const { data, error } = await supabase
      .from('pitches')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Ошибка загрузки питчей:", error);
    } else {
      set({ pitches: data || [] });
    }
  },

  addCheckpoint: async (goalId, content) => {
    const user = get().user;
    if (!user) {
      console.warn("Для публикации нужен логин");
      return; 
    }

    // Временный ID для оптимистичного рендеринга
    const tempId = Date.now().toString();
    const newCheckpoint = {
      id: tempId,
      goal_id: goalId,
      content,
      created_at: new Date().toISOString(),
      reactions: [],
      goals: { user_id: user.id, title: "Текущая цель" } // В реальности берем из локального стейта целей
    };
    
    // Оптимистичное обновление ленты
    set((state) => ({ feed: [newCheckpoint, ...state.feed] }));

    const { data, error } = await supabase
      .from('goal_checkpoints')
      .insert([{ goal_id: goalId, content }])
      .select()
      .single();

    if (error) {
      console.error("Ошибка добавления чекпоинта:", error);
      // Откатываем оптимистичный апдейт при ошибке
      set((state) => ({ feed: state.feed.filter(item => item.id !== tempId) }));
    } else {
      // Заменяем временный чекпоинт на реальный из БД
      set((state) => ({
        feed: state.feed.map(item => item.id === tempId ? { ...item, id: data.id } : item)
      }));
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
      .select()
      .single();

    if (error) {
      console.error("Ошибка добавления питча:", error);
      return false;
    } else {
      set((state) => ({ pitches: [data, ...state.pitches] }));
      return true;
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

  sendReaction: async (checkpointId, type) => {
    const user = get().user;
    if (!user) return;

    const newReaction = { id: Date.now().toString(), checkpoint_id: checkpointId, user_id: user.id, type };
    
    // Оптимистичное обновление: добавляем реакцию сразу
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

    if (error) {
      console.error("Ошибка отправки реакции:", error);
      // При ошибке можно было бы удалить добавленную реакцию обратно
    }
  },

  // ==========================================
  // 3. НАБЛЮДЕНИЯ ПОЛЬЗОВАТЕЛЯ (OBSERVATIONS)
  // ==========================================
  observations: [],
  addObservation: (obs) => set((state) => ({ observations: [obs, ...state.observations] })),

  // ==========================================
  // 4. НАСТРОЙКИ (SETTINGS / LANGUAGE)
  // ==========================================
  language: localStorage.getItem('app-language') || 'ru',

  setLanguage: (lang) => {
    localStorage.setItem('app-language', lang);
    set({ language: lang });
  },

  // ==========================================
  // 5. ТЕМА (DARK / LIGHT)
  // ==========================================
  theme: localStorage.getItem('app-theme') || 'light',

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