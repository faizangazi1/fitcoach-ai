import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Users table - fitness app users
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  age: integer('age'),
  heightInches: integer('height_inches'),
  weightLbs: real('weight_lbs'),
  primaryGoal: text('primary_goal'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Workouts table - workout sessions
export const workouts = sqliteTable('workouts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  workoutType: text('workout_type').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  caloriesBurned: integer('calories_burned'),
  date: text('date').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Exercises table - individual exercises within workouts
export const exercises = sqliteTable('exercises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workoutId: integer('workout_id').references(() => workouts.id),
  name: text('name').notNull(),
  sets: integer('sets'),
  reps: integer('reps'),
  weightLbs: real('weight_lbs'),
  createdAt: text('created_at').notNull(),
});

// Goals table - user fitness goals
export const goals = sqliteTable('goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  target: real('target').notNull(),
  current: real('current').notNull(),
  unit: text('unit').notNull(),
  deadline: text('deadline'),
  category: text('category').notNull(),
  status: text('status').notNull().default('in_progress'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Wearable devices table
export const wearableDevices = sqliteTable('wearable_devices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  deviceName: text('device_name').notNull(),
  deviceType: text('device_type').notNull(),
  status: text('status').notNull().default('connected'),
  lastSync: text('last_sync'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Community posts table
export const communityPosts = sqliteTable('community_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  authorName: text('author_name').notNull(),
  authorAvatar: text('author_avatar'),
  content: text('content').notNull(),
  category: text('category').notNull(),
  likes: integer('likes').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Challenges table
export const challenges = sqliteTable('challenges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  participantsCount: integer('participants_count').default(0),
  daysLeft: integer('days_left').notNull(),
  reward: text('reward'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Leaderboard table
export const leaderboard = sqliteTable('leaderboard', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  userName: text('user_name').notNull(),
  userAvatar: text('user_avatar'),
  points: integer('points').notNull().default(0),
  rank: integer('rank').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Weight history table
export const weightHistory = sqliteTable('weight_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  weightLbs: real('weight_lbs').notNull(),
  recordedDate: text('recorded_date').notNull(),
  createdAt: text('created_at').notNull(),
});

// Stats overview table
export const statsOverview = sqliteTable('stats_overview', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  totalWorkouts: integer('total_workouts').default(0),
  caloriesBurned: integer('calories_burned').default(0),
  activeDays: integer('active_days').default(0),
  goalsAchieved: integer('goals_achieved').default(0),
  goalsTotal: integer('goals_total').default(0),
  lastUpdated: text('last_updated').notNull(),
});