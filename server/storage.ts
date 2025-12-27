import { db } from "./db";
import {
  users, pcs, sessions, adminLogs,
  type User, type InsertUser,
  type Pc, type InsertPc,
  type Session, type InsertSession,
  type AdminLog, type InsertAdminLog
} from "@shared/schema";
import { eq, and, desc, isNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // PCs
  getPc(id: number): Promise<Pc | undefined>;
  getPcs(): Promise<Pc[]>;
  createPc(pc: InsertPc): Promise<Pc>;
  updatePc(id: number, pc: Partial<InsertPc>): Promise<Pc>;
  deletePc(id: number): Promise<void>;

  // Sessions
  getSession(id: number): Promise<Session | undefined>;
  getSessions(filters?: { active?: boolean, pcId?: number, userId?: number }): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  endSession(id: number): Promise<Session>;
  getActiveSessionForPc(pcId: number): Promise<Session | undefined>;
  
  // Stats
  getStats(): Promise<{ totalUsers: number, totalPcs: number, activeSessions: number }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // PCs
  async getPc(id: number): Promise<Pc | undefined> {
    const [pc] = await db.select().from(pcs).where(eq(pcs.id, id));
    return pc;
  }

  async getPcs(): Promise<Pc[]> {
    return await db.select().from(pcs).orderBy(pcs.id);
  }

  async createPc(insertPc: InsertPc): Promise<Pc> {
    const [pc] = await db.insert(pcs).values(insertPc).returning();
    return pc;
  }

  async updatePc(id: number, updates: Partial<InsertPc>): Promise<Pc> {
    const [pc] = await db.update(pcs).set(updates).where(eq(pcs.id, id)).returning();
    return pc;
  }

  async deletePc(id: number): Promise<void> {
    await db.delete(pcs).where(eq(pcs.id, id));
  }

  // Sessions
  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async getSessions(filters?: { active?: boolean, pcId?: number, userId?: number }): Promise<Session[]> {
    let query = db.select().from(sessions);
    const conditions = [];

    if (filters?.active) {
      conditions.push(eq(sessions.status, "active"));
    }
    if (filters?.pcId) {
      conditions.push(eq(sessions.pcId, filters.pcId));
    }
    if (filters?.userId) {
      conditions.push(eq(sessions.userId, filters.userId));
    }

    if (conditions.length > 0) {
      // @ts-ignore - complex query building type issue
      return await query.where(and(...conditions)).orderBy(desc(sessions.startTime));
    }
    
    return await query.orderBy(desc(sessions.startTime));
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    // Also update PC status
    await db.update(pcs).set({ status: "in_session" }).where(eq(pcs.id, insertSession.pcId));
    return session;
  }

  async endSession(id: number): Promise<Session> {
    const [session] = await db.update(sessions)
      .set({ status: "completed", endTime: new Date() })
      .where(eq(sessions.id, id))
      .returning();
    
    if (session) {
      await db.update(pcs).set({ status: "online" }).where(eq(pcs.id, session.pcId));
    }
    
    return session;
  }

  async getActiveSessionForPc(pcId: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions)
      .where(and(eq(sessions.pcId, pcId), eq(sessions.status, "active")));
    return session;
  }

  async getStats(): Promise<{ totalUsers: number, totalPcs: number, activeSessions: number }> {
    const userCount = await db.select().from(users);
    const pcCount = await db.select().from(pcs);
    const activeSessionCount = await db.select().from(sessions).where(eq(sessions.status, "active"));
    
    return {
      totalUsers: userCount.length,
      totalPcs: pcCount.length,
      activeSessions: activeSessionCount.length
    };
  }
}

export const storage = new DatabaseStorage();
