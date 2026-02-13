import { pgTable, text, timestamp, varchar, index, jsonb, integer, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Session storage table for Express sessions
export const sessions = pgTable(
  'sessions',
  {
    sid: varchar('sid').primaryKey(),
    sess: jsonb('sess').notNull(),
    expire: timestamp('expire').notNull(),
  },
  (table) => [index('IDX_session_expire').on(table.expire)]
);

// Users table for authentication
export const users = pgTable('users', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  profileImageUrl: varchar('profile_image_url', { length: 500 }),
  // MFA fields
  mfaEnabled: boolean('mfa_enabled').default(false).notNull(),
  mfaSecret: text('mfa_secret'),
  // Zero-Knowledge fields
  authVerifierHash: text('auth_verifier_hash'), // Hash of auth verifier for ZK authentication
  kdfSalt: text('kdf_salt'), // Salt for key derivation
  publicKey: text('public_key'), // Public key for sharing (optional)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
  accountStatus: varchar('account_status', { length: 50 }).default('active').notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Refresh tokens table for JWT rotation
export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_refresh_tokens_user_id').on(table.userId),
    index('idx_refresh_tokens_token').on(table.token),
    index('idx_refresh_tokens_expires_at').on(table.expiresAt),
  ]
);

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

// Directors Studio - Projects table
export const projects = pgTable(
  'projects',
  {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    title: text('title').notNull(),
    scriptContent: text('script_content'),
    userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // Index for fetching user's projects
    index('idx_projects_user_id').on(table.userId),
    // Index for ordering by creation date
    index('idx_projects_created_at').on(table.createdAt),
    // Composite index for user's projects ordered by date (most common query)
    index('idx_projects_user_created').on(table.userId, table.createdAt),
    // NEW: Composite index for ownership verification (id + userId)
    // Optimizes queries: WHERE id = ? AND user_id = ?
    index('idx_projects_id_user').on(table.id, table.userId),
  ]
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// Directors Studio - Scenes table
export const scenes = pgTable(
  'scenes',
  {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    projectId: varchar('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    sceneNumber: integer('scene_number').notNull(),
    title: text('title').notNull(),
    location: text('location').notNull(),
    timeOfDay: text('time_of_day').notNull(),
    characters: jsonb('characters').notNull().$type<string[]>(),
    description: text('description'),
    shotCount: integer('shot_count').notNull().default(0),
    status: text('status').notNull().default('planned'),
  },
  (table) => [
    // Index for fetching project's scenes
    index('idx_scenes_project_id').on(table.projectId),
    // Composite index for project's scenes ordered by scene number
    index('idx_scenes_project_number').on(table.projectId, table.sceneNumber),
    // NEW: Composite index for scene ownership verification via project
    // Optimizes JOIN queries: scenes JOIN projects ON scenes.project_id = projects.id WHERE scenes.id = ?
    index('idx_scenes_id_project').on(table.id, table.projectId),
    // NEW: Index for filtering scenes by status within a project
    index('idx_scenes_project_status').on(table.projectId, table.status),
  ]
);

export type Scene = typeof scenes.$inferSelect;
export type NewScene = typeof scenes.$inferInsert;

// Directors Studio - Characters table
export const characters = pgTable(
  'characters',
  {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    projectId: varchar('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    appearances: integer('appearances').notNull().default(0),
    consistencyStatus: text('consistency_status').notNull().default('good'),
    lastSeen: text('last_seen'),
    notes: text('notes'),
  },
  (table) => [
    // Index for fetching project's characters
    index('idx_characters_project_id').on(table.projectId),
    // NEW: Composite index for character ownership verification
    // Optimizes JOIN queries: characters JOIN projects WHERE characters.id = ?
    index('idx_characters_id_project').on(table.id, table.projectId),
    // NEW: Index for searching characters by name within a project
    index('idx_characters_project_name').on(table.projectId, table.name),
    // NEW: Index for filtering characters by consistency status
    index('idx_characters_project_consistency').on(table.projectId, table.consistencyStatus),
  ]
);

export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;

// Directors Studio - Shots table
export const shots = pgTable(
  'shots',
  {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    sceneId: varchar('scene_id').notNull().references(() => scenes.id, { onDelete: 'cascade' }),
    shotNumber: integer('shot_number').notNull(),
    shotType: text('shot_type').notNull(),
    cameraAngle: text('camera_angle').notNull(),
    cameraMovement: text('camera_movement').notNull(),
    lighting: text('lighting').notNull(),
    aiSuggestion: text('ai_suggestion'),
  },
  (table) => [
    // Index for fetching scene's shots
    index('idx_shots_scene_id').on(table.sceneId),
    // Composite index for scene's shots ordered by shot number
    index('idx_shots_scene_number').on(table.sceneId, table.shotNumber),
    // NEW: Composite index for shot ownership verification via scene
    // Optimizes multi-table JOIN: shots JOIN scenes JOIN projects WHERE shots.id = ?
    index('idx_shots_id_scene').on(table.id, table.sceneId),
    // NEW: Index for filtering shots by type within a scene
    index('idx_shots_scene_type').on(table.sceneId, table.shotType),
  ]
);

export type Shot = typeof shots.$inferSelect;
export type NewShot = typeof shots.$inferInsert;

// Re-export Zero-Knowledge schema
export * from './zkSchema';
