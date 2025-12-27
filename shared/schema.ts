import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // In a real app, hash this!
  role: text("role", { enum: ["super_admin", "admin", "renter"] }).notNull().default("renter"),
  balanceMinutes: integer("balance_minutes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pcs = pgTable("pcs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ipAddress: text("ip_address"),
  macAddress: text("mac_address"),
  status: text("status", { enum: ["online", "offline", "in_session"] }).notNull().default("offline"),
  lastPing: timestamp("last_ping"),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Should be FK to users
  pcId: integer("pc_id").notNull(), // Should be FK to pcs
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  assignedMinutes: integer("assigned_minutes").notNull(),
  status: text("status", { enum: ["active", "completed"] }).notNull().default("active"),
});

export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPcSchema = createInsertSchema(pcs).omit({ id: true, lastPing: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, startTime: true, endTime: true });
export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({ id: true, createdAt: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Pc = typeof pcs.$inferSelect;
export type InsertPc = z.infer<typeof insertPcSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
