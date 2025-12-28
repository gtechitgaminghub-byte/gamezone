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

/* =======================
   PASSWORD HELPERS
======================= */

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(stored: string, supplied: string) {
  // 🚨 guard against bad / legacy passwords
  if (!stored || !stored.includes(".")) {
    return false;
  }

  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;

  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;

  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/* =======================
   ROUTES
======================= */

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  /* ===== SESSION ===== */
  app.use(session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: app.get("env") === "production" }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  /* ===== PASSPORT ===== */
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Invalid username or password" });
      }

      const valid = await comparePassword(user.password, password);
      if (!valid) {
        return done(null, false, { message: "Invalid username or password" });
      }

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

  /* =======================
     AUTH ROUTES
  ======================= */

  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json(info);

      req.logIn(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  /* =======================
     USERS
  ======================= */

  app.get(api.users.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(await storage.getUsers());
  });

  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const hashed = await hashPassword(input.password);

      const user = await storage.createUser({
        ...input,
        password: hashed
      });

      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  /* =======================
     PCS
  ======================= */

  app.get(api.pcs.list.path, async (_req, res) => {
    res.json(await storage.getPcs());
  });

  app.post(api.pcs.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = api.pcs.create.input.parse(req.body);
    res.status(201).json(await storage.createPc(input));
  });

  /* =======================
     SESSIONS
  ======================= */

  app.get(api.sessions.list.path, async (req, res) => {
    const filters = {
      active: req.query.active === "true",
      pcId: req.query.pcId ? Number(req.query.pcId) : undefined,
      userId: req.query.userId ? Number(req.query.userId) : undefined
    };

    const sessions = await storage.getSessions(filters);

    const enriched = await Promise.all(
      sessions.map(async s => ({
        ...s,
        user: await storage.getUser(s.userId),
        pc: await storage.getPc(s.pcId)
      }))
    );

    res.json(enriched);
  });

  /* =======================
     SEED DATA
  ======================= */

  if ((await storage.getUsers()).length === 0) {
    console.log("🌱 Seeding admin user");

    const adminPassword = await hashPassword("admin");

    await storage.createUser({
      username: "admin",
      password: "Admin@123",
      role: "super_admin",
      balanceMinutes: 9999
    });

    await storage.createPc({ name: "Gaming-01", ipAddress: "192.168.1.101", status: "online" });
    await storage.createPc({ name: "Gaming-02", ipAddress: "192.168.1.102", status: "offline" });
    await storage.createPc({ name: "Gaming-03", ipAddress: "192.168.1.103", status: "in_session" });
  }

  return httpServer;
}

