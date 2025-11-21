// Local Storage Service - Complete frontend-only data management
// This replaces the backend API with browser localStorage

const STORAGE_KEYS = {
  USER: 'memoryplace_user',
  USERS: 'memoryplace_users',
  MEMORIES: 'memoryplace_memories',
  LIKES: 'memoryplace_likes',
  COMMENTS: 'memoryplace_comments',
  FOLLOWS: 'memoryplace_follows',
  SAVED_MEMORIES: 'memoryplace_saved_memories',
  MESSAGES: 'memoryplace_messages',
  NOTIFICATIONS: 'memoryplace_notifications',
  ADMIN_CONTENTS: 'memoryplace_admin_contents',
  ADMIN_NOTIFICATIONS: 'memoryplace_admin_notifications',
  INNOVATIONS: 'memoryplace_innovations',
  SEARCH_SETTINGS: 'memoryplace_search_settings',
  LOCATIONS: 'memoryplace_locations',
};

// Helper to generate IDs
const generateId = () => crypto.randomUUID();

// Helper to get data from localStorage
const getData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

// Helper to save data to localStorage
const setData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
};

// Initialize demo data if first time or if users array is empty/corrupt
const initializeDemoData = () => {
  let users = getData(STORAGE_KEYS.USERS);
  
  // Check if users are corrupt (missing passwords)
  if (users && Array.isArray(users) && users.length > 0) {
    let needsRepair = false;
    users = users.map(user => {
      if (!user.password) {
        needsRepair = true;
        // Restore default password for demo accounts
        if (user.username === 'admin') {
          return { ...user, password: 'admin123' };
        } else if (user.username === 'sarah') {
          return { ...user, password: 'sarah123' };
        } else {
          // For other users, set a default password
          return { ...user, password: 'password123' };
        }
      }
      return user;
    });
    
    if (needsRepair) {
      setData(STORAGE_KEYS.USERS, users);
      return; // Data repaired, exit
    }
  }
  
  if (!users || !Array.isArray(users) || users.length === 0) {
    // Create admin user
    const adminUser = {
      id: generateId(),
      username: 'admin',
      email: 'admin@memoryplace.com',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'admin',
      bio: 'Administrator - Full access to all features',
      avatarUrl: null,
      coverUrl: null,
      location: 'Memory Place HQ',
      createdAt: new Date().toISOString(),
    };

    // Create regular user
    const regularUser = {
      id: generateId(),
      username: 'sarah',
      email: 'sarah@memoryplace.com',
      password: 'sarah123',
      fullName: 'Sarah Johnson',
      role: 'creator',
      bio: 'Traveler and photographer capturing moments',
      avatarUrl: null,
      coverUrl: null,
      location: 'San Francisco, CA',
      createdAt: new Date().toISOString(),
    };

    setData(STORAGE_KEYS.USERS, [adminUser, regularUser]);
    
    // Create welcome memory from admin
    const adminMemory = {
      id: generateId(),
      userId: adminUser.id,
      title: 'Welcome to Memory of Place!',
      description: 'This app runs completely in your browser using Local Storage. All your data stays private and local to your device. Create an account or login with: admin/admin123 or sarah/sarah123',
      imageUrl: null,
      category: 'other',
      privacy: 'public',
      location: 'Local Storage',
      locationAddress: 'Your Browser',
      latitude: null,
      longitude: null,
      createdAt: new Date().toISOString(),
    };

    // Create sample memory from regular user
    const userMemory = {
      id: generateId(),
      userId: regularUser.id,
      title: 'My First Memory',
      description: 'This is a sample memory to show how the app works. You can create your own memories after logging in!',
      imageUrl: null,
      category: 'travel',
      privacy: 'public',
      location: 'San Francisco',
      locationAddress: 'Golden Gate Bridge, San Francisco, CA',
      latitude: null,
      longitude: null,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    };

    setData(STORAGE_KEYS.MEMORIES, [adminMemory, userMemory]);
    setData(STORAGE_KEYS.LIKES, []);
    setData(STORAGE_KEYS.COMMENTS, []);
    setData(STORAGE_KEYS.FOLLOWS, []);
    setData(STORAGE_KEYS.SAVED_MEMORIES, []);
    setData(STORAGE_KEYS.MESSAGES, []);
    setData(STORAGE_KEYS.NOTIFICATIONS, []);
  }
};

// Authentication
export const localStorageAuth = {
  // Login
  login: (username, password) => {
    // Always ensure demo data is initialized
    initializeDemoData();
    
    let users = getData(STORAGE_KEYS.USERS) || [];
    
    console.log('Login attempt:', { username, passwordLength: password?.length });
    console.log('Available users:', users.map(u => ({ 
      username: u.username, 
      hasPassword: !!u.password,
      role: u.role 
    })));
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      console.log('Login successful for:', user.username, 'role:', user.role);
      const { password: _, ...safeUser } = user;
      setData(STORAGE_KEYS.USER, safeUser);
      return safeUser;
    }
    
    console.error('Login failed - credentials not found');
    throw new Error('Invalid credentials');
  },

  // Signup
  signup: (username, email, password) => {
    const users = getData(STORAGE_KEYS.USERS) || [];
    
    if (users.find(u => u.username === username)) {
      throw new Error('Username already exists');
    }
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: generateId(),
      username,
      email,
      password,
      fullName: '',
      role: 'creator',
      bio: '',
      avatarUrl: null,
      coverUrl: null,
      location: '',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setData(STORAGE_KEYS.USERS, users);

    const { password: _, ...safeUser } = newUser;
    setData(STORAGE_KEYS.USER, safeUser);
    return safeUser;
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Get current user
  getCurrentUser: () => {
    return getData(STORAGE_KEYS.USER);
  },
};

// Memories
export const localStorageMemories = {
  getAll: () => {
    return getData(STORAGE_KEYS.MEMORIES) || [];
  },

  getById: (id) => {
    const memories = getData(STORAGE_KEYS.MEMORIES) || [];
    return memories.find(m => m.id === id);
  },

  create: (memoryData) => {
    const memories = getData(STORAGE_KEYS.MEMORIES) || [];
    const currentUser = localStorageAuth.getCurrentUser();
    
    const newMemory = {
      id: generateId(),
      userId: currentUser.id,
      ...memoryData,
      createdAt: new Date().toISOString(),
    };

    memories.unshift(newMemory);
    setData(STORAGE_KEYS.MEMORIES, memories);
    return newMemory;
  },

  update: (id, memoryData) => {
    const memories = getData(STORAGE_KEYS.MEMORIES) || [];
    const index = memories.findIndex(m => m.id === id);
    
    if (index !== -1) {
      memories[index] = { ...memories[index], ...memoryData };
      setData(STORAGE_KEYS.MEMORIES, memories);
      return memories[index];
    }
    throw new Error('Memory not found');
  },

  delete: (id) => {
    const memories = getData(STORAGE_KEYS.MEMORIES) || [];
    const filtered = memories.filter(m => m.id !== id);
    setData(STORAGE_KEYS.MEMORIES, filtered);
    
    // Also delete related data
    const likes = getData(STORAGE_KEYS.LIKES) || [];
    setData(STORAGE_KEYS.LIKES, likes.filter(l => l.memoryId !== id));
    
    const comments = getData(STORAGE_KEYS.COMMENTS) || [];
    setData(STORAGE_KEYS.COMMENTS, comments.filter(c => c.memoryId !== id));
    
    const saved = getData(STORAGE_KEYS.SAVED_MEMORIES) || [];
    setData(STORAGE_KEYS.SAVED_MEMORIES, saved.filter(s => s.memoryId !== id));
  },
};

// Likes/Reactions
export const localStorageLikes = {
  getByMemory: (memoryId) => {
    const likes = getData(STORAGE_KEYS.LIKES) || [];
    return likes.filter(l => l.memoryId === memoryId);
  },

  toggle: (memoryId) => {
    const likes = getData(STORAGE_KEYS.LIKES) || [];
    const currentUser = localStorageAuth.getCurrentUser();
    const existingIndex = likes.findIndex(l => l.memoryId === memoryId && l.userId === currentUser.id);

    if (existingIndex !== -1) {
      likes.splice(existingIndex, 1);
    } else {
      likes.push({
        id: generateId(),
        memoryId,
        userId: currentUser.id,
        type: 'like',
        createdAt: new Date().toISOString(),
      });
    }

    setData(STORAGE_KEYS.LIKES, likes);
    return likes.filter(l => l.memoryId === memoryId);
  },
};

// Comments
export const localStorageComments = {
  getByMemory: (memoryId) => {
    const comments = getData(STORAGE_KEYS.COMMENTS) || [];
    return comments.filter(c => c.memoryId === memoryId);
  },

  create: (memoryId, text) => {
    const comments = getData(STORAGE_KEYS.COMMENTS) || [];
    const currentUser = localStorageAuth.getCurrentUser();

    const newComment = {
      id: generateId(),
      memoryId,
      userId: currentUser.id,
      text,
      createdAt: new Date().toISOString(),
    };

    comments.push(newComment);
    setData(STORAGE_KEYS.COMMENTS, comments);
    return newComment;
  },

  delete: (id) => {
    const comments = getData(STORAGE_KEYS.COMMENTS) || [];
    const filtered = comments.filter(c => c.id !== id);
    setData(STORAGE_KEYS.COMMENTS, filtered);
  },
};

// Saved Memories
export const localStorageSaved = {
  getAll: () => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) return [];
    
    const saved = getData(STORAGE_KEYS.SAVED_MEMORIES) || [];
    return saved.filter(s => s.userId === currentUser.id);
  },

  check: (memoryId) => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) return false;
    
    const saved = getData(STORAGE_KEYS.SAVED_MEMORIES) || [];
    return saved.some(s => s.memoryId === memoryId && s.userId === currentUser.id);
  },

  toggle: (memoryId) => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in to save memories');
    
    const saved = getData(STORAGE_KEYS.SAVED_MEMORIES) || [];
    const existingIndex = saved.findIndex(s => s.memoryId === memoryId && s.userId === currentUser.id);

    if (existingIndex !== -1) {
      saved.splice(existingIndex, 1);
    } else {
      saved.push({
        id: generateId(),
        memoryId,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
      });
    }

    setData(STORAGE_KEYS.SAVED_MEMORIES, saved);
  },
};

// Follows
export const localStorageFollows = {
  getAll: () => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) return [];
    
    const follows = getData(STORAGE_KEYS.FOLLOWS) || [];
    return follows.filter(f => f.followerId === currentUser.id);
  },

  check: (followingId) => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) return false;
    
    const follows = getData(STORAGE_KEYS.FOLLOWS) || [];
    return follows.some(f => f.followerId === currentUser.id && f.followingId === followingId);
  },

  toggle: (followingId) => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in to follow users');
    
    const follows = getData(STORAGE_KEYS.FOLLOWS) || [];
    const existingIndex = follows.findIndex(f => f.followerId === currentUser.id && f.followingId === followingId);

    if (existingIndex !== -1) {
      follows.splice(existingIndex, 1);
    } else {
      follows.push({
        id: generateId(),
        followerId: currentUser.id,
        followingId,
        createdAt: new Date().toISOString(),
      });
    }

    setData(STORAGE_KEYS.FOLLOWS, follows);
  },

  add: (followingId) => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in to follow users');
    
    const follows = getData(STORAGE_KEYS.FOLLOWS) || [];
    const exists = follows.some(f => f.followerId === currentUser.id && f.followingId === followingId);

    // Only add if not already following
    if (!exists) {
      follows.push({
        id: generateId(),
        followerId: currentUser.id,
        followingId,
        createdAt: new Date().toISOString(),
      });
      setData(STORAGE_KEYS.FOLLOWS, follows);
    }
  },

  remove: (followingId) => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in to unfollow users');
    
    const follows = getData(STORAGE_KEYS.FOLLOWS) || [];
    const filteredFollows = follows.filter(f => !(f.followerId === currentUser.id && f.followingId === followingId));
    setData(STORAGE_KEYS.FOLLOWS, filteredFollows);
  },
};

// Users
export const localStorageUsers = {
  getAll: () => {
    const users = getData(STORAGE_KEYS.USERS) || [];
    return users.map(({ password, ...user }) => user);
  },

  getById: (id) => {
    const users = getData(STORAGE_KEYS.USERS) || [];
    const user = users.find(u => u.id === id);
    if (user) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
    return null;
  },

  delete: (userId) => {
    const users = getData(STORAGE_KEYS.USERS) || [];
    const filteredUsers = users.filter(u => u.id !== userId);
    setData(STORAGE_KEYS.USERS, filteredUsers);
    
    // Also delete all user's content
    const memories = getData(STORAGE_KEYS.MEMORIES) || [];
    const filteredMemories = memories.filter(m => m.userId !== userId);
    setData(STORAGE_KEYS.MEMORIES, filteredMemories);
    
    const comments = getData(STORAGE_KEYS.COMMENTS) || [];
    const filteredComments = comments.filter(c => c.userId !== userId);
    setData(STORAGE_KEYS.COMMENTS, filteredComments);
    
    return true;
  },
};

// Notifications
export const localStorageNotifications = {
  getAll: () => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) return [];
    
    const notifications = getData(STORAGE_KEYS.NOTIFICATIONS) || [];
    return notifications.filter(n => n.userId === currentUser.id);
  },

  getUnreadCount: () => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) return 0;
    
    const notifications = getData(STORAGE_KEYS.NOTIFICATIONS) || [];
    return notifications.filter(n => n.userId === currentUser.id && !n.isRead).length;
  },

  markAsRead: (notificationId) => {
    const notifications = getData(STORAGE_KEYS.NOTIFICATIONS) || [];
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  },

  markAllAsRead: () => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) return;
    
    const notifications = getData(STORAGE_KEYS.NOTIFICATIONS) || [];
    notifications.forEach(n => {
      if (n.userId === currentUser.id) {
        n.isRead = true;
      }
    });
    setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },
};

// Messages
export const localStorageMessages = {
  getConversations: () => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) return [];
    
    const messages = getData(STORAGE_KEYS.MESSAGES) || [];
    const users = getData(STORAGE_KEYS.USERS) || [];
    
    // Group messages by conversation partner
    const conversationMap = new Map();
    
    messages.forEach(msg => {
      // Determine the partner (other person in the conversation)
      const partnerId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
      
      // Only include messages where current user is sender or receiver
      if (msg.senderId !== currentUser.id && msg.receiverId !== currentUser.id) {
        return;
      }
      
      if (!conversationMap.has(partnerId)) {
        const partner = users.find(u => u.id === partnerId);
        if (partner) {
          const { password, ...safePartner } = partner;
          conversationMap.set(partnerId, {
            partner: safePartner,
            lastMessage: msg,
          });
        }
      } else {
        // Update if this message is more recent
        const existing = conversationMap.get(partnerId);
        if (new Date(msg.createdAt) > new Date(existing.lastMessage.createdAt)) {
          existing.lastMessage = msg;
        }
      }
    });
    
    return Array.from(conversationMap.values());
  },

  getByConversation: (partnerId) => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) return [];
    
    const messages = getData(STORAGE_KEYS.MESSAGES) || [];
    return messages.filter(msg => 
      (msg.senderId === currentUser.id && msg.receiverId === partnerId) ||
      (msg.senderId === partnerId && msg.receiverId === currentUser.id)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  create: (receiverId, content) => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in to send messages');
    
    const messages = getData(STORAGE_KEYS.MESSAGES) || [];
    const newMessage = {
      id: generateId(),
      senderId: currentUser.id,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
    };
    
    messages.push(newMessage);
    setData(STORAGE_KEYS.MESSAGES, messages);
    return newMessage;
  },
};

// Admin Content Management
export const localStorageAdminContents = {
  getAll: () => {
    return getData(STORAGE_KEYS.ADMIN_CONTENTS) || [];
  },

  create: (data) => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const contents = getData(STORAGE_KEYS.ADMIN_CONTENTS) || [];
    const newContent = {
      id: generateId(),
      ...data,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    contents.push(newContent);
    setData(STORAGE_KEYS.ADMIN_CONTENTS, contents);
    return newContent;
  },

  delete: (contentId) => {
    const contents = getData(STORAGE_KEYS.ADMIN_CONTENTS) || [];
    const filtered = contents.filter(c => c.id !== contentId);
    setData(STORAGE_KEYS.ADMIN_CONTENTS, filtered);
    return true;
  },
};

// Admin Notifications
export const localStorageAdminNotifications = {
  getAll: () => {
    return getData(STORAGE_KEYS.ADMIN_NOTIFICATIONS) || [];
  },

  create: (data) => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const notifications = getData(STORAGE_KEYS.ADMIN_NOTIFICATIONS) || [];
    const newNotification = {
      id: generateId(),
      ...data,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      sent: false,
    };

    notifications.push(newNotification);
    setData(STORAGE_KEYS.ADMIN_NOTIFICATIONS, notifications);
    return newNotification;
  },

  send: (notificationId) => {
    const notifications = getData(STORAGE_KEYS.ADMIN_NOTIFICATIONS) || [];
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.sent = true;
      notification.sentAt = new Date().toISOString();
      setData(STORAGE_KEYS.ADMIN_NOTIFICATIONS, notifications);
    }
    
    return notification;
  },

  delete: (notificationId) => {
    const notifications = getData(STORAGE_KEYS.ADMIN_NOTIFICATIONS) || [];
    const filtered = notifications.filter(n => n.id !== notificationId);
    setData(STORAGE_KEYS.ADMIN_NOTIFICATIONS, filtered);
    return true;
  },
};

// Innovation Ideas
export const localStorageInnovations = {
  getAll: () => {
    return getData(STORAGE_KEYS.INNOVATIONS) || [];
  },

  create: (data) => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in');

    const innovations = getData(STORAGE_KEYS.INNOVATIONS) || [];
    const newIdea = {
      id: generateId(),
      ...data,
      ownerId: currentUser.id,
      status: 'under_review',
      createdAt: new Date().toISOString(),
    };

    innovations.push(newIdea);
    setData(STORAGE_KEYS.INNOVATIONS, innovations);
    return newIdea;
  },

  update: (innovationId, data) => {
    const innovations = getData(STORAGE_KEYS.INNOVATIONS) || [];
    const index = innovations.findIndex(i => i.id === innovationId);
    
    if (index !== -1) {
      innovations[index] = { ...innovations[index], ...data };
      setData(STORAGE_KEYS.INNOVATIONS, innovations);
      return innovations[index];
    }
    return null;
  },

  delete: (innovationId) => {
    const innovations = getData(STORAGE_KEYS.INNOVATIONS) || [];
    const filtered = innovations.filter(i => i.id !== innovationId);
    setData(STORAGE_KEYS.INNOVATIONS, filtered);
    return true;
  },
};

// Search Settings
export const localStorageSearchSettings = {
  get: () => {
    return getData(STORAGE_KEYS.SEARCH_SETTINGS) || {
      ranking: 'relevance',
      advancedSearch: false,
      autocomplete: true,
      searchHistory: true,
      theme: 'auto',
    };
  },

  save: (settings) => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Admin access required');
    }

    setData(STORAGE_KEYS.SEARCH_SETTINGS, settings);
    return settings;
  },
};

// Locations
export const localStorageLocations = {
  getAll: () => {
    return getData(STORAGE_KEYS.LOCATIONS) || [];
  },

  create: (data) => {
    const currentUser = localStorageAuth.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const locations = getData(STORAGE_KEYS.LOCATIONS) || [];
    const newLocation = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    locations.push(newLocation);
    setData(STORAGE_KEYS.LOCATIONS, locations);
    return newLocation;
  },

  delete: (locationId) => {
    const locations = getData(STORAGE_KEYS.LOCATIONS) || [];
    const filtered = locations.filter(l => l.id !== locationId);
    setData(STORAGE_KEYS.LOCATIONS, filtered);
    return true;
  },
};

// Initialize on load
initializeDemoData();

// Clear corrupt sessions - if logged-in user doesn't exist in users list
const currentSessionUser = getData(STORAGE_KEYS.USER);
if (currentSessionUser) {
  const users = getData(STORAGE_KEYS.USERS) || [];
  const userExists = users.find(u => u.id === currentSessionUser.id);
  if (!userExists) {
    // Session user doesn't exist in users list - clear corrupt session
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}
