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
    SHARED_GROUPS: 'memoryplace_shared_groups',
    COLLABORATIVE_ENTRIES: 'memoryplace_collaborative_entries',
    REPORTS: 'memoryplace_reports',
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

            // Create notification for memory owner
            const memories = getData(STORAGE_KEYS.MEMORIES) || [];
            const memory = memories.find(m => m.id === memoryId);
            if (memory && memory.userId !== currentUser.id) {
                const notifications = getData(STORAGE_KEYS.NOTIFICATIONS) || [];
                notifications.push({
                    id: generateId(),
                    userId: memory.userId,
                    type: 'like',
                    content: `${currentUser.username} liked your memory "${memory.title}"`,
                    fromUserId: currentUser.id,
                    metadata: { memoryId },
                    isRead: false,
                    createdAt: new Date().toISOString(),
                });
                setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
            }
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
            content: text,
            createdAt: new Date().toISOString(),
        };

        comments.push(newComment);
        setData(STORAGE_KEYS.COMMENTS, comments);

        // Create notification for memory owner
        const memories = getData(STORAGE_KEYS.MEMORIES) || [];
        const memory = memories.find(m => m.id === memoryId);
        if (memory && memory.userId !== currentUser.id) {
            const notifications = getData(STORAGE_KEYS.NOTIFICATIONS) || [];
            notifications.push({
                id: generateId(),
                userId: memory.userId,
                type: 'comment',
                content: `${currentUser.username} commented on your memory "${memory.title}"`,
                fromUserId: currentUser.id,
                metadata: { memoryId, commentId: newComment.id },
                isRead: false,
                createdAt: new Date().toISOString(),
            });
            setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
        }

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

            // Create notification for followed user
            const notifications = getData(STORAGE_KEYS.NOTIFICATIONS) || [];
            notifications.push({
                id: generateId(),
                userId: followingId,
                type: 'follow',
                content: `${currentUser.username} started following you`,
                fromUserId: currentUser.id,
                isRead: false,
                createdAt: new Date().toISOString(),
            });
            setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
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

    update: (locationId, data) => {
        const currentUser = localStorageAuth.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Admin access required');
        }

        const locations = getData(STORAGE_KEYS.LOCATIONS) || [];
        const index = locations.findIndex(l => l.id === locationId);

        if (index !== -1) {
            locations[index] = { ...locations[index], ...data, updatedAt: new Date().toISOString() };
            setData(STORAGE_KEYS.LOCATIONS, locations);
            return locations[index];
        }
        throw new Error('Location not found');
    },

    delete: (locationId) => {
        const locations = getData(STORAGE_KEYS.LOCATIONS) || [];
        const filtered = locations.filter(l => l.id !== locationId);
        setData(STORAGE_KEYS.LOCATIONS, filtered);
        return true;
    },
};

// Shared Memory Groups (Collaborative)
export const localStorageSharedGroups = {
    getAll: () => {
        return getData(STORAGE_KEYS.SHARED_GROUPS) || [];
    },

    getById: (groupId) => {
        const groups = getData(STORAGE_KEYS.SHARED_GROUPS) || [];
        return groups.find(g => g.id === groupId) || null;
    },

    getMyGroups: () => {
        const currentUser = localStorageAuth.getCurrentUser();
        if (!currentUser) return { owned: [], contributing: [], invitations: [] };

        const groups = getData(STORAGE_KEYS.SHARED_GROUPS) || [];
        const users = getData(STORAGE_KEYS.USERS) || [];
        const allEntries = getData(STORAGE_KEYS.COLLABORATIVE_ENTRIES) || [];

        const enrichGroup = (group) => {
            const owner = users.find(u => u.id === group.ownerId);
            const contributorsList = (group.contributors || []).map(cId => users.find(u => u.id === cId)).filter(Boolean);

            const groupEntries = allEntries
                .filter(e => e.groupId === group.id)
                .map(entry => {
                    const author = users.find(u => u.id === entry.authorId);
                    return {
                        ...entry,
                        _id: entry.id,
                        userId: entry.authorId,
                        user: author ? { ...author, _id: author.id } : null,
                    };
                })
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return {
                ...group,
                _id: group.id,
                owner: owner ? { ...owner, _id: owner.id } : null,
                contributors: contributorsList.map(c => ({ ...c, _id: c.id, username: c.username, avatarUrl: c.avatarUrl })),
                collaborators: contributorsList.map(c => ({ ...c, _id: c.id, username: c.username, avatarUrl: c.avatarUrl })),
                contributorCount: contributorsList.length,
                entries: groupEntries,
            };
        };

        const owned = groups
            .filter(g => String(g.ownerId) === String(currentUser.id))
            .map(enrichGroup);

        const contributing = groups
            .filter(g => String(g.ownerId) !== String(currentUser.id) &&
                g.contributors?.some(cId => String(cId) === String(currentUser.id)))
            .map(enrichGroup);

        const invitations = groups
            .filter(g => {
                const invitation = g.invitedUsers?.find(inv => String(inv.userId) === String(currentUser.id));
                return invitation && invitation.status === 'pending';
            })
            .map(enrichGroup);

        return { owned, contributing, invitations };
    },

    create: (data) => {
        const currentUser = localStorageAuth.getCurrentUser();
        if (!currentUser) throw new Error('Login required');

        const groups = getData(STORAGE_KEYS.SHARED_GROUPS) || [];
        const newGroup = {
            id: generateId(),
            title: data.groupTitle || data.title,
            description: data.groupDescription || data.description,
            ownerId: currentUser.id,
            location: data.location,
            locationAddress: data.locationAddress,
            eventName: data.eventName,
            eventDate: data.eventDate,
            privacy: data.groupPrivacy || 'collaborators_only',
            coverImageUrl: data.imageUrl,
            invitedUsers: (data.collaboratorIds || []).map(id => ({
                userId: id,
                status: 'pending',
                invitedAt: new Date().toISOString(),
            })),
            contributors: [currentUser.id],
            entryCount: 1,
            createdAt: new Date().toISOString(),
        };

        groups.push(newGroup);
        setData(STORAGE_KEYS.SHARED_GROUPS, groups);

        // Create notifications for invited users
        const notifications = getData(STORAGE_KEYS.NOTIFICATIONS) || [];
        for (const collabId of data.collaboratorIds || []) {
            notifications.push({
                id: generateId(),
                userId: collabId,
                type: 'collaboration_invite',
                content: `${currentUser.username} invited you to contribute to "${newGroup.title}"`,
                fromUserId: currentUser.id,
                metadata: { groupId: newGroup.id, groupTitle: newGroup.title },
                isRead: false,
                createdAt: new Date().toISOString(),
            });
        }
        setData(STORAGE_KEYS.NOTIFICATIONS, notifications);

        return newGroup;
    },

    respondToInvitation: (groupId, response) => {
        const currentUser = localStorageAuth.getCurrentUser();
        if (!currentUser) throw new Error('Login required');

        const groups = getData(STORAGE_KEYS.SHARED_GROUPS) || [];

        // Find group by id (handle both string and number comparison)
        const groupIndex = groups.findIndex(g => String(g.id) === String(groupId));

        if (groupIndex === -1) {
            console.warn('Group not found for respondToInvitation:', groupId);
            // Return success anyway to prevent blocking UI
            return { status: response === 'accept' ? 'accepted' : 'declined', isContributor: response === 'accept' };
        }

        const group = groups[groupIndex];

        // Ensure invitedUsers array exists
        if (!group.invitedUsers) {
            group.invitedUsers = [];
        }

        // Find invitation with flexible ID comparison
        const invitationIndex = group.invitedUsers.findIndex(inv =>
            String(inv.userId) === String(currentUser.id)
        );

        // If user is not in invitedUsers, add them and process the response
        if (invitationIndex === -1) {
            // User might have been invited via notification - add them now
            group.invitedUsers.push({
                userId: currentUser.id,
                status: response === 'accept' ? 'accepted' : 'declined',
                invitedAt: new Date().toISOString(),
                respondedAt: new Date().toISOString(),
            });

            if (response === 'accept') {
                if (!group.contributors) group.contributors = [];
                if (!group.contributors.some(cId => String(cId) === String(currentUser.id))) {
                    group.contributors.push(currentUser.id);
                }
            }

            groups[groupIndex] = group;
            setData(STORAGE_KEYS.SHARED_GROUPS, groups);

            return { status: response === 'accept' ? 'accepted' : 'declined', isContributor: response === 'accept' };
        }

        const invitation = group.invitedUsers[invitationIndex];
        if (invitation.status !== 'pending') {
            // Already responded, just return current status
            return { status: invitation.status, isContributor: group.contributors?.some(cId => String(cId) === String(currentUser.id)) };
        }

        invitation.status = response === 'accept' ? 'accepted' : 'declined';
        invitation.respondedAt = new Date().toISOString();

        if (response === 'accept') {
            if (!group.contributors) group.contributors = [];
            if (!group.contributors.some(cId => String(cId) === String(currentUser.id))) {
                group.contributors.push(currentUser.id);
            }
        }

        groups[groupIndex] = group;
        setData(STORAGE_KEYS.SHARED_GROUPS, groups);

        return { status: invitation.status, isContributor: response === 'accept' };
    },

    getWithEntries: (groupId) => {
        const currentUser = localStorageAuth.getCurrentUser();
        if (!currentUser) throw new Error('Login required');

        const groups = getData(STORAGE_KEYS.SHARED_GROUPS) || [];
        const group = groups.find(g => String(g.id) === String(groupId));

        if (!group) {
            // Return empty result instead of throwing
            return {
                group: null,
                entries: [],
                isOwner: false,
                isContributor: false,
                canContribute: false,
            };
        }

        const users = getData(STORAGE_KEYS.USERS) || [];
        const entries = getData(STORAGE_KEYS.COLLABORATIVE_ENTRIES) || [];

        const groupEntries = entries
            .filter(e => String(e.groupId) === String(groupId))
            .map(entry => {
                const author = users.find(u => String(u.id) === String(entry.authorId));
                return {
                    ...entry,
                    _id: entry.id,
                    authorId: author ? { ...author, _id: author.id } : null,
                };
            });

        const owner = users.find(u => String(u.id) === String(group.ownerId));
        const contributors = (group.contributors || []).map(cId =>
            users.find(u => String(u.id) === String(cId))
        ).filter(Boolean);

        const isOwner = String(group.ownerId) === String(currentUser.id);
        const isContributor = group.contributors?.some(cId => String(cId) === String(currentUser.id));
        const canContribute = isOwner || isContributor;

        return {
            group: {
                ...group,
                _id: group.id,
                ownerId: owner ? { ...owner, _id: owner.id } : null,
                contributors: contributors.map(c => ({ ...c, _id: c.id })),
                contributorCount: contributors.length,
            },
            entries: groupEntries,
            isOwner,
            isContributor,
            canContribute,
        };
    },
};

// Collaborative Entries
export const localStorageCollaborativeEntries = {
    getByGroup: (groupId) => {
        const entries = getData(STORAGE_KEYS.COLLABORATIVE_ENTRIES) || [];
        const users = getData(STORAGE_KEYS.USERS) || [];

        return entries
            .filter(e => String(e.groupId) === String(groupId))
            .map(entry => {
                const author = users.find(u => String(u.id) === String(entry.authorId));
                return {
                    ...entry,
                    _id: entry.id,
                    authorId: author ? { ...author, _id: author.id } : null,
                };
            });
    },

    create: (groupId, data) => {
        const currentUser = localStorageAuth.getCurrentUser();
        if (!currentUser) throw new Error('Login required');

        const groups = getData(STORAGE_KEYS.SHARED_GROUPS) || [];
        const groupIndex = groups.findIndex(g => String(g.id) === String(groupId));

        if (groupIndex === -1) throw new Error('Group not found');

        const group = groups[groupIndex];
        const isContributor = group.contributors?.some(cId => String(cId) === String(currentUser.id)) ||
            String(group.ownerId) === String(currentUser.id);

        if (!isContributor) throw new Error('You are not authorized to contribute to this group');

        const entries = getData(STORAGE_KEYS.COLLABORATIVE_ENTRIES) || [];

        // Check if user already has an entry
        const existingEntry = entries.find(e =>
            String(e.groupId) === String(groupId) && String(e.authorId) === String(currentUser.id)
        );
        if (existingEntry) {
            throw new Error('You have already added your memory to this group');
        }

        const newEntry = {
            id: generateId(),
            groupId,
            authorId: currentUser.id,
            title: data.title,
            content: data.content,
            imageUrl: data.imageUrl,
            perspective: data.perspective,
            mood: data.mood,
            visibility: 'published',
            createdAt: new Date().toISOString(),
        };

        entries.push(newEntry);
        setData(STORAGE_KEYS.COLLABORATIVE_ENTRIES, entries);

        // Update group entry count
        group.entryCount = (group.entryCount || 0) + 1;
        groups[groupIndex] = group;
        setData(STORAGE_KEYS.SHARED_GROUPS, groups);

        const users = getData(STORAGE_KEYS.USERS) || [];
        const author = users.find(u => String(u.id) === String(currentUser.id));

        return {
            ...newEntry,
            _id: newEntry.id,
            authorId: author ? { ...author, _id: author.id } : null,
        };
    },

    update: (groupId, entryId, data) => {
        const currentUser = localStorageAuth.getCurrentUser();
        if (!currentUser) throw new Error('Login required');

        const entries = getData(STORAGE_KEYS.COLLABORATIVE_ENTRIES) || [];
        const entryIndex = entries.findIndex(e =>
            String(e.id) === String(entryId) && String(e.groupId) === String(groupId)
        );

        if (entryIndex === -1) throw new Error('Entry not found');

        const entry = entries[entryIndex];
        if (String(entry.authorId) !== String(currentUser.id)) {
            throw new Error('You can only edit your own entry');
        }

        entries[entryIndex] = { ...entry, ...data, updatedAt: new Date().toISOString() };
        setData(STORAGE_KEYS.COLLABORATIVE_ENTRIES, entries);

        return entries[entryIndex];
    },

    delete: (groupId, entryId) => {
        const currentUser = localStorageAuth.getCurrentUser();
        if (!currentUser) throw new Error('Login required');

        const entries = getData(STORAGE_KEYS.COLLABORATIVE_ENTRIES) || [];
        const entry = entries.find(e =>
            String(e.id) === String(entryId) && String(e.groupId) === String(groupId)
        );

        if (!entry) throw new Error('Entry not found');

        const groups = getData(STORAGE_KEYS.SHARED_GROUPS) || [];
        const group = groups.find(g => String(g.id) === String(groupId));

        const isAuthor = String(entry.authorId) === String(currentUser.id);
        const isOwner = group && String(group.ownerId) === String(currentUser.id);

        if (!isAuthor && !isOwner) {
            throw new Error('You can only delete your own entry');
        }

        const filtered = entries.filter(e => String(e.id) !== String(entryId));
        setData(STORAGE_KEYS.COLLABORATIVE_ENTRIES, filtered);

        // Update group entry count
        if (group) {
            const groupIndex = groups.findIndex(g => String(g.id) === String(groupId));
            groups[groupIndex].entryCount = Math.max(0, (group.entryCount || 1) - 1);
            setData(STORAGE_KEYS.SHARED_GROUPS, groups);
        }

        return true;
    },
};

// Friends for collaboration
export const localStorageFriends = {
    getAll: () => {
        const currentUser = localStorageAuth.getCurrentUser();
        if (!currentUser) return [];

        const follows = getData(STORAGE_KEYS.FOLLOWS) || [];
        const users = getData(STORAGE_KEYS.USERS) || [];

        // Get all users that I follow or who follow me
        const friendIds = new Set();
        follows.forEach(f => {
            if (String(f.followerId) === String(currentUser.id)) {
                friendIds.add(String(f.followingId));
            }
            if (String(f.followingId) === String(currentUser.id)) {
                friendIds.add(String(f.followerId));
            }
        });

        return users
            .filter(u => friendIds.has(String(u.id)) && String(u.id) !== String(currentUser.id))
            .map(u => ({ ...u, _id: u.id }));
    },
};

// Security Settings (password/email updates for admin)
export const localStorageSecuritySettings = {
    updatePassword: (currentPassword, newPassword) => {
        const currentUser = localStorageAuth.getCurrentUser();
        if (!currentUser) throw new Error('Must be logged in');

        const users = getData(STORAGE_KEYS.USERS) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex === -1) throw new Error('User not found');

        const user = users[userIndex];
        if (user.password !== currentPassword) {
            throw new Error('Current password is incorrect');
        }

        users[userIndex].password = newPassword;
        setData(STORAGE_KEYS.USERS, users);
        return true;
    },

    updateEmail: (newEmail) => {
        const currentUser = localStorageAuth.getCurrentUser();
        if (!currentUser) throw new Error('Must be logged in');

        const users = getData(STORAGE_KEYS.USERS) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex === -1) throw new Error('User not found');

        // Check if email already exists
        const emailExists = users.some(u => u.email === newEmail && u.id !== currentUser.id);
        if (emailExists) {
            throw new Error('Email already in use');
        }

        users[userIndex].email = newEmail;
        setData(STORAGE_KEYS.USERS, users);

        // Update current user session
        const updatedUser = { ...currentUser, email: newEmail };
        setData(STORAGE_KEYS.USER, updatedUser);

        return true;
    },
};

// Reports
export const localStorageReports = {
    getAll: () => {
        const reports = getData(STORAGE_KEYS.REPORTS) || [];
        const users = getData(STORAGE_KEYS.USERS) || [];
        const memories = getData(STORAGE_KEYS.MEMORIES) || [];

        return reports.map(report => {
            const reporter = users.find(u => u.id === report.reporterId);
            const memory = memories.find(m => m.id === report.memoryId);
            const memoryOwner = memory ? users.find(u => u.id === memory.userId) : null;

            return {
                ...report,
                reporter: reporter ? {
                    id: reporter.id,
                    username: reporter.username,
                    avatarUrl: reporter.avatarUrl
                } : null,
                memory: memory ? {
                    ...memory,
                    user: memoryOwner ? {
                        id: memoryOwner.id,
                        username: memoryOwner.username,
                        avatarUrl: memoryOwner.avatarUrl
                    } : null,
                } : null,
            };
        }).filter(r => r.memory !== null);
    },

    create: (memoryId, reason) => {
        const currentUser = localStorageAuth.getCurrentUser();
        if (!currentUser) throw new Error('Must be logged in to report');

        const reports = getData(STORAGE_KEYS.REPORTS) || [];

        // Check if user already reported this memory
        const existingReport = reports.find(
            r => r.memoryId === memoryId && r.reporterId === currentUser.id && r.status === 'pending'
        );
        if (existingReport) {
            throw new Error('You have already reported this memory');
        }

        const newReport = {
            id: generateId(),
            memoryId,
            reporterId: currentUser.id,
            reason,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        reports.push(newReport);
        setData(STORAGE_KEYS.REPORTS, reports);
        return newReport;
    },

    review: (reportId, action) => {
        const currentUser = localStorageAuth.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Admin access required');
        }

        const reports = getData(STORAGE_KEYS.REPORTS) || [];
        const reportIndex = reports.findIndex(r => r.id === reportId);

        if (reportIndex === -1) throw new Error('Report not found');

        const report = reports[reportIndex];

        if (action === 'delete') {
            // Delete the memory
            const memories = getData(STORAGE_KEYS.MEMORIES) || [];
            const filteredMemories = memories.filter(m => m.id !== report.memoryId);
            setData(STORAGE_KEYS.MEMORIES, filteredMemories);

            // Also delete related data
            const likes = getData(STORAGE_KEYS.LIKES) || [];
            setData(STORAGE_KEYS.LIKES, likes.filter(l => l.memoryId !== report.memoryId));

            const comments = getData(STORAGE_KEYS.COMMENTS) || [];
            setData(STORAGE_KEYS.COMMENTS, comments.filter(c => c.memoryId !== report.memoryId));

            const saved = getData(STORAGE_KEYS.SAVED_MEMORIES) || [];
            setData(STORAGE_KEYS.SAVED_MEMORIES, saved.filter(s => s.memoryId !== report.memoryId));

            // Mark all pending reports for this memory as resolved
            reports.forEach((r, idx) => {
                if (r.memoryId === report.memoryId && r.status === 'pending') {
                    reports[idx].status = 'resolved';
                    reports[idx].action = 'content_deleted';
                    reports[idx].reviewedAt = new Date().toISOString();
                    reports[idx].reviewedBy = currentUser.id;
                }
            });
        } else if (action === 'dismiss') {
            reports[reportIndex].status = 'dismissed';
            reports[reportIndex].reviewedAt = new Date().toISOString();
            reports[reportIndex].reviewedBy = currentUser.id;
        }

        setData(STORAGE_KEYS.REPORTS, reports);
        return reports[reportIndex];
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
