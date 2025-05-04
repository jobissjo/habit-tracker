import { db } from "./index";
import * as schema from "@shared/schema";
import { createHash } from "crypto";
import { format, subDays } from "date-fns";

async function seed() {
  try {
    console.log("Seeding database...");

    // Create test user if it doesn't exist
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "testuser"),
    });

    let userId = existingUser?.id;

    if (!existingUser) {
      // Create a simple password hash
      const passwordHash = createHash('sha256').update("password123").digest('hex');
      
      const [user] = await db.insert(schema.users).values({
        username: "testuser",
        password: passwordHash,
        points: 250
      }).returning();
      
      userId = user.id;
      console.log("Created test user with ID:", userId);
    } else {
      console.log("Using existing user with ID:", userId);
    }

    // Create categories if they don't exist
    const categories = [
      { name: "Health", description: "Track your health-related habits", color: "#6366f1" },
      { name: "Learning", description: "Track your learning progress and keep up with coding challenges", color: "#8b5cf6" },
      { name: "Productivity", description: "Track work and productivity habits", color: "#10b981" },
      { name: "Fitness", description: "Track exercise and fitness activities", color: "#f59e0b" }
    ];

    const existingCategories = await db.query.categories.findMany({
      where: (cats, { eq }) => eq(cats.userId, userId!),
    });

    const categoryMap = new Map();
    
    for (const category of categories) {
      const exists = existingCategories.find(c => c.name === category.name);
      
      if (!exists) {
        const [newCategory] = await db.insert(schema.categories).values({
          ...category,
          userId: userId!
        }).returning();
        
        categoryMap.set(category.name, newCategory.id);
        console.log(`Created category: ${category.name} with ID: ${newCategory.id}`);
      } else {
        categoryMap.set(category.name, exists.id);
        console.log(`Using existing category: ${category.name} with ID: ${exists.id}`);
      }
    }

    // Create sample habits if they don't exist
    const habits = [
      { 
        name: "Solve one LeetCode problem", 
        description: "Improve algorithm problem-solving skills daily", 
        pointsPerCompletion: 10, 
        categoryId: categoryMap.get("Learning") 
      },
      { 
        name: "Read technical article", 
        description: "Stay updated with the latest tech trends", 
        pointsPerCompletion: 5, 
        categoryId: categoryMap.get("Learning") 
      },
      { 
        name: "Code review contributions", 
        description: "Review pull requests and give feedback to peers", 
        pointsPerCompletion: 15, 
        categoryId: categoryMap.get("Learning") 
      }
    ];

    const existingHabits = await db.query.habits.findMany({
      where: (h, { eq }) => eq(h.userId, userId!),
    });

    // Create habits and seed completions
    for (const habit of habits) {
      const exists = existingHabits.find(h => h.name === habit.name);
      
      let habitId: number;
      
      if (!exists) {
        const [newHabit] = await db.insert(schema.habits).values({
          ...habit,
          userId: userId!
        }).returning();
        
        habitId = newHabit.id;
        console.log(`Created habit: ${habit.name} with ID: ${habitId}`);
      } else {
        habitId = exists.id;
        console.log(`Using existing habit: ${habit.name} with ID: ${habitId}`);
      }
      
      // Get existing completions
      const existingCompletions = await db.query.completions.findMany({
        where: (c, { eq }) => eq(c.habitId, habitId),
      });
      
      // Seed some completions if needed (for LeetCode habit)
      if (habit.name === "Solve one LeetCode problem" && existingCompletions.length === 0) {
        const today = new Date();
        // Create completions for the past 30 days with some gaps
        for (let i = 1; i <= 30; i++) {
          const date = subDays(today, i);
          
          // Skip some days (day 1, 16, 17)
          if (i === 1 || i === 16 || i === 17) continue;
          
          // Add point redeemed day on day 8
          const isPointRedeemed = i === 8;
          
          await db.insert(schema.completions).values({
            habitId,
            userId: userId!,
            completionDate: date,
            isPointRedeemed,
            points: isPointRedeemed ? 0 : habit.pointsPerCompletion
          });
        }
        console.log(`Created sample completions for habit: ${habit.name}`);
      }
      
      // Seed completions for "Read technical article"
      if (habit.name === "Read technical article" && existingCompletions.length === 0) {
        const today = new Date();
        // Pattern with more gaps
        for (let i = 1; i <= 30; i++) {
          const date = subDays(today, i);
          
          // More random pattern with more gaps
          if (i === 0 || i === 3 || i === 4 || i === 10 || i === 11 || i === 18 || i === 29) continue;
          
          // Add point redeemed day on day 12
          const isPointRedeemed = i === 12;
          
          await db.insert(schema.completions).values({
            habitId,
            userId: userId!,
            completionDate: date,
            isPointRedeemed,
            points: isPointRedeemed ? 0 : habit.pointsPerCompletion
          });
        }
        
        // Add completed for today
        const todayCompletion = await db.insert(schema.completions).values({
          habitId,
          userId: userId!,
          completionDate: new Date(),
          isPointRedeemed: false,
          points: habit.pointsPerCompletion
        }).returning();
        
        // Add a note for today's completion
        await db.insert(schema.notes).values({
          completionId: todayCompletion[0].id,
          content: "Read an article about React Server Components and how they change the rendering model."
        });
        
        console.log(`Created sample completions for habit: ${habit.name}`);
      }
      
      // Seed completions for "Code review contributions"
      if (habit.name === "Code review contributions" && existingCompletions.length === 0) {
        const today = new Date();
        // Only recent activity
        for (let i = 1; i <= 30; i++) {
          const date = subDays(today, i);
          
          // Only completions in the last 8 days
          if (i > 8) continue;
          
          await db.insert(schema.completions).values({
            habitId,
            userId: userId!,
            completionDate: date,
            isPointRedeemed: false,
            points: habit.pointsPerCompletion
          });
        }
        console.log(`Created sample completions for habit: ${habit.name}`);
      }
    }

    console.log("Database seeding completed.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
