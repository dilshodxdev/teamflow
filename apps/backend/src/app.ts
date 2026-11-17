import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cookieParser from "cookie-parser";
import { DatabaseSync } from "node:sqlite";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { z, ZodError } from "zod";
import { migrate } from "./database/migrate.js";

const cookie = "teamflow_session";
type Row = Record<string, any>;
type Options = {
  databasePath: string;
  frontendUrl?: string;
  secure?: boolean;
  sessionTtlHours?: number;
  bootstrapManager?: { fullName: string; email: string; password: string };
};
class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
const fail = (status: number, code: string, message: string): never => {
  throw new ApiError(status, code, message);
};
const text = z.string().trim().min(1).max(200);
const description = z.string().trim().max(5000);
const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((v) => v.toLowerCase());
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(v + "T00:00:00Z");
    return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === v;
  }, "Invalid date");
const id = z.string().uuid();
const projectSchema = z
  .object({ name: text, description, startDate: date, dueDate: date })
  .strict();
const taskSchema = z
  .object({
    projectId: id,
    title: text,
    description,
    assigneeId: id.nullable(),
    startDate: date,
    dueDate: date,
    priority: z.enum(["low", "medium", "high"]),
    status: z.enum(["todo", "in_progress", "done"]),
  })
  .strict();
const memberSchema = z.object({ fullName: text, email, role: text }).strict();
const riskSchema = z
  .object({
    projectId: id,
    title: text,
    probability: z.number().int().min(1).max(5),
    impact: z.number().int().min(1).max(5),
    mitigation: description,
    assigneeId: id.nullable(),
    status: z.enum(["active", "monitoring", "resolved"]),
  })
  .strict();
const password = z
  .string()
  .min(8)
  .max(72)
  .refine((s) => Buffer.byteLength(s, "utf8") <= 72, "Password too long");
const authRegister = z.object({ fullName: text, email, password }).strict();
const authLogin = z
  .object({
    email,
    password: z
      .string()
      .min(1)
      .max(72)
      .refine((s) => Buffer.byteLength(s, "utf8") <= 72, "Password too long"),
  })
  .strict();
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const now = () => new Date().toISOString();
const camel = (row: Row): Row =>
  Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
      v,
    ]),
  );
const dateOrder = (o: Row) => {
  if (o.startDate > o.dueDate)
    fail(400, "VALIDATION_ERROR", "Start date must not be after due date");
};

export function createApp(options: Options) {
  if (options.databasePath !== ":memory:")
    mkdirSync(path.dirname(options.databasePath), { recursive: true });
  const db = new DatabaseSync(options.databasePath);
  migrate(db);
  const one = (sql: string, ...args: any[]) =>
    db.prepare(sql).get(...args) as Row | undefined;
  const all = (sql: string, ...args: any[]) =>
    db.prepare(sql).all(...args) as Row[];
  const run = (sql: string, ...args: any[]) => db.prepare(sql).run(...args);
  const tx = <T>(fn: () => T): T => {
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = fn();
      db.exec("COMMIT");
      return result;
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  };
  if (
    options.bootstrapManager &&
    !one("SELECT id FROM members WHERE access_role='manager'")
  )
    tx(() => {
      const b = authRegister.parse(options.bootstrapManager);
      let user = one("SELECT id FROM users WHERE email=?", b.email);
      if (user)
        throw new Error(
          "Bootstrap email already belongs to an existing account",
        );
      user = { id: randomUUID() };
      run(
        "INSERT INTO users VALUES (?,?,?,?,?)",
        user.id,
        b.fullName,
        b.email,
        bcrypt.hashSync(b.password, 10),
        now(),
      );
      run(
        "INSERT INTO members VALUES (?,?,?,?,?,?,?)",
        randomUUID(),
        user.id,
        b.fullName,
        b.email,
        "Project Manager / Team Lead",
        "manager",
        now(),
      );
    });
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const origin = req.get("origin");
      const allowed = new Set([
        options.frontendUrl || "http://localhost:5173",
        `${req.protocol}://${req.get("host")}`,
      ]);
      if (
        (origin && !allowed.has(origin)) ||
        req.get("sec-fetch-site") === "cross-site"
      )
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Invalid request origin" },
        });
      if (!/^application\/json(?:\s*;|$)/i.test(req.get("content-type") || ""))
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Content-Type must be application/json",
          },
        });
    }
    next();
  });
  app.use(express.json({ limit: "64kb" }));
  app.use(cookieParser());
  const send = (res: Response, data: unknown, status = 200) =>
    res.status(status).json({ data });
  const getAuth = (req: Request) => {
    const token = req.cookies?.[cookie];
    if (typeof token !== "string") return null;
    return (
      one(
        `SELECT u.id,u.full_name,u.email,m.id member_id,m.access_role FROM sessions s JOIN users u ON u.id=s.user_id LEFT JOIN members m ON m.user_id=u.id WHERE s.token_hash=? AND s.expires_at>?`,
        hash(token),
        now(),
      ) || null
    );
  };
  const auth = (req: Request) =>
    getAuth(req) || fail(401, "UNAUTHORIZED", "Authentication required");
  const approved = (req: Request) => {
    const u = auth(req);
    if (!u.member_id) fail(403, "FORBIDDEN", "Manager approval required");
    return u;
  };
  const manager = (req: Request) => {
    const u = approved(req);
    if (u.access_role !== "manager")
      fail(403, "FORBIDDEN", "Manager access required");
    return u;
  };
  const authDto = (u: Row) => ({
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.access_role || "pending",
    memberId: u.member_id || null,
  });
  const session = (res: Response, userId: string) => {
    const token = randomBytes(32).toString("base64url");
    const ttl = options.sessionTtlHours || 24;
    const expires = new Date(Date.now() + ttl * 3600000);
    run("DELETE FROM sessions WHERE expires_at<=?", now());
    run(
      "INSERT INTO sessions VALUES (?,?,?,?)",
      hash(token),
      userId,
      expires.toISOString(),
      now(),
    );
    res.cookie(cookie, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: !!options.secure,
      path: "/",
      expires,
    });
  };
  const checkRefs = (o: Row) => {
    if (!one("SELECT id FROM projects WHERE id=?", o.projectId))
      fail(400, "VALIDATION_ERROR", "Project does not exist");
    if (o.assigneeId && !one("SELECT id FROM members WHERE id=?", o.assigneeId))
      fail(400, "VALIDATION_ERROR", "Assignee does not exist");
  };
  const lookup = (table: string, id: string) =>
    one(`SELECT * FROM ${table} WHERE id=?`, id) ||
    fail(404, "NOT_FOUND", "Record not found");
  const projectDto = (r: Row) => {
    const counts = one(
      "SELECT COUNT(*) total, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) done, SUM(CASE WHEN status='todo' THEN 1 ELSE 0 END) todo FROM tasks WHERE project_id=?",
      r.id,
    )!;
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      startDate: r.start_date,
      dueDate: r.due_date,
      status:
        !counts.total || counts.todo === counts.total
          ? "planned"
          : counts.done === counts.total
            ? "done"
            : "in_progress",
      progress: counts.total
        ? Math.round((counts.done / counts.total) * 100)
        : 0,
    };
  };
  const taskDto = (r: Row) => {
    const {
      id,
      projectId,
      title,
      description,
      assigneeId,
      startDate,
      dueDate,
      priority,
      status,
    } = camel(r);
    return {
      id,
      projectId,
      title,
      description,
      assigneeId,
      startDate,
      dueDate,
      priority,
      status,
    };
  };
  const memberDto = (r: Row) => ({
    id: r.id,
    fullName: r.full_name,
    email: r.email,
    role: r.role,
    accessRole: r.access_role,
  });
  const riskDto = (r: Row) => {
    const {
      id,
      projectId,
      title,
      probability,
      impact,
      mitigation,
      assigneeId,
      status,
    } = camel(r);
    const score = probability * impact;
    return {
      id,
      projectId,
      title,
      probability,
      impact,
      mitigation,
      assigneeId,
      status,
      score,
      level: score <= 5 ? "low" : score <= 12 ? "medium" : "high",
    };
  };
  const patch = <T extends z.ZodObject<any>>(schema: T, body: unknown) => {
    const p = schema.partial().parse(body);
    if (!Object.keys(p).length)
      fail(400, "VALIDATION_ERROR", "At least one field is required");
    return p as Row;
  };
  const insert = (table: string, obj: Row) => {
    const keys = Object.keys(obj);
    run(
      `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
      ...Object.values(obj),
    );
  };
  const update = (table: string, id: string, obj: Row) => {
    const keys = Object.keys(obj);
    run(
      `UPDATE ${table} SET ${keys.map((k) => `${k}=?`).join(",")} WHERE id=?`,
      ...Object.values(obj),
      id,
    );
  };
  const snake = (obj: Row) =>
    Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase()),
        v,
      ]),
    );
  app.get("/api/health", (_req, res) => send(res, { status: "ok" }));
  app.post("/api/auth/register", (req, res) => {
    const v = authRegister.parse(req.body);
    const uid = randomUUID();
    tx(() => {
      if (one("SELECT id FROM users WHERE email=?", v.email))
        fail(409, "CONFLICT", "Email already registered");
      run(
        "INSERT INTO users VALUES (?,?,?,?,?)",
        uid,
        v.fullName,
        v.email,
        bcrypt.hashSync(v.password, 10),
        now(),
      );
      session(res, uid);
    });
    send(
      res,
      {
        id: uid,
        fullName: v.fullName,
        email: v.email,
        role: "pending",
        memberId: null,
      },
      201,
    );
  });
  const attempts = new Map<string, { count: number; until: number }>();
  app.post("/api/auth/login", (req, res) => {
    const key = req.ip || "unknown";
    const old = attempts.get(key);
    const entry =
      old && old.until > Date.now()
        ? old
        : { count: 0, until: Date.now() + 15 * 60 * 1000 };
    if (entry.count >= 10) fail(429, "RATE_LIMITED", "Too many login attempts");
    const v = authLogin.parse(req.body);
    const u = one("SELECT * FROM users WHERE email=?", v.email);
    if (!u || !bcrypt.compareSync(v.password, u.password_hash)) {
      entry.count++;
      attempts.set(key, entry);
      fail(401, "UNAUTHORIZED", "Invalid credentials");
    }
    attempts.delete(key);
    session(res, u!.id);
    send(res, authDto(getAuthFromId(u!.id)), 201);
  });
  const getAuthFromId = (id: string) =>
    one(
      "SELECT u.id,u.full_name,u.email,m.id member_id,m.access_role FROM users u LEFT JOIN members m ON m.user_id=u.id WHERE u.id=?",
      id,
    )!;
  app.get("/api/auth/me", (req, res) => send(res, authDto(auth(req))));
  app.post("/api/auth/logout", (req, res) => {
    auth(req);
    run("DELETE FROM sessions WHERE token_hash=?", hash(req.cookies[cookie]));
    res.clearCookie(cookie, {
      httpOnly: true,
      sameSite: "lax",
      secure: !!options.secure,
      path: "/",
    });
    res.status(204).end();
  });
  app.get("/api/projects", (req, res) => {
    approved(req);
    send(
      res,
      all("SELECT * FROM projects ORDER BY created_at DESC").map(projectDto),
    );
  });
  app.get("/api/projects/:id", (req, res) => {
    approved(req);
    send(res, projectDto(lookup("projects", req.params.id)));
  });
  app.post("/api/projects", (req, res) => {
    manager(req);
    const v = projectSchema.parse(req.body);
    dateOrder(v);
    const pid = randomUUID();
    tx(() =>
      insert("projects", {
        id: pid,
        ...snake(v),
        created_at: now(),
        updated_at: now(),
      }),
    );
    send(res, projectDto(lookup("projects", pid)), 201);
  });
  app.patch("/api/projects/:id", (req, res) => {
    manager(req);
    const old = lookup("projects", req.params.id);
    const v = patch(projectSchema, req.body);
    dateOrder({ ...camel(old), ...v });
    tx(() =>
      update("projects", req.params.id, { ...snake(v), updated_at: now() }),
    );
    send(res, projectDto(lookup("projects", req.params.id)));
  });
  app.delete("/api/projects/:id", (req, res) => {
    manager(req);
    tx(() => {
      lookup("projects", req.params.id);
      run("DELETE FROM projects WHERE id=?", req.params.id);
    });
    res.status(204).end();
  });
  app.get("/api/tasks", (req, res) => {
    approved(req);
    const filter = req.query.projectId;
    if (filter !== undefined) id.parse(filter);
    send(
      res,
      (filter
        ? all(
            "SELECT * FROM tasks WHERE project_id=? ORDER BY created_at DESC",
            filter,
          )
        : all("SELECT * FROM tasks ORDER BY created_at DESC")
      ).map(taskDto),
    );
  });
  app.get("/api/tasks/:id", (req, res) => {
    approved(req);
    send(res, taskDto(lookup("tasks", req.params.id)));
  });
  app.post("/api/tasks", (req, res) => {
    const u = approved(req);
    const v = taskSchema.parse(req.body);
    dateOrder(v);
    if (u.access_role !== "manager" && v.assigneeId !== u.member_id)
      fail(403, "FORBIDDEN", "Members may only assign tasks to themselves");
    const tid = randomUUID();
    tx(() => {
      checkRefs(v);
      insert("tasks", {
        id: tid,
        ...snake(v),
        created_at: now(),
        updated_at: now(),
      });
    });
    send(res, taskDto(lookup("tasks", tid)), 201);
  });
  app.patch("/api/tasks/:id", (req, res) => {
    const u = approved(req);
    const old = lookup("tasks", req.params.id);
    const v = patch(taskSchema, req.body);
    const merged = { ...camel(old), ...v };
    dateOrder(merged);
    if (
      u.access_role !== "manager" &&
      (old.assignee_id !== u.member_id || merged.assigneeId !== u.member_id)
    )
      fail(403, "FORBIDDEN", "Members may only edit their own assigned tasks");
    tx(() => {
      checkRefs(merged);
      update("tasks", req.params.id, { ...snake(v), updated_at: now() });
    });
    send(res, taskDto(lookup("tasks", req.params.id)));
  });
  app.delete("/api/tasks/:id", (req, res) => {
    manager(req);
    tx(() => {
      lookup("tasks", req.params.id);
      run("DELETE FROM tasks WHERE id=?", req.params.id);
    });
    res.status(204).end();
  });
  app.get("/api/members", (req, res) => {
    approved(req);
    send(res, all("SELECT * FROM members ORDER BY created_at").map(memberDto));
  });
  app.post("/api/members", (req, res) => {
    manager(req);
    const v = memberSchema.parse(req.body);
    const mid = randomUUID();
    tx(() => {
      if (one("SELECT id FROM members WHERE email=?", v.email))
        fail(409, "CONFLICT", "Member email already exists");
      const u = one("SELECT id FROM users WHERE email=?", v.email);
      insert("members", {
        id: mid,
        user_id: u?.id || null,
        ...snake(v),
        access_role: "member",
        created_at: now(),
      });
    });
    send(res, memberDto(lookup("members", mid)), 201);
  });
  app.patch("/api/members/:id", (req, res) => {
    manager(req);
    const old = lookup("members", req.params.id);
    const v = patch(memberSchema, req.body);
    const merged = { ...camel(old), ...v };
    tx(() => {
      if (
        old.access_role === "manager" &&
        (merged.email !== old.email || merged.fullName !== old.full_name)
      )
        fail(403, "FORBIDDEN", "Manager identity is protected");
      if (old.user_id && merged.email !== old.email)
        fail(409, "CONFLICT", "Linked member email cannot be changed");
      const duplicate = one(
        "SELECT id FROM members WHERE email=? AND id<>?",
        merged.email,
        old.id,
      );
      if (duplicate) fail(409, "CONFLICT", "Member email already exists");
      const u = one("SELECT id FROM users WHERE email=?", merged.email);
      update("members", old.id, {
        ...snake(v),
        user_id: old.user_id || u?.id || null,
      });
    });
    send(res, memberDto(lookup("members", old.id)));
  });
  app.delete("/api/members/:id", (req, res) => {
    manager(req);
    tx(() => {
      const old = lookup("members", req.params.id);
      if (old.access_role === "manager")
        fail(403, "FORBIDDEN", "Manager is protected");
      if (old.user_id) run("DELETE FROM sessions WHERE user_id=?", old.user_id);
      run("DELETE FROM members WHERE id=?", old.id);
    });
    res.status(204).end();
  });
  app.get("/api/risks", (req, res) => {
    approved(req);
    const filter = req.query.projectId;
    if (filter !== undefined) id.parse(filter);
    send(
      res,
      (filter
        ? all(
            "SELECT * FROM risks WHERE project_id=? ORDER BY created_at DESC",
            filter,
          )
        : all("SELECT * FROM risks ORDER BY created_at DESC")
      ).map(riskDto),
    );
  });
  app.post("/api/risks", (req, res) => {
    manager(req);
    const v = riskSchema.parse(req.body);
    const rid = randomUUID();
    tx(() => {
      checkRefs(v);
      insert("risks", {
        id: rid,
        ...snake(v),
        created_at: now(),
        updated_at: now(),
      });
    });
    send(res, riskDto(lookup("risks", rid)), 201);
  });
  app.patch("/api/risks/:id", (req, res) => {
    manager(req);
    const old = lookup("risks", req.params.id);
    const v = patch(riskSchema, req.body);
    tx(() => {
      checkRefs({ ...camel(old), ...v });
      update("risks", old.id, { ...snake(v), updated_at: now() });
    });
    send(res, riskDto(lookup("risks", old.id)));
  });
  app.delete("/api/risks/:id", (req, res) => {
    manager(req);
    tx(() => {
      lookup("risks", req.params.id);
      run("DELETE FROM risks WHERE id=?", req.params.id);
    });
    res.status(204).end();
  });
  app.use("/api", (_req, _res, next) =>
    next(new ApiError(404, "NOT_FOUND", "Endpoint not found")),
  );
  const frontend = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../frontend/dist",
  );
  if (existsSync(frontend)) {
    app.use(express.static(frontend));
    app.get("/{*path}", (_req, res) =>
      res.sendFile(path.join(frontend, "index.html")),
    );
  }
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError)
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Invalid request data" },
      });
    if (err instanceof ApiError)
      return res
        .status(err.status)
        .json({ error: { code: err.code, message: err.message } });
    if (err instanceof SyntaxError || (err as any)?.status === 413)
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Invalid request body" },
      });
    if ((err as any)?.code?.startsWith("SQLITE_CONSTRAINT"))
      return res.status(409).json({
        error: {
          code: "CONFLICT",
          message: "Record conflicts with existing data",
        },
      });
    console.error("Unexpected request error", err);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    });
  });
  return { app, db };
}
