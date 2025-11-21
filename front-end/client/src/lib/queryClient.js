import { QueryClient } from "@tanstack/react-query";
import {
  localStorageAuth,
  localStorageMemories,
  localStorageLikes,
  localStorageComments,
  localStorageSaved,
  localStorageFollows,
  localStorageUsers,
  localStorageNotifications,
  localStorageMessages,
  localStorageAdminContents,
  localStorageAdminNotifications,
  localStorageInnovations,
  localStorageSearchSettings,
  localStorageLocations,
} from "./localStorage";

// Local Storage Mode - Routes all API calls to localStorage
const localStorageQueryFn = async ({ queryKey }) => {
  const [url, params] = queryKey;
  
  try {
    // Auth endpoints
    if (url === "/api/auth/me") {
      return localStorageAuth.getCurrentUser();
    }

    // Memories endpoints
    if (url === "/api/memories") {
      let memories = localStorageMemories.getAll();
      
      // Apply all filters in combination
      if (params?.q) {
        const query = params.q.toLowerCase();
        memories = memories.filter(m => 
          m.title?.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query) ||
          m.location?.toLowerCase().includes(query)
        );
      }
      
      if (params?.category && params.category !== "all") {
        memories = memories.filter(m => m.category === params.category);
      }
      
      if (params?.privacy) {
        memories = memories.filter(m => m.privacy === params.privacy);
      }
      
      // Enrich memories with user data
      return memories.map(memory => ({
        ...memory,
        user: localStorageUsers.getById(memory.userId),
      }));
    }

    if (url.startsWith("/api/memories/")) {
      const parts = url.split("/");
      const memoryId = parts[3];

      if (parts.length === 4) {
        // GET /api/memories/:id
        const memory = localStorageMemories.getById(memoryId);
        if (memory) {
          return {
            ...memory,
            user: localStorageUsers.getById(memory.userId),
          };
        }
        return null;
      }

      if (parts[4] === "reactions") {
        // GET /api/memories/:id/reactions
        return localStorageLikes.getByMemory(memoryId);
      }

      if (parts[4] === "comments") {
        // GET /api/memories/:id/comments
        const comments = localStorageComments.getByMemory(memoryId);
        // Enrich with user data
        return comments.map(comment => ({
          ...comment,
          user: localStorageUsers.getById(comment.userId),
        }));
      }
    }

    // Saved memories
    if (url === "/api/saved-memories") {
      const savedMemoryIds = localStorageSaved.getAll();
      const memories = localStorageMemories.getAll();
      return savedMemoryIds.map(saved => {
        const memory = memories.find(m => m.id === saved.memoryId);
        const user = localStorageUsers.getById(memory?.userId);
        return { memory, user };
      }).filter(item => item.memory);
    }

    if (url.startsWith("/api/saved-memories/check/")) {
      const memoryId = url.split("/").pop();
      return { isSaved: localStorageSaved.check(memoryId) };
    }

    // Follows
    if (url === "/api/follows") {
      return localStorageFollows.getAll();
    }

    // Users - IMPORTANT: Specific routes MUST come before generic /api/users/:id
    if (url === "/api/users") {
      return localStorageUsers.getAll();
    }

    // User profile by username
    if (url === "/api/users/profile") {
      const username = params;
      const allUsers = localStorageUsers.getAll();
      const user = allUsers.find(u => u.username === username);
      
      if (!user) return null;
      
      // Enrich profile with counts
      const memories = localStorageMemories.getAll();
      const follows = localStorageFollows.getAll();
      
      return {
        ...user,
        memoryCount: memories.filter(m => m.userId === user.id).length,
        followerCount: follows.filter(f => f.followingId === user.id).length,
        followingCount: follows.filter(f => f.followerId === user.id).length,
      };
    }

    // User search
    if (url === "/api/users/search") {
      const query = params?.q?.toLowerCase() || "";
      if (!query) return [];
      
      const allUsers = localStorageUsers.getAll();
      return allUsers.filter(user =>
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.bio?.toLowerCase().includes(query)
      );
    }

    // User's memories
    if (url.startsWith("/api/users/") && url.includes("/memories")) {
      const userId = url.split("/")[3];
      const currentUser = localStorageAuth.getCurrentUser();
      
      // Get all memories for this user
      let memories = localStorageMemories.getAll().filter(m => m.userId === userId);
      
      // If viewing someone else's profile, only show public memories
      if (!currentUser || currentUser.id !== userId) {
        memories = memories.filter(m => m.privacy === "public");
      }
      
      return memories.map(memory => ({
        ...memory,
        user: localStorageUsers.getById(memory.userId),
      }));
    }

    // Generic user by ID - MUST be last among /api/users/* routes
    if (url.startsWith("/api/users/")) {
      const userId = url.split("/").pop();
      return localStorageUsers.getById(userId);
    }

    // Notifications
    if (url === "/api/notifications") {
      return localStorageNotifications.getAll();
    }

    if (url === "/api/notifications/unread-count") {
      return { count: localStorageNotifications.getUnreadCount() };
    }

    // Search endpoints
    if (url === "/api/memories/search") {
      let memories = localStorageMemories.getAll();
      
      // Apply all filters in combination
      if (params?.q) {
        const query = params.q.toLowerCase();
        memories = memories.filter(m => 
          m.title?.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query) ||
          m.location?.toLowerCase().includes(query)
        );
      }
      
      if (params?.category && params.category !== "all" && params.category) {
        memories = memories.filter(m => m.category === params.category);
      }
      
      if (params?.privacy && params.privacy) {
        memories = memories.filter(m => m.privacy === params.privacy);
      }
      
      // Enrich memories with user data
      return memories.map(memory => ({
        ...memory,
        user: localStorageUsers.getById(memory.userId),
      }));
    }

    if (url.startsWith("/api/follows/check/")) {
      const followingId = url.split("/").pop();
      return { isFollowing: localStorageFollows.check(followingId) };
    }

    // Messages and conversations
    if (url === "/api/conversations") {
      return localStorageMessages.getConversations();
    }

    if (url.startsWith("/api/messages/conversation/")) {
      const partnerId = url.split("/").pop();
      const messages = localStorageMessages.getByConversation(partnerId);
      // Enrich messages with sender data
      return messages.map(msg => ({
        ...msg,
        sender: localStorageUsers.getById(msg.senderId),
      }));
    }

    // Admin endpoints
    if (url === "/api/admin/stats") {
      const users = localStorageUsers.getAll();
      const memories = localStorageMemories.getAll();
      const likes = localStorageLikes.getAll();
      const comments = localStorageComments.getAll();
      
      return {
        totalUsers: users.length,
        totalMemories: memories.length,
        totalLikes: likes.length,
        totalComments: comments.length,
        pendingReports: 0, // No reports system yet
      };
    }

    if (url === "/api/admin/users") {
      return localStorageUsers.getAll();
    }

    if (url === "/api/admin/reports") {
      // No reports system yet, return empty array
      return [];
    }

    if (url === "/api/admin/contents") {
      return localStorageAdminContents.getAll();
    }

    if (url === "/api/admin/notifications") {
      return localStorageAdminNotifications.getAll();
    }

    if (url === "/api/admin/innovations") {
      return localStorageInnovations.getAll();
    }

    if (url === "/api/admin/search-settings") {
      return localStorageSearchSettings.get();
    }

    if (url === "/api/admin/locations") {
      return localStorageLocations.getAll();
    }

    // Default: return null for unknown endpoints
    console.warn(`Unknown localStorage endpoint: ${url}`);
    return null;
  } catch (error) {
    console.error(`localStorage query error for ${url}:`, error);
    throw error;
  }
};

// API Request wrapper for mutations
export async function apiRequest(method, url, data) {
  // Auth endpoints
  if (url === "/api/auth/login") {
    const user = localStorageAuth.login(data.username, data.password);
    return { ok: true, json: async () => user };
  }

  if (url === "/api/auth/signup") {
    const user = localStorageAuth.signup(data.username, data.email, data.password);
    return { ok: true, json: async () => user };
  }

  if (url === "/api/auth/logout") {
    localStorageAuth.logout();
    return { ok: true, json: async () => ({}) };
  }

  // Memories endpoints
  if (url === "/api/memories" && method === "POST") {
    const memory = localStorageMemories.create(data);
    return { ok: true, json: async () => memory };
  }

  if (url.match(/\/api\/memories\/[^/]+$/) && method === "PUT") {
    const memoryId = url.split("/").pop();
    const memory = localStorageMemories.update(memoryId, data);
    return { ok: true, json: async () => memory };
  }

  if (url.match(/\/api\/memories\/[^/]+$/) && method === "DELETE") {
    const memoryId = url.split("/").pop();
    localStorageMemories.delete(memoryId);
    return { ok: true, json: async () => ({}) };
  }

  // Likes
  if (url.match(/\/api\/memories\/[^/]+\/like$/) && (method === "POST" || method === "DELETE")) {
    const memoryId = url.split("/")[3];
    const reactions = localStorageLikes.toggle(memoryId);
    return { ok: true, json: async () => reactions };
  }

  // Comments
  if (url.match(/\/api\/memories\/[^/]+\/comments$/) && method === "POST") {
    const memoryId = url.split("/")[3];
    const comment = localStorageComments.create(memoryId, data.text);
    const user = localStorageAuth.getCurrentUser();
    return { ok: true, json: async () => ({ ...comment, user }) };
  }

  if (url.match(/\/api\/comments\/[^/]+$/) && method === "DELETE") {
    const commentId = url.split("/").pop();
    localStorageComments.delete(commentId);
    return { ok: true, json: async () => ({}) };
  }

  // Saved memories
  if (url === "/api/saved-memories" && method === "POST") {
    localStorageSaved.toggle(data.memoryId);
    return { ok: true, json: async () => ({}) };
  }

  if (url.match(/\/api\/saved-memories\/[^/]+$/) && method === "DELETE") {
    const memoryId = url.split("/").pop();
    localStorageSaved.toggle(memoryId);
    return { ok: true, json: async () => ({}) };
  }

  // Follows
  if (url === "/api/follows" && method === "POST") {
    const followingId = data.followingId;
    localStorageFollows.add(followingId);
    return { ok: true, json: async () => ({}) };
  }

  if (url.match(/\/api\/follows\/[^/]+$/) && method === "DELETE") {
    const userId = url.split("/").pop();
    localStorageFollows.remove(userId);
    return { ok: true, json: async () => ({}) };
  }

  // Notifications
  if (url.match(/\/api\/notifications\/[^/]+\/read$/) && method === "PATCH") {
    const notificationId = url.split("/")[3];
    localStorageNotifications.markAsRead(notificationId);
    return { ok: true, json: async () => ({}) };
  }

  if (url === "/api/notifications/mark-all-read" && method === "PATCH") {
    localStorageNotifications.markAllAsRead();
    return { ok: true, json: async () => ({}) };
  }

  // Messages
  if (url === "/api/messages" && method === "POST") {
    const message = localStorageMessages.create(data.receiverId, data.content);
    return { ok: true, json: async () => message };
  }

  // Admin endpoints
  if (url.match(/\/api\/admin\/users\/[^/]+$/) && method === "DELETE") {
    const userId = url.split("/").pop();
    localStorageUsers.delete(userId);
    return { ok: true, json: async () => ({}) };
  }

  if (url === "/api/admin/contents" && method === "POST") {
    const content = localStorageAdminContents.create(data);
    return { ok: true, json: async () => content };
  }

  if (url.match(/\/api\/admin\/contents\/[^/]+$/) && method === "DELETE") {
    const contentId = url.split("/").pop();
    localStorageAdminContents.delete(contentId);
    return { ok: true, json: async () => ({}) };
  }

  if (url === "/api/admin/notifications" && method === "POST") {
    const notification = localStorageAdminNotifications.create(data);
    return { ok: true, json: async () => notification };
  }

  if (url.match(/\/api\/admin\/notifications\/[^/]+\/send$/) && method === "POST") {
    const notificationId = url.split("/")[4];
    const notification = localStorageAdminNotifications.send(notificationId);
    return { ok: true, json: async () => notification };
  }

  if (url.match(/\/api\/admin\/notifications\/[^/]+$/) && method === "DELETE") {
    const notificationId = url.split("/").pop();
    localStorageAdminNotifications.delete(notificationId);
    return { ok: true, json: async () => ({}) };
  }

  if (url === "/api/admin/innovations" && method === "POST") {
    const innovation = localStorageInnovations.create(data);
    return { ok: true, json: async () => innovation };
  }

  if (url.match(/\/api\/admin\/innovations\/[^/]+$/) && method === "PUT") {
    const innovationId = url.split("/").pop();
    const innovation = localStorageInnovations.update(innovationId, data);
    return { ok: true, json: async () => innovation };
  }

  if (url.match(/\/api\/admin\/innovations\/[^/]+$/) && method === "DELETE") {
    const innovationId = url.split("/").pop();
    localStorageInnovations.delete(innovationId);
    return { ok: true, json: async () => ({}) };
  }

  if (url === "/api/admin/search-settings" && method === "PUT") {
    const settings = localStorageSearchSettings.save(data);
    return { ok: true, json: async () => settings };
  }

  if (url === "/api/admin/locations" && method === "POST") {
    const location = localStorageLocations.create(data);
    return { ok: true, json: async () => location };
  }

  if (url.match(/\/api\/admin\/locations\/[^/]+$/) && method === "DELETE") {
    const locationId = url.split("/").pop();
    localStorageLocations.delete(locationId);
    return { ok: true, json: async () => ({}) };
  }

  console.warn(`Unknown localStorage mutation: ${method} ${url}`);
  return { ok: true, json: async () => ({}) };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: localStorageQueryFn,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
