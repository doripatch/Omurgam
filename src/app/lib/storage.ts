// LocalStorage helper functions for Omurgam platform

const STORAGE_KEYS = {
  AUTH_TOKEN: 'omurgam_auth_token',
  CURRENT_USER: 'omurgam_current_user',
  USERS: 'omurgam_users',
  VIDEOS: 'omurgam_videos',
  BLOG_POSTS: 'omurgam_blog_posts',
  QUESTIONS: 'omurgam_questions',
  TERMS: 'omurgam_terms',
  INITIALIZED: 'omurgam_initialized',
};

// Generic storage functions
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  },
};

// Auth storage
export const authStorage = {
  getToken: () => storage.get<string>(STORAGE_KEYS.AUTH_TOKEN),
  setToken: (token: string) => storage.set(STORAGE_KEYS.AUTH_TOKEN, token),
  removeToken: () => storage.remove(STORAGE_KEYS.AUTH_TOKEN),
  
  getCurrentUser: () => storage.get<any>(STORAGE_KEYS.CURRENT_USER),
  setCurrentUser: (user: any) => storage.set(STORAGE_KEYS.CURRENT_USER, user),
  removeCurrentUser: () => storage.remove(STORAGE_KEYS.CURRENT_USER),
  
  isAuthenticated: () => !!storage.get(STORAGE_KEYS.AUTH_TOKEN),
};

// Users storage
export const usersStorage = {
  getAll: () => storage.get<any[]>(STORAGE_KEYS.USERS) || [],
  
  getById: (id: string) => {
    const users = usersStorage.getAll();
    return users.find(u => u.id === id);
  },
  
  getByEmail: (email: string) => {
    const users = usersStorage.getAll();
    return users.find(u => u.email === email);
  },
  
  add: (user: any) => {
    const users = usersStorage.getAll();
    users.push(user);
    storage.set(STORAGE_KEYS.USERS, users);
  },
  
  update: (id: string, updates: any) => {
    const users = usersStorage.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      storage.set(STORAGE_KEYS.USERS, users);
    }
  },
  
  delete: (id: string) => {
    const users = usersStorage.getAll().filter(u => u.id !== id);
    storage.set(STORAGE_KEYS.USERS, users);
  },
};

// Videos storage
export const videosStorage = {
  getAll: () => storage.get<any[]>(STORAGE_KEYS.VIDEOS) || [],
  
  getById: (id: string) => {
    const videos = videosStorage.getAll();
    return videos.find(v => v.id === id);
  },
  
  add: (video: any) => {
    const videos = videosStorage.getAll();
    videos.push(video);
    storage.set(STORAGE_KEYS.VIDEOS, videos);
  },
  
  update: (id: string, updates: any) => {
    const videos = videosStorage.getAll();
    const index = videos.findIndex(v => v.id === id);
    if (index !== -1) {
      videos[index] = { ...videos[index], ...updates };
      storage.set(STORAGE_KEYS.VIDEOS, videos);
    }
  },
  
  delete: (id: string) => {
    const videos = videosStorage.getAll().filter(v => v.id !== id);
    storage.set(STORAGE_KEYS.VIDEOS, videos);
  },
};

// Blog posts storage
export const blogStorage = {
  getAll: () => storage.get<any[]>(STORAGE_KEYS.BLOG_POSTS) || [],
  
  getById: (id: string) => {
    const posts = blogStorage.getAll();
    return posts.find(p => p.id === id);
  },
  
  add: (post: any) => {
    const posts = blogStorage.getAll();
    posts.push(post);
    storage.set(STORAGE_KEYS.BLOG_POSTS, posts);
  },
  
  update: (id: string, updates: any) => {
    const posts = blogStorage.getAll();
    const index = posts.findIndex(p => p.id === id);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updates };
      storage.set(STORAGE_KEYS.BLOG_POSTS, posts);
    }
  },
  
  delete: (id: string) => {
    const posts = blogStorage.getAll().filter(p => p.id !== id);
    storage.set(STORAGE_KEYS.BLOG_POSTS, posts);
  },
};

// Questions storage
export const questionsStorage = {
  getAll: () => storage.get<any[]>(STORAGE_KEYS.QUESTIONS) || [],
  
  getById: (id: string) => {
    const questions = questionsStorage.getAll();
    return questions.find(q => q.id === id);
  },
  
  add: (question: any) => {
    const questions = questionsStorage.getAll();
    questions.push(question);
    storage.set(STORAGE_KEYS.QUESTIONS, questions);
  },
  
  update: (id: string, updates: any) => {
    const questions = questionsStorage.getAll();
    const index = questions.findIndex(q => q.id === id);
    if (index !== -1) {
      questions[index] = { ...questions[index], ...updates };
      storage.set(STORAGE_KEYS.QUESTIONS, questions);
    }
  },
  
  delete: (id: string) => {
    const questions = questionsStorage.getAll().filter(q => q.id !== id);
    storage.set(STORAGE_KEYS.QUESTIONS, questions);
  },
};

// Terms storage
export const termsStorage = {
  getAll: () => storage.get<any[]>(STORAGE_KEYS.TERMS) || [],
  
  getById: (id: string) => {
    const terms = termsStorage.getAll();
    return terms.find(t => t.id === id);
  },
  
  add: (term: any) => {
    const terms = termsStorage.getAll();
    terms.push(term);
    storage.set(STORAGE_KEYS.TERMS, terms);
  },
  
  update: (id: string, updates: any) => {
    const terms = termsStorage.getAll();
    const index = terms.findIndex(t => t.id === id);
    if (index !== -1) {
      terms[index] = { ...terms[index], ...updates };
      storage.set(STORAGE_KEYS.TERMS, terms);
    }
  },
  
  delete: (id: string) => {
    const terms = termsStorage.getAll().filter(t => t.id !== id);
    storage.set(STORAGE_KEYS.TERMS, terms);
  },
};

// Initialize check
export const isInitialized = () => storage.get<boolean>(STORAGE_KEYS.INITIALIZED) || false;
export const setInitialized = () => storage.set(STORAGE_KEYS.INITIALIZED, true);
