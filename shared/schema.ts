import { pgTable, text, serial, integer, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  points: integer("points").default(0).notNull(),
});

// Category table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Habit table
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  pointsPerCompletion: integer("points_per_completion").default(10).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Completions table to track daily completions
export const completions = pgTable("completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").references(() => habits.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  completionDate: date("completion_date").notNull(),
  isPointRedeemed: boolean("is_point_redeemed").default(false).notNull(),
  points: integer("points").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Notes for habit completions
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  completionId: integer("completion_id").references(() => completions.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  habits: many(habits),
  categories: many(categories),
  completions: many(completions)
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  habits: many(habits)
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  category: one(categories, { fields: [habits.categoryId], references: [categories.id] }),
  user: one(users, { fields: [habits.userId], references: [users.id] }),
  completions: many(completions)
}));

export const completionsRelations = relations(completions, ({ one, many }) => ({
  habit: one(habits, { fields: [completions.habitId], references: [habits.id] }),
  user: one(users, { fields: [completions.userId], references: [users.id] }),
  notes: many(notes)
}));

export const notesRelations = relations(notes, ({ one }) => ({
  completion: one(completions, { fields: [notes.completionId], references: [completions.id] })
}));

// Validation schemas
export const userInsertSchema = createInsertSchema(users);
export const categoryInsertSchema = createInsertSchema(categories, {
  name: (schema) => schema.min(1, "Category name is required"),
  color: (schema) => schema.min(1, "Color is required")
});
export const habitInsertSchema = createInsertSchema(habits, {
  name: (schema) => schema.min(1, "Habit name is required"),
  pointsPerCompletion: (schema) => schema.positive("Points must be positive")
});
export const completionInsertSchema = createInsertSchema(completions);
export const noteInsertSchema = createInsertSchema(notes, {
  content: (schema) => schema.min(1, "Note content cannot be empty")
});

// Types
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type Completion = typeof completions.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type UserInsert = z.infer<typeof userInsertSchema>;
export type CategoryInsert = z.infer<typeof categoryInsertSchema>;
export type HabitInsert = z.infer<typeof habitInsertSchema>;
export type CompletionInsert = z.infer<typeof completionInsertSchema>;
export type NoteInsert = z.infer<typeof noteInsertSchema>;
