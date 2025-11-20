import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, decimal, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User role enum
export const UserRole = {
  ADMIN: "admin",
  USER: "user", // Regular users can both create and view
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// User status enum
export const UserStatus = {
  ACTIVE: "active",
  WARNED: "warned",
  BANNED: "banned",
} as const;

export type UserStatusType = typeof UserStatus[keyof typeof UserStatus];

// Moderation action types
export const ModerationActionType = {
  WARN_USER: "warn_user",
  BAN_USER: "ban_user",
  UNBAN_USER: "unban_user",
  APPROVE_REPORT: "approve_report",
  DISMISS_REPORT: "dismiss_report",
  REMOVE_CONTENT: "remove_content",
} as const;

export type ModerationActionTypeValue = typeof ModerationActionType[keyof typeof ModerationActionType];

// Memory privacy enum
export const MemoryPrivacy = {
  PUBLIC: "public",
  PRIVATE: "private",
  FOLLOWERS_ONLY: "followers_only",
} as const;

export type MemoryPrivacyType = typeof MemoryPrivacy[keyof typeof MemoryPrivacy];

// Memory categories
export const MemoryCategory = {
  TRAVEL: "travel",
  FAMILY: "family",
  FRIENDS: "friends",
  CELEBRATION: "celebration",
  ACHIEVEMENT: "achievement",
  DAILY_LIFE: "daily_life",
  SPECIAL_EVENT: "special_event",
  OTHER: "other",
} as const;

export type MemoryCategoryType = typeof MemoryCategory[keyof typeof MemoryCategory];

// Reaction types
export const ReactionType = {
  LIKE: "like",
  LOVE: "love",
  WOW: "wow",
  SAD: "sad",
  CELEBRATE: "celebrate",
} as const;

export type ReactionTypeValue = typeof ReactionType[keyof typeof ReactionType];

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default(UserRole.USER),
  status: text("status").notNull().default(UserStatus.ACTIVE),
  fullName: text("full_name"),
  phone: text("phone"),
  gender: text("gender"),
  birthdate: text("birthdate"),
  bio: text("bio"),
  location: text("location"),
  locationAddress: text("location_address"),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const memories = pgTable("memories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull().default(MemoryCategory.OTHER),
  privacy: text("privacy").notNull().default(MemoryPrivacy.PUBLIC),
  location: text("location"),
  locationAddress: text("location_address"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reactions = pgTable("reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  memoryId: varchar("memory_id").references(() => memories.id).notNull(),
  type: text("type").notNull().default(ReactionType.LIKE),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  memoryId: varchar("memory_id").references(() => memories.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").references(() => users.id).notNull(),
  followingId: varchar("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  followerFollowingUnique: unique().on(table.followerId, table.followingId),
}));

export const savedMemories = pgTable("saved_memories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  memoryId: varchar("memory_id").references(() => memories.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userMemoryUnique: unique().on(table.userId, table.memoryId),
}));

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  relatedUserId: varchar("related_user_id").references(() => users.id),
  relatedMemoryId: varchar("related_memory_id").references(() => memories.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").references(() => users.id).notNull(),
  memoryId: varchar("memory_id").references(() => memories.id).notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, reviewed, dismissed
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ContentStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export const MediaType = {
  IMAGE: "image",
  VIDEO: "video",
  NONE: "none",
} as const;

export const LocationCategory = {
  PARK: "park",
  RESTAURANT: "restaurant",
  MUSEUM: "museum",
  LANDMARK: "landmark",
  BEACH: "beach",
  MOUNTAIN: "mountain",
  CITY: "city",
  HISTORICAL_SITE: "historical_site",
  OTHER: "other",
} as const;

export const contents = pgTable("contents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  tags: text("tags").array(),
  mediaUrl: text("media_url"),
  mediaType: text("media_type").notNull().default(MediaType.NONE),
  publishAt: timestamp("publish_at"),
  status: text("status").notNull().default(ContentStatus.DRAFT),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull().unique(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  category: text("category").notNull().default(LocationCategory.OTHER),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const moderationActions = pgTable("moderation_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actionType: text("action_type").notNull(),
  moderatorId: varchar("moderator_id").references(() => users.id).notNull(),
  targetUserId: varchar("target_user_id").references(() => users.id),
  targetMemoryId: varchar("target_memory_id").references(() => memories.id),
  reportId: varchar("report_id").references(() => reports.id),
  reason: text("reason").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notification Management - Admin-created announcements
export const NotificationAudience = {
  ALL_USERS: "all_users",
  CREATORS: "creators",
  ADMINS: "admins",
  SPECIFIC_USERS: "specific_users",
} as const;

export const NotificationChannel = {
  IN_APP: "in_app",
  EMAIL: "email",
  BOTH: "both",
} as const;

export const NotificationDeliveryStatus = {
  SCHEDULED: "scheduled",
  SENT: "sent",
  FAILED: "failed",
} as const;

export const adminNotifications = pgTable("admin_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  audience: text("audience").notNull().default(NotificationAudience.ALL_USERS),
  channel: text("channel").notNull().default(NotificationChannel.IN_APP),
  scheduledFor: timestamp("scheduled_for"),
  status: text("status").notNull().default(NotificationDeliveryStatus.SCHEDULED),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  sentAt: timestamp("sent_at"),
});

// Innovation Management - Idea submission and tracking
export const IdeaStatus = {
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  IMPLEMENTED: "implemented",
} as const;

export const ImpactLevel = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export const innovations = pgTable("innovations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  impact: text("impact").notNull().default(ImpactLevel.MEDIUM),
  owner: varchar("owner").references(() => users.id).notNull(),
  status: text("status").notNull().default(IdeaStatus.SUBMITTED),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
  implementedAt: timestamp("implemented_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas with validation
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum([UserRole.ADMIN, UserRole.USER]).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMemorySchema = createInsertSchema(memories, {
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  category: z.enum([
    MemoryCategory.TRAVEL,
    MemoryCategory.FAMILY,
    MemoryCategory.FRIENDS,
    MemoryCategory.CELEBRATION,
    MemoryCategory.ACHIEVEMENT,
    MemoryCategory.DAILY_LIFE,
    MemoryCategory.SPECIAL_EVENT,
    MemoryCategory.OTHER,
  ]).optional(),
  privacy: z.enum([
    MemoryPrivacy.PUBLIC,
    MemoryPrivacy.PRIVATE,
    MemoryPrivacy.FOLLOWERS_ONLY,
  ]).optional(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReactionSchema = createInsertSchema(reactions, {
  type: z.enum([
    ReactionType.LIKE,
    ReactionType.LOVE,
    ReactionType.WOW,
    ReactionType.SAD,
    ReactionType.CELEBRATE,
  ]).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments, {
  content: z.string().min(1, "Comment cannot be empty").max(1000),
}).omit({
  id: true,
  userId: true,
  memoryId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  followerId: true,
  createdAt: true,
});

export const insertSavedMemorySchema = createInsertSchema(savedMemories).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages, {
  content: z.string().min(1, "Message cannot be empty"),
}).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports, {
  reason: z.string().min(10, "Please provide a detailed reason (minimum 10 characters)"),
}).omit({
  id: true,
  reporterId: true,
  createdAt: true,
  reviewedBy: true,
  reviewedAt: true,
  status: true,
});

export const insertContentSchema = createInsertSchema(contents, {
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).optional(),
  mediaType: z.enum([MediaType.IMAGE, MediaType.VIDEO, MediaType.NONE]).optional(),
  status: z.enum([ContentStatus.DRAFT, ContentStatus.PUBLISHED, ContentStatus.ARCHIVED]).optional(),
  publishAt: z.string().optional(),
}).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocationSchema = createInsertSchema(locations, {
  name: z.string().min(1, "Name is required").max(200),
  address: z.string().min(1, "Address is required"),
  latitude: z.coerce.number()
    .min(-90, "Latitude must be at least -90")
    .max(90, "Latitude must be at most 90")
    .refine((val) => !isNaN(val), "Latitude must be a valid number"),
  longitude: z.coerce.number()
    .min(-180, "Longitude must be at least -180")
    .max(180, "Longitude must be at most 180")
    .refine((val) => !isNaN(val), "Longitude must be a valid number"),
  category: z.enum([
    LocationCategory.PARK,
    LocationCategory.RESTAURANT,
    LocationCategory.MUSEUM,
    LocationCategory.LANDMARK,
    LocationCategory.BEACH,
    LocationCategory.MOUNTAIN,
    LocationCategory.CITY,
    LocationCategory.HISTORICAL_SITE,
    LocationCategory.OTHER,
  ] as const).optional(),
}).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModerationActionSchema = createInsertSchema(moderationActions, {
  actionType: z.enum([
    ModerationActionType.WARN_USER,
    ModerationActionType.BAN_USER,
    ModerationActionType.UNBAN_USER,
    ModerationActionType.APPROVE_REPORT,
    ModerationActionType.DISMISS_REPORT,
    ModerationActionType.REMOVE_CONTENT,
  ]),
  reason: z.string().min(10, "Please provide a detailed reason (minimum 10 characters)"),
}).omit({
  id: true,
  moderatorId: true,
  createdAt: true,
});

export const insertAdminNotificationSchema = createInsertSchema(adminNotifications, {
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  audience: z.enum([
    NotificationAudience.ALL_USERS,
    NotificationAudience.CREATORS,
    NotificationAudience.ADMINS,
    NotificationAudience.SPECIFIC_USERS,
  ] as const).optional(),
  channel: z.enum([
    NotificationChannel.IN_APP,
    NotificationChannel.EMAIL,
    NotificationChannel.BOTH,
  ] as const).optional(),
  scheduledFor: z.string().optional(),
}).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  sentAt: true,
  status: true,
});

export const insertInnovationSchema = createInsertSchema(innovations, {
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  impact: z.enum([
    ImpactLevel.LOW,
    ImpactLevel.MEDIUM,
    ImpactLevel.HIGH,
    ImpactLevel.CRITICAL,
  ] as const).optional(),
}).omit({
  id: true,
  owner: true,
  status: true,
  reviewedBy: true,
  reviewNotes: true,
  reviewedAt: true,
  implementedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Security log action types
export const SecurityActionType = {
  UPDATE_PASSWORD: "update_password",
  UPDATE_EMAIL: "update_email",
  UPDATE_PROFILE: "update_profile",
  LOGIN: "login",
  LOGOUT: "logout",
} as const;

export type SecurityActionTypeValue = typeof SecurityActionType[keyof typeof SecurityActionType];

// Security logs table
export const securityLogs = pgTable("security_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  details: text("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Search customization settings table
export const searchSettings = pgTable("search_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rankingAlgorithm: text("ranking_algorithm").notNull().default("relevance"),
  enabledFilters: text("enabled_filters").array().notNull().default(sql`ARRAY[]::text[]`),
  theme: text("theme").notNull().default("light"),
  accentColor: text("accent_color").notNull().default("#3b82f6"),
  darkModeEnabled: boolean("dark_mode_enabled").notNull().default(false),
  featureFlags: text("feature_flags").array().notNull().default(sql`ARRAY[]::text[]`),
  updatedBy: varchar("updated_by").notNull().references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertSecurityLogSchema = createInsertSchema(securityLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSearchSettingsSchema = createInsertSchema(searchSettings).omit({
  id: true,
  updatedAt: true,
});

// Admin user creation schema (allows setting role and status)
export const adminCreateUserSchema = insertUserSchema.extend({
  role: z.enum([UserRole.ADMIN, UserRole.USER]),
  status: z.enum([UserStatus.ACTIVE, UserStatus.WARNED, UserStatus.BANNED]).optional(),
});

// Login schema for request validation
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Security settings update schemas
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const updateEmailSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required to change email"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, "password">;
export type LoginInput = z.infer<typeof loginSchema>;
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type Memory = typeof memories.$inferSelect;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = typeof reactions.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertSavedMemory = z.infer<typeof insertSavedMemorySchema>;
export type SavedMemory = typeof savedMemories.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof contents.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertModerationAction = z.infer<typeof insertModerationActionSchema>;
export type ModerationAction = typeof moderationActions.$inferSelect;
export type AdminCreateUser = z.infer<typeof adminCreateUserSchema>;
export type InsertAdminNotification = z.infer<typeof insertAdminNotificationSchema>;
export type AdminNotification = typeof adminNotifications.$inferSelect;
export type InsertInnovation = z.infer<typeof insertInnovationSchema>;
export type Innovation = typeof innovations.$inferSelect;
export type InsertSecurityLog = z.infer<typeof insertSecurityLogSchema>;
export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSearchSettings = z.infer<typeof insertSearchSettingsSchema>;
export type SearchSettings = typeof searchSettings.$inferSelect;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
export type UpdateEmail = z.infer<typeof updateEmailSchema>;
