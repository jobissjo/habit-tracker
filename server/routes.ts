import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { format, parseISO, subDays, isAfter, addDays } from "date-fns";
import { 
  categoryInsertSchema, 
  habitInsertSchema, 
  noteInsertSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = '/api';

  // Get current user with points
  app.get(`${apiPrefix}/user`, async (req, res) => {
    try {
      // For demo purposes, assume user 1 is logged in
      const user = await storage.getUserById(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Category routes
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      // For demo purposes, assume user 1 is logged in
      const categories = await storage.getCategoriesByUserId(1);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const validatedData = categoryInsertSchema.parse({
        ...req.body,
        userId: 1 // For demo purposes, assume user 1 is logged in
      });
      
      const newCategory = await storage.createCategory(validatedData);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Habit routes
  app.get(`${apiPrefix}/habits`, async (req, res) => {
    try {
      // For demo purposes, assume user 1 is logged in
      const userId = 1;
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      
      const habits = await storage.getHabitsByUserId(userId, categoryId);
      
      // For each habit, calculate streak data
      const habitsWithStreaks = await Promise.all(habits.map(async (habit) => {
        const streakData = await storage.getHabitStreakData(habit.id);
        const currentStreak = calculateCurrentStreak(streakData);
        
        return {
          ...habit,
          streakData,
          currentStreak
        };
      }));
      
      res.json(habitsWithStreaks);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/habits`, async (req, res) => {
    try {
      const validatedData = habitInsertSchema.parse({
        ...req.body,
        userId: 1 // For demo purposes, assume user 1 is logged in
      });
      
      const newHabit = await storage.createHabit(validatedData);
      res.status(201).json(newHabit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating habit:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(`${apiPrefix}/habits/:id`, async (req, res) => {
    try {
      const habitId = Number(req.params.id);
      const userId = 1; // For demo purposes, assume user 1 is logged in
      
      // Check if habit exists and belongs to user
      const existingHabit = await storage.getHabitById(habitId);
      if (!existingHabit || existingHabit.userId !== userId) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Validate and update
      const updatedHabit = await storage.updateHabit(habitId, req.body);
      res.json(updatedHabit);
    } catch (error) {
      console.error("Error updating habit:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(`${apiPrefix}/habits/:id`, async (req, res) => {
    try {
      const habitId = Number(req.params.id);
      const userId = 1; // For demo purposes, assume user 1 is logged in
      
      // Check if habit exists and belongs to user
      const existingHabit = await storage.getHabitById(habitId);
      if (!existingHabit || existingHabit.userId !== userId) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      await storage.deleteHabit(habitId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting habit:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Completions routes
  app.post(`${apiPrefix}/completions`, async (req, res) => {
    try {
      const userId = 1; // For demo purposes, assume user 1 is logged in
      const { habitId, completionDate } = req.body;
      
      if (!habitId || !completionDate) {
        return res.status(400).json({ message: "habitId and completionDate are required" });
      }
      
      // Check if habit exists and belongs to user
      const habit = await storage.getHabitById(habitId);
      if (!habit || habit.userId !== userId) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Parse and validate date
      const parsedDate = parseISO(completionDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      // Check if completion already exists
      const existingCompletion = await storage.getCompletion(habitId, completionDate);
      if (existingCompletion) {
        return res.status(400).json({ message: "Habit already completed for this date" });
      }
      
      // Create completion and award points
      const completion = await storage.createCompletion({
        habitId,
        userId,
        completionDate: parsedDate,
        isPointRedeemed: false,
        points: habit.pointsPerCompletion
      });
      
      // Update user points
      await storage.updateUserPoints(userId, habit.pointsPerCompletion);
      
      res.status(201).json(completion);
    } catch (error) {
      console.error("Error creating completion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Use points route
  app.post(`${apiPrefix}/points/use`, async (req, res) => {
    try {
      const userId = 1; // For demo purposes, assume user 1 is logged in
      const { habitId, completionDate } = req.body;
      
      if (!habitId || !completionDate) {
        return res.status(400).json({ message: "habitId and completionDate are required" });
      }
      
      // Check if habit exists and belongs to user
      const habit = await storage.getHabitById(habitId);
      if (!habit || habit.userId !== userId) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Parse and validate date
      const parsedDate = parseISO(completionDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      // Calculate points needed based on how old the date is
      const today = new Date();
      const daysAgo = Math.floor((today.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
      const baseCost = habit.pointsPerCompletion * 5;
      const additionalCost = daysAgo > 1 ? (daysAgo - 1) * 10 : 0;
      const pointsNeeded = baseCost + additionalCost;
      
      // Check if user has enough points
      const user = await storage.getUserById(userId);
      if (!user || user.points < pointsNeeded) {
        return res.status(400).json({ message: "Not enough points" });
      }
      
      // Check if completion already exists
      const existingCompletion = await storage.getCompletion(habitId, completionDate);
      if (existingCompletion) {
        return res.status(400).json({ message: "Habit already completed for this date" });
      }
      
      // Create completion with isPointRedeemed flag
      const completion = await storage.createCompletion({
        habitId,
        userId,
        completionDate: parsedDate,
        isPointRedeemed: true,
        points: 0 // No points earned for redeemed completions
      });
      
      // Deduct points from user
      await storage.updateUserPoints(userId, -pointsNeeded);
      
      res.status(201).json(completion);
    } catch (error) {
      console.error("Error using points:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notes routes
  app.post(`${apiPrefix}/notes`, async (req, res) => {
    try {
      const { completionId, content } = req.body;
      
      if (!completionId || !content) {
        return res.status(400).json({ message: "completionId and content are required" });
      }
      
      // Check if completion exists
      const completion = await storage.getCompletionById(completionId);
      if (!completion) {
        return res.status(404).json({ message: "Completion not found" });
      }
      
      // Validate and create note
      const validatedData = noteInsertSchema.parse({
        completionId,
        content
      });
      
      const newNote = await storage.createNote(validatedData);
      res.status(201).json(newNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Helper function to calculate current streak
  function calculateCurrentStreak(streakData: any[]): number {
    if (!streakData || streakData.length === 0) return 0;
    
    // Sort by date in descending order (newest first)
    const sortedData = [...streakData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Get today's date and yesterday
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
    
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
    let currentDate = todayCompleted ? today : new Date(yesterdayStr);
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayData = sortedData.find(day => day.date === dateStr);
      
      if (dayData && (dayData.isCompleted || dayData.isPointRedeemed)) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  const httpServer = createServer(app);
  return httpServer;
}
