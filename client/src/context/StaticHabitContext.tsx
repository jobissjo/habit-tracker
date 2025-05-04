import React, { createContext, useState, useContext, ReactNode } from 'react';
import { format } from 'date-fns';
import { habits as initialHabits, categories as initialCategories, currentUser } from '../data/staticData';
import { 
  UserResponse, 
  CategoryResponse, 
  HabitResponse,
  CompletionResponse,
  StreakDay
} from '../types/apiResponseTypes';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateHabitRequest,
  UpdateHabitRequest,
  CompleteHabitRequest,
  UsePointsRequest,
  AddNoteRequest
} from '../types/apiRequestTypes';

interface StaticHabitContextType {
  // User data
  user: UserResponse | null;
  categories: CategoryResponse[];
  habits: HabitResponse[];
  selectedCategoryId: number | null;
  
  // Data loading states
  isLoading: boolean;
  
  // Actions
  selectCategory: (categoryId: number | null) => void;
  createCategory: (data: CreateCategoryRequest) => Promise<void>;
  createHabit: (data: CreateHabitRequest) => Promise<void>;
  updateHabit: (id: number, data: UpdateHabitRequest) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
  completeHabit: (data: CompleteHabitRequest) => Promise<void>;
  usePoints: (data: UsePointsRequest) => Promise<void>;
  addNote: (data: AddNoteRequest) => Promise<void>;
}

const StaticHabitContext = createContext<StaticHabitContextType | undefined>(undefined);

export const StaticHabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [user, setUser] = useState<UserResponse>(currentUser);
  const [categories, setCategories] = useState<CategoryResponse[]>(initialCategories);
  const [habits, setHabits] = useState<HabitResponse[]>(initialHabits);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Helper function to simulate API delay
  const simulateDelay = async () => {
    return new Promise(resolve => setTimeout(resolve, 500));
  };

  // Helper function to generate a new ID
  const generateId = (collection: Array<any>): number => {
    return Math.max(0, ...collection.map(item => item.id)) + 1;
  };

  // Select category filter
  const selectCategory = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  };

  // Create a new category
  const createCategory = async (data: CreateCategoryRequest) => {
    setIsLoading(true);
    await simulateDelay();

    const newCategory: CategoryResponse = {
      id: generateId(categories),
      name: data.name,
      description: data.description || null,
      color: data.color,
      userId: user ? user.id : 1,
      createdAt: new Date().toISOString()
    };

    setCategories(prev => [...prev, newCategory]);
    setIsLoading(false);
  };

  // Create a new habit
  const createHabit = async (data: CreateHabitRequest) => {
    setIsLoading(true);
    await simulateDelay();

    const newHabit: HabitResponse = {
      id: generateId(habits),
      name: data.name,
      description: data.description || null,
      pointsPerCompletion: data.pointsPerCompletion,
      categoryId: data.categoryId,
      userId: user ? user.id : 1,
      createdAt: new Date().toISOString(),
      category: categories.find(c => c.id === data.categoryId),
      streakData: [],
      currentStreak: 0
    };

    setHabits(prev => [...prev, newHabit]);
    setIsLoading(false);
  };

  // Update an existing habit
  const updateHabit = async (id: number, data: UpdateHabitRequest) => {
    setIsLoading(true);
    await simulateDelay();

    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const categoryId = data.categoryId || habit.categoryId;
        return {
          ...habit,
          name: data.name || habit.name,
          description: data.description === undefined ? habit.description : data.description,
          pointsPerCompletion: data.pointsPerCompletion || habit.pointsPerCompletion,
          categoryId,
          category: categories.find(c => c.id === categoryId) || habit.category
        };
      }
      return habit;
    }));

    setIsLoading(false);
  };

  // Delete a habit
  const deleteHabit = async (id: number) => {
    setIsLoading(true);
    await simulateDelay();

    setHabits(prev => prev.filter(habit => habit.id !== id));
    setIsLoading(false);
  };

  // Complete a habit for today
  const completeHabit = async (data: CompleteHabitRequest) => {
    setIsLoading(true);
    await simulateDelay();

    const { habitId, completionDate } = data;
    const habitToUpdate = habits.find(h => h.id === habitId);
    
    if (!habitToUpdate) {
      setIsLoading(false);
      return;
    }

    // Update the habit's streak data
    const updatedStreakData = [...(habitToUpdate.streakData || [])];
    const existingDayIndex = updatedStreakData.findIndex(day => day.date === completionDate);
    
    if (existingDayIndex >= 0) {
      // Update existing day
      updatedStreakData[existingDayIndex].isCompleted = true;
    } else {
      // Add new day
      updatedStreakData.push({
        date: completionDate,
        isCompleted: true,
        isPointRedeemed: false
      });
      
      // Sort by date
      updatedStreakData.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    // Recalculate current streak
    const currentStreak = calculateCurrentStreak(updatedStreakData);

    // Update habit
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          streakData: updatedStreakData,
          currentStreak
        };
      }
      return habit;
    }));

    // Award points to user
    if (user) {
      setUser({
        ...user,
        points: user.points + habitToUpdate.pointsPerCompletion
      });
    }

    setIsLoading(false);
  };

  // Use points to maintain streak
  const usePoints = async (data: UsePointsRequest) => {
    setIsLoading(true);
    await simulateDelay();

    const { habitId, completionDate } = data;
    const habitToUpdate = habits.find(h => h.id === habitId);
    
    if (!habitToUpdate || !user) {
      setIsLoading(false);
      return;
    }

    // Calculate points needed
    const daysAgo = Math.floor(
      (new Date().getTime() - new Date(completionDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const baseCost = habitToUpdate.pointsPerCompletion * 5;
    const additionalCost = daysAgo > 1 ? (daysAgo - 1) * 10 : 0;
    const pointsNeeded = baseCost + additionalCost;

    // Check if user has enough points
    if (user.points < pointsNeeded) {
      setIsLoading(false);
      return;
    }

    // Update the habit's streak data
    const updatedStreakData = [...(habitToUpdate.streakData || [])];
    const existingDayIndex = updatedStreakData.findIndex(day => day.date === completionDate);
    
    if (existingDayIndex >= 0) {
      // Update existing day
      updatedStreakData[existingDayIndex].isPointRedeemed = true;
    } else {
      // Add new day
      updatedStreakData.push({
        date: completionDate,
        isCompleted: false,
        isPointRedeemed: true
      });
      
      // Sort by date
      updatedStreakData.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    // Recalculate current streak
    const currentStreak = calculateCurrentStreak(updatedStreakData);

    // Update habit
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          streakData: updatedStreakData,
          currentStreak
        };
      }
      return habit;
    }));

    // Deduct points from user
    setUser({
      ...user,
      points: user.points - pointsNeeded
    });

    setIsLoading(false);
  };

  // Add a note to a completion
  const addNote = async (data: AddNoteRequest) => {
    // In a static implementation, we'll skip this since we don't track completions separately
    await simulateDelay();
    return;
  };

  // Helper function to calculate current streak
  const calculateCurrentStreak = (streakData: StreakDay[]): number => {
    if (!streakData || streakData.length === 0) return 0;
    
    // Sort by date in descending order (newest first)
    const sortedData = [...streakData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Get today's date and yesterday
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(new Date(today.setDate(today.getDate() - 1)), 'yyyy-MM-dd');
    
    // Check if today or yesterday is completed to continue the streak
    const todayCompleted = sortedData.find(day => 
      day.date === todayStr && (day.isCompleted || day.isPointRedeemed)
    );
    
    const yesterdayCompleted = sortedData.find(day => 
      day.date === yesterdayStr && (day.isCompleted || day.isPointRedeemed)
    );
    
    // If neither today nor yesterday is completed, streak is broken
    if (!todayCompleted && !yesterdayCompleted) return 0;
    
    // Count consecutive days
    let streak = 0;
    let currentDate = todayCompleted ? new Date() : new Date(yesterdayStr);
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayData = sortedData.find(day => day.date === dateStr);
      
      if (dayData && (dayData.isCompleted || dayData.isPointRedeemed)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Context value
  const value: StaticHabitContextType = {
    user,
    categories,
    habits: selectedCategoryId 
      ? habits.filter(h => h.categoryId === selectedCategoryId)
      : habits,
    selectedCategoryId,
    isLoading,
    selectCategory,
    createCategory,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    usePoints,
    addNote
  };

  return (
    <StaticHabitContext.Provider value={value}>
      {children}
    </StaticHabitContext.Provider>
  );
};

export const useStaticHabit = () => {
  const context = useContext(StaticHabitContext);
  if (context === undefined) {
    throw new Error('useStaticHabit must be used within a StaticHabitProvider');
  }
  return context;
};