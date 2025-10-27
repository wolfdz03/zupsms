import { pgTable, uuid, text, boolean, timestamp, integer, time, pgEnum } from "drizzle-orm/pg-core";

// Day of week enum
export const dayOfWeekEnum = pgEnum("day_of_week", [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
]);

// Users table for coordinators
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tutors table
export const tutors = pgTable("tutors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Students table
export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  tutorId: uuid("tutor_id").references(() => tutors.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Settings table
export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  smsOffsetMinutes: integer("sms_offset_minutes").default(15).notNull(),
  smsTemplate: text("sms_template")
    .default("97775950-fe78-4b1b-98cd-13646067b704") // Sweego template ID
    .notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SMS logs table (optional but useful for tracking)
export const smsLogs = pgTable("sms_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(), // 'sent', 'failed', etc.
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// Message templates table
export const messageTemplates = pgTable("message_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type Tutor = typeof tutors.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type SmsLog = typeof smsLogs.$inferSelect;
export type MessageTemplate = typeof messageTemplates.$inferSelect;

