// API Request types
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  pointsPerCompletion: number;
  categoryId: number;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  pointsPerCompletion?: number;
  categoryId?: number;
}

export interface CompleteHabitRequest {
  habitId: number;
  completionDate: string; // ISO date string
}

export interface UsePointsRequest {
  habitId: number;
  completionDate: string; // ISO date string
}

export interface AddNoteRequest {
  completionId: number;
  content: string;
}

// API Response types
export interface UserResponse {
  id: number;
  username: string;
  points: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
  color: string;
  userId: number;
  createdAt: string;
}

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

export interface NoteResponse {
  id: number;
  completionId: number;
  content: string;
  createdAt: string;
}

export interface StreakDay {
  date: string;
  isCompleted: boolean;
  isPointRedeemed: boolean;
}

export interface StatsResponse {
  totalHabits: number;
  totalCompletions: number;
  longestStreak: number;
  totalPoints: number;
}
