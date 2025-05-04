/**
 * API Request Types for the Habit Tracker Application
 * 
 * These types represent the structure of data sent to API endpoints
 */

/**
 * Request data for creating a new category
 */
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color: string;
}

/**
 * Request data for updating an existing category
 */
export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
}

/**
 * Request data for creating a new habit
 */
export interface CreateHabitRequest {
  name: string;
  description?: string;
  pointsPerCompletion: number;
  categoryId: number;
}

/**
 * Request data for updating an existing habit
 */
export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  pointsPerCompletion?: number;
  categoryId?: number;
}

/**
 * Request data for marking a habit as completed
 */
export interface CompleteHabitRequest {
  habitId: number;
  completionDate: string; // ISO date string
}

/**
 * Request data for using points to maintain a streak
 */
export interface UsePointsRequest {
  habitId: number;
  completionDate: string; // ISO date string
}

/**
 * Request data for adding a note to a habit completion
 */
export interface AddNoteRequest {
  completionId: number;
  content: string;
}