import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Helper to hash passwords (simple version for this demo)
// In production, move to a proper auth utility
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(stored: string, supplied: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session setup
  app.use(session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: app.get("env") === "production" }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) return done(null, false, { message: "Incorrect username." });
      
      const isValid = await comparePassword(user.password, password);
      if (!isValid) return done(null, false, { message: "Incorrect password." });
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // === AUTH ROUTES ===
  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json(info);
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout(() => {
      res.status(200).json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.status(200).json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // === USER ROUTES ===
  app.get(api.users.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const users = await storage.getUsers();
    res.json(users);
  });

  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.users.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const id = parseInt(req.params.id);
    const user = await storage.updateUser(id, req.body);
    res.json(user);
  });

  app.delete(api.users.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const id = parseInt(req.params.id);
    await storage.deleteUser(id);
    res.status(204).send();
  });

  // === PC ROUTES ===
  app.get(api.pcs.list.path, async (req, res) => {
    const pcs = await storage.getPcs();
    res.json(pcs);
  });

  app.post(api.pcs.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const input = api.pcs.create.input.parse(req.body);
    const pc = await storage.createPc(input);
    res.status(201).json(pc);
  });

  app.put(api.pcs.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const id = parseInt(req.params.id);
    const pc = await storage.updatePc(id, req.body);
    res.json(pc);
  });

  app.delete(api.pcs.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const id = parseInt(req.params.id);
    await storage.deletePc(id);
    res.status(204).send();
  });

  // === SESSION ROUTES ===
  app.get(api.sessions.list.path, async (req, res) => {
    const filters = {
      active: req.query.active === 'true',
      pcId: req.query.pcId ? parseInt(req.query.pcId as string) : undefined,
      userId: req.query.userId ? parseInt(req.query.userId as string) : undefined
    };
    const sessions = await storage.getSessions(filters);
    
    // Enrich with user/pc details manually (for MVP, standard Join would be better)
    const enriched = await Promise.all(sessions.map(async (s) => {
      const user = await storage.getUser(s.userId);
      const pc = await storage.getPc(s.pcId);
      return { ...s, user, pc };
    }));
    
    res.json(enriched);
  });

  app.post(api.sessions.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const input = api.sessions.create.input.parse(req.body);
    const session = await storage.createSession(input);
    res.status(201).json(session);
  });

  app.post(api.sessions.end.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const id = parseInt(req.params.id);
    const session = await storage.endSession(id);
    res.json(session);
  });

  // === STATS ===
  app.get(api.stats.get.path, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Seed Data
  if ((await storage.getUsers()).length === 0) {
    const adminPassword = await hashPassword("admin");
    await storage.createUser({
      username: "admin",
      password: adminPassword,
      role: "super_admin",
      balanceMinutes: 9999
    });
    
    // Seed PCs
    await storage.createPc({ name: "Gaming-01", ipAddress: "192.168.1.101", status: "online" });
    await storage.createPc({ name: "Gaming-02", ipAddress: "192.168.1.102", status: "offline" });
    await storage.createPc({ name: "Gaming-03", ipAddress: "192.168.1.103", status: "in_session" });
  }

  return httpServer;
}
