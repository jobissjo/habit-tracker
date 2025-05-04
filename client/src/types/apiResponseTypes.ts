/**
 * API Response Types for the Habit Tracker Application
 * 
 * These types represent the structure of data received from API endpoints
 */

/**
 * User information response
 */
export interface UserResponse {
  id: number;
  username: string;
  points: number;
}

/**
 * Category information response
 */
export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
  color: string;
  userId: number;
  createdAt: string;
}

/**
 * Note attached to a habit completion
 */
export interface NoteResponse {
  id: number;
  completionId: number;
  content: string;
  createdAt: string;
}

/**
 * Represents a single day in streak data visualization
 */
export interface StreakDay {
  id?: number;
  date: string;
  isCompleted: boolean;
  isPointRedeemed: boolean;
  notes?: NoteResponse[];
}

/**
 * A completion record for a habit
 */
export interface CompletionResponse {
  id: number;
  habitId: number;
  userId: number;
  completionDate: string;
  isPointRedeemed: boolean;
  points: number;
  createdAt: string;
  notes?: NoteResponse[];
}

/**
 * Habit information with relationship data
 */
export interface HabitResponse {
  id: number;
  name: string;
  description: string | null;
  pointsPerCompletion: number;
  categoryId: number;
  userId: number;
  createdAt: string;
  category?: CategoryResponse;
  streakData?: StreakDay[];
  currentStreak?: number;
}

/**
 * User statistics data
 */
export interface StatsResponse {
  totalHabits: number;
  totalCompletions: number;
  longestStreak: number;
  totalPoints: number;
}