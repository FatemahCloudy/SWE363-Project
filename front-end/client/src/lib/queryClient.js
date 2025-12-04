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
    localStorageSharedGroups,
    localStorageCollaborativeEntries,
    localStorageFriends,
    localStorageReports,
    localStorageSecuritySettings,
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
            const reports = localStorageReports.getAll();
            const pendingReports = reports.filter(r => r.status === 'pending').length;

            return {
                totalUsers: users.length,
                totalMemories: memories.length,
                totalLikes: 0,
                totalComments: 0,
                pendingReports,
            };
        }

        if (url === "/api/admin/users") {
            return localStorageUsers.getAll();
        }

        if (url === "/api/admin/reports") {
            return localStorageReports.getAll();
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

        // Collaborative endpoints
        if (url === "/api/collaborative/friends") {
            return localStorageFriends.getAll();
        }

        if (url === "/api/collaborative/my-groups") {
            return localStorageSharedGroups.getMyGroups();
        }

        if (url.match(/^\/api\/collaborative\/groups\/[^/]+$/)) {
            const groupId = url.split("/").pop();
            return localStorageSharedGroups.getWithEntries(groupId);
        }

        if (url.match(/^\/api\/collaborative\/groups\/[^/]+\/entries$/)) {
            const groupId = url.split("/")[4];
            return localStorageCollaborativeEntries.getByGroup(groupId);
        }

        // Default: return null for unknown endpoints
        console.warn(`Unknown localStorage endpoint: ${url}`);
        return null;
    } catch (error) {
        console.error(`localStorage query error for ${url}:`, error);
        throw error;
    }
};

// LocalStorage API Request wrapper for mutations
async function localStorageApiRequest(method, url, data) {
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
        const comment = localStorageComments.create(memoryId, data.content || data.text);
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

    if (url.match(/\/api\/admin\/locations\/[^/]+$/) && method === "PUT") {
        const locationId = url.split("/").pop();
        const location = localStorageLocations.update(locationId, data);
        return { ok: true, json: async () => location };
    }

    if (url.match(/\/api\/admin\/locations\/[^/]+$/) && method === "DELETE") {
        const locationId = url.split("/").pop();
        localStorageLocations.delete(locationId);
        return { ok: true, json: async () => ({}) };
    }

    // Reports
    if (url === "/api/reports" && method === "POST") {
        const report = localStorageReports.create(data.memoryId, data.reason);
        return { ok: true, json: async () => report };
    }

    if (url.match(/\/api\/admin\/reports\/[^/]+\/review$/) && method === "POST") {
        const reportId = url.split("/")[4];
        const report = localStorageReports.review(reportId, data.action);
        return { ok: true, json: async () => report };
    }

    // Security settings
    if (url === "/api/admin/security/password" && method === "PUT") {
        localStorageSecuritySettings.updatePassword(data.currentPassword, data.newPassword);
        return { ok: true, json: async () => ({ success: true }) };
    }

    if (url === "/api/admin/security/email" && method === "PUT") {
        localStorageSecuritySettings.updateEmail(data.email);
        return { ok: true, json: async () => ({ success: true }) };
    }

    // Collaborative endpoints
    if (url === "/api/collaborative/create" && method === "POST") {
        const group = localStorageSharedGroups.create(data);
        return { ok: true, json: async () => ({ success: true, data: { group } }) };
    }

    if (url.match(/\/api\/collaborative\/groups\/[^/]+\/respond$/) && method === "POST") {
        const groupId = url.split("/")[4];
        const result = localStorageSharedGroups.respondToInvitation(groupId, data.response);
        return { ok: true, json: async () => ({ success: true, data: result }) };
    }

    if (url.match(/\/api\/collaborative\/groups\/[^/]+\/entries$/) && method === "POST") {
        const groupId = url.split("/")[4];
        const entry = localStorageCollaborativeEntries.create(groupId, data);
        return { ok: true, json: async () => ({ success: true, data: entry }) };
    }

    if (url.match(/\/api\/collaborative\/groups\/[^/]+\/entries\/[^/]+$/) && method === "PUT") {
        const parts = url.split("/");
        const groupId = parts[4];
        const entryId = parts[6];
        const entry = localStorageCollaborativeEntries.update(groupId, entryId, data);
        return { ok: true, json: async () => ({ success: true, data: entry }) };
    }

    if (url.match(/\/api\/collaborative\/groups\/[^/]+\/entries\/[^/]+$/) && method === "DELETE") {
        const parts = url.split("/");
        const groupId = parts[4];
        const entryId = parts[6];
        localStorageCollaborativeEntries.delete(groupId, entryId);
        return { ok: true, json: async () => ({ success: true }) };
    }

    console.warn(`Unknown localStorage mutation: ${method} ${url}`);
    return { ok: true, json: async () => ({}) };
}

// ============================================================
// SWITCH BETWEEN LOCALSTORAGE AND REAL BACKEND API
// ============================================================
// Set to FALSE to use real MongoDB backend API
// Set to TRUE to use localStorage (offline/development mode)
const USE_LOCAL_STORAGE = true;
// ============================================================

// Real API fetch function for backend
const realApiQueryFn = async ({ queryKey }) => {
    const [url, params] = queryKey;

    let fullUrl = url;
    if (params && typeof params === 'object') {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, value);
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            fullUrl = `${url}?${queryString}`;
        }
    } else if (params && typeof params === 'string') {
        fullUrl = `${url}?q=${encodeURIComponent(params)}`;
    }

    const response = await fetch(fullUrl, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'API error' }));
        throw new Error(error.message || `API error: ${response.status}`);
    }

    return response.json();
};

// Real API mutation function for backend
const realApiRequest = async (method, url, data) => {
    const response = await fetch(url, {
        method: method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
    });

    return response;
};

// Export the appropriate apiRequest function based on mode
export const apiRequest = USE_LOCAL_STORAGE ? localStorageApiRequest : realApiRequest;

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryFn: USE_LOCAL_STORAGE ? localStorageQueryFn : realApiQueryFn,
            refetchInterval: false,
            refetchOnWindowFocus: USE_LOCAL_STORAGE ? false : true,
            staleTime: USE_LOCAL_STORAGE ? Infinity : 5 * 60 * 1000,
            retry: USE_LOCAL_STORAGE ? false : 1,
        },
        mutations: {
            retry: false,
        },
    },
});
