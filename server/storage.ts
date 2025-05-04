import { db } from "@db";
import { eq, and, desc, lt, gte } from "drizzle-orm";
import { format, subDays } from "date-fns";
import * as schema from "@shared/schema";
import { StreakDay } from "@shared/types";

// User operations
export const getUserById = async (id: number) => {
  const result = await db.query.users.findFirst({
    where: eq(schema.users.id, id),
  });
  return result;
};

export const updateUserPoints = async (userId: number, pointsDelta: number) => {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");
  
  const newPoints = Math.max(0, user.points + pointsDelta);
  
  const [updatedUser] = await db
    .update(schema.users)
    .set({ points: newPoints })
    .where(eq(schema.users.id, userId))
    .returning();
  
  return updatedUser;
};

// Category operations
export const getCategoriesByUserId = async (userId: number) => {
  const categories = await db.query.categories.findMany({
    where: eq(schema.categories.userId, userId),
    orderBy: desc(schema.categories.createdAt),
  });
  return categories;
};

export const createCategory = async (data: schema.CategoryInsert) => {
  const [category] = await db.insert(schema.categories).values(data).returning();
  return category;
};

// Habit operations
export const getHabitById = async (id: number) => {
  const habit = await db.query.habits.findFirst({
    where: eq(schema.habits.id, id),
    with: {
      category: true,
    }
  });
  return habit;
};

export const getHabitsByUserId = async (userId: number, categoryId?: number) => {
  let query = db.query.habits.findMany({
    where: eq(schema.habits.userId, userId),
    with: {
      category: true,
    },
    orderBy: [desc(schema.habits.createdAt)],
  });
  
  if (categoryId) {
    query = db.query.habits.findMany({
      where: and(
        eq(schema.habits.userId, userId),
        eq(schema.habits.categoryId, categoryId)
      ),
      with: {
        category: true,
      },
      orderBy: [desc(schema.habits.createdAt)],
    });
  }
  
  const habits = await query;
  return habits;
};

export const createHabit = async (data: schema.HabitInsert) => {
  const [habit] = await db.insert(schema.habits).values(data).returning();
  return habit;
};

export const updateHabit = async (habitId: number, data: Partial<schema.HabitInsert>) => {
  const [habit] = await db
    .update(schema.habits)
    .set(data)
    .where(eq(schema.habits.id, habitId))
    .returning();
  
  return habit;
};

export const deleteHabit = async (habitId: number) => {
  // Delete all related completions and notes first
  const completions = await db.query.completions.findMany({
    where: eq(schema.completions.habitId, habitId),
    with: {
      notes: true,
    },
  });
  
  // Delete notes for each completion
  for (const completion of completions) {
    if (completion.notes && completion.notes.length > 0) {
      await db.delete(schema.notes).where(
        eq(schema.notes.completionId, completion.id)
      );
    }
  }
  
  // Delete completions
  await db.delete(schema.completions).where(
    eq(schema.completions.habitId, habitId)
  );
  
  // Delete the habit
  await db.delete(schema.habits).where(
    eq(schema.habits.id, habitId)
  );
  
  return true;
};

// Completion operations
export const getCompletionById = async (id: number) => {
  const completion = await db.query.completions.findFirst({
    where: eq(schema.completions.id, id),
    with: {
      notes: true,
    },
  });
  return completion;
};

export const getCompletion = async (habitId: number, date: string) => {
  const completion = await db.query.completions.findFirst({
    where: and(
      eq(schema.completions.habitId, habitId),
      eq(schema.completions.completionDate, new Date(date))
    ),
    with: {
      notes: true,
    },
  });
  return completion;
};

export const createCompletion = async (data: schema.CompletionInsert) => {
  const [completion] = await db.insert(schema.completions).values(data).returning();
  return completion;
};

// Streak data operations
export const getHabitStreakData = async (habitId: number, days = 30): Promise<StreakDay[]> => {
  const today = new Date();
  const startDate = subDays(today, days);
  
  // Get all completions for this habit in date range
  const completions = await db.query.completions.findMany({
    where: and(
      eq(schema.completions.habitId, habitId),
      gte(schema.completions.completionDate, startDate)
    ),
  });
  
  // Create an array of dates for the last N days
  const streakData: StreakDay[] = [];
  for (let i = 0; i < days; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Find if this date has a completion
    const completion = completions.find(c => 
      format(c.completionDate, 'yyyy-MM-dd') === dateStr
    );
    
    streakData.push({
      date: dateStr,
      isCompleted: completion ? !completion.isPointRedeemed : false,
      isPointRedeemed: completion ? completion.isPointRedeemed : false,
    });
  }
  
  // Sort by date ascending
  return streakData.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

// Note operations
export const createNote = async (data: schema.NoteInsert) => {
  const [note] = await db.insert(schema.notes).values(data).returning();
  return note;
};

export const storage = {
  getUserById,
  updateUserPoints,
  getCategoriesByUserId,
  createCategory,
  getHabitById,
  getHabitsByUserId,
  createHabit,
  updateHabit,
  deleteHabit,
  getCompletionById,
  getCompletion,
  createCompletion,
  getHabitStreakData,
  createNote,
};
