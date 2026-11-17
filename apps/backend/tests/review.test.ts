import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import request from "supertest";
import { createApp } from "../src/app.js";

const manager = {
  fullName: "Review Manager",
  email: "review-manager@example.test",
  password: "review-password-123",
};
const account = {
  fullName: "Review Member",
  email: "review-member@example.test",
  password: "review-password-456",
};
const project = {
  name: "Review project",
  description: "",
  startDate: "2026-11-01",
  dueDate: "2026-12-01",
};
const credentials = ({ email, password }: typeof manager) => ({
  email,
  password,
});

test("session cookies expose no hashes and expired or replayed logout tokens lose access", async () => {
  const { app, db } = createApp({
    databasePath: ":memory:",
    bootstrapManager: manager,
  });
  try {
    const login = await request(app)
      .post("/api/auth/login")
      .send(credentials(manager));
    assert.equal(login.status, 201);
    assert.deepEqual(Object.keys(login.body.data).sort(), [
      "email",
      "fullName",
      "id",
      "memberId",
      "role",
    ]);
    const setCookie = login.headers["set-cookie"][0] as string;
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Lax/i);
    assert.match(setCookie, /Path=\//i);
    const pair = setCookie.split(";")[0];
    const token = pair.slice(pair.indexOf("=") + 1);
    const stored = db.prepare("SELECT token_hash FROM sessions").get() as {
      token_hash: string;
    };
    assert.equal(
      stored.token_hash,
      createHash("sha256").update(token).digest("hex"),
    );
    assert.notEqual(stored.token_hash, token);
    assert.equal(
      (
        await request(app)
          .get("/api/projects")
          .set("Cookie", `teamflow_session=${stored.token_hash}`)
      ).status,
      401,
    );
    assert.equal(
      (await request(app).get("/api/projects").set("Cookie", pair)).status,
      200,
    );
    db.prepare("UPDATE sessions SET expires_at=?").run(
      "2000-01-01T00:00:00.000Z",
    );
    assert.equal(
      (await request(app).get("/api/auth/me").set("Cookie", pair)).status,
      401,
    );
    const second = await request(app)
      .post("/api/auth/login")
      .send(credentials(manager));
    const fresh = second.headers["set-cookie"][0].split(";")[0];
    assert.equal(
      (
        await request(app)
          .post("/api/auth/logout")
          .set("Cookie", fresh)
          .send({})
      ).status,
      204,
    );
    assert.equal(
      (await request(app).get("/api/auth/me").set("Cookie", fresh)).status,
      401,
    );
  } finally {
    db.close();
  }
});

test("registration with a pre-existing member email remains pending until an explicit manager save", async () => {
  const { app, db } = createApp({
    databasePath: ":memory:",
    bootstrapManager: manager,
  });
  try {
    const mgr = request.agent(app),
      mem = request.agent(app);
    assert.equal(
      (await mgr.post("/api/auth/login").send(credentials(manager))).status,
      201,
    );
    const member = await mgr
      .post("/api/members")
      .send({ fullName: account.fullName, email: account.email, role: "QA" });
    assert.equal(member.status, 201);
    const registration = await mem.post("/api/auth/register").send(account);
    assert.equal(registration.status, 201);
    assert.equal(registration.body.data.role, "pending");
    for (const endpoint of ["projects", "tasks", "members", "risks"]) {
      assert.equal((await mem.get("/api/" + endpoint)).status, 403);
    }
    assert.equal(
      (
        await mgr
          .patch("/api/members/" + member.body.data.id)
          .send({ role: "Developer" })
      ).status,
      200,
    );
    assert.equal((await mem.get("/api/auth/me")).body.data.role, "member");
    assert.equal((await mem.get("/api/projects")).status, 200);
    assert.equal(
      (
        await mgr
          .patch("/api/members/" + member.body.data.id)
          .send({ email: "other@example.test" })
      ).status,
      409,
    );
    assert.equal(
      (await mem.get("/api/auth/me")).body.data.email,
      account.email,
    );
    const managerId = (await mgr.get("/api/auth/me")).body.data.memberId;
    assert.equal(
      (await mgr.delete("/api/members/" + managerId).send({})).status,
      403,
    );
    assert.equal(
      (
        await mgr
          .patch("/api/members/" + managerId)
          .send({ email: "other@example.test" })
      ).status,
      403,
    );
    assert.equal(
      (
        await mgr
          .patch("/api/members/" + member.body.data.id)
          .send({ accessRole: "manager" })
      ).status,
      400,
    );
  } finally {
    db.close();
  }
});

test("JSON mutations reject cross-site origins and malformed bodies without changing state", async () => {
  const { app, db } = createApp({
    databasePath: ":memory:",
    bootstrapManager: manager,
  });
  try {
    const mgr = request.agent(app);
    await mgr.post("/api/auth/login").send(credentials(manager));
    assert.equal(
      (
        await mgr
          .post("/api/projects")
          .set("Origin", "https://attacker.example")
          .send(project)
      ).status,
      403,
    );
    assert.equal(
      (
        await mgr
          .post("/api/projects")
          .set("Sec-Fetch-Site", "cross-site")
          .send(project)
      ).status,
      403,
    );
    assert.equal(
      (await mgr.post("/api/projects").type("form").send(project)).status,
      400,
    );
    const malformed = await mgr.post("/api/projects").type("json").send("{");
    assert.equal(malformed.status, 400);
    assert.deepEqual(Object.keys(malformed.body), ["error"]);
    assert.equal((await mgr.get("/api/projects")).body.data.length, 0);
    assert.equal(
      (
        await mgr
          .post("/api/projects")
          .set("Origin", "http://localhost:5173")
          .send(project)
      ).status,
      201,
    );
  } finally {
    db.close();
  }
});

test("members cannot take another task, reassign their task, or create an unassigned task", async () => {
  const { app, db } = createApp({
    databasePath: ":memory:",
    bootstrapManager: manager,
  });
  try {
    const mgr = request.agent(app),
      mem = request.agent(app);
    await mgr.post("/api/auth/login").send(credentials(manager));
    await mem.post("/api/auth/register").send(account);
    const member = (
      await mgr
        .post("/api/members")
        .send({ fullName: account.fullName, email: account.email, role: "QA" })
    ).body.data;
    const managerId = (await mgr.get("/api/auth/me")).body.data.memberId;
    const p = (await mgr.post("/api/projects").send(project)).body.data;
    const task = {
      projectId: p.id,
      title: "Review task",
      description: "",
      assigneeId: member.id,
      startDate: "2026-11-01",
      dueDate: "2026-11-20",
      priority: "medium",
      status: "todo",
    };
    assert.equal(
      (await mem.post("/api/tasks").send({ ...task, assigneeId: null })).status,
      403,
    );
    const own = (await mem.post("/api/tasks").send(task)).body.data;
    assert.equal(
      (await mem.patch("/api/tasks/" + own.id).send({ assigneeId: managerId }))
        .status,
      403,
    );
    const other = (
      await mgr.post("/api/tasks").send({ ...task, assigneeId: managerId })
    ).body.data;
    assert.equal(
      (
        await mem
          .patch("/api/tasks/" + other.id)
          .send({ assigneeId: member.id })
      ).status,
      403,
    );
    assert.equal(
      (
        await mem
          .patch("/api/tasks/" + own.id)
          .send({ startDate: "2026-11-21" })
      ).status,
      400,
    );
    assert.equal(
      (await mgr.post("/api/tasks").send({ ...task, projectId: randomUUID() }))
        .status,
      400,
    );
    assert.equal(
      (
        await mgr
          .patch("/api/tasks/" + own.id)
          .send({ assigneeId: randomUUID() })
      ).status,
      400,
    );
    assert.equal(
      (await mgr.get("/api/tasks/" + own.id)).body.data.assigneeId,
      member.id,
    );
    assert.equal(
      (await mgr.delete("/api/members/" + member.id).send({})).status,
      204,
    );
    assert.equal((await mem.get("/api/auth/me")).status, 401);
    assert.equal(
      (await mgr.get("/api/tasks/" + own.id)).body.data.assigneeId,
      null,
    );
  } finally {
    db.close();
  }
});

test("database reopening preserves projects and valid sessions without resetting data", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "teamflow-review-"));
  const databasePath = path.join(directory, "test.db");
  let current: ReturnType<typeof createApp> | undefined;
  try {
    current = createApp({ databasePath, bootstrapManager: manager });
    const login = await request(current.app)
      .post("/api/auth/login")
      .send(credentials(manager));
    const cookie = login.headers["set-cookie"][0].split(";")[0];
    const created = await request(current.app)
      .post("/api/projects")
      .set("Cookie", cookie)
      .send(project);
    assert.equal(created.status, 201);
    current.db.close();
    current = undefined;
    current = createApp({ databasePath });
    const restored = await request(current.app)
      .get("/api/projects/" + created.body.data.id)
      .set("Cookie", cookie);
    assert.equal(restored.status, 200);
    assert.equal(restored.body.data.name, project.name);
    assert.equal(
      (await request(current.app).get("/api/projects").set("Cookie", cookie))
        .body.data.length,
      1,
    );
    assert.equal(
      (
        current.db.prepare("PRAGMA foreign_keys").get() as {
          foreign_keys: number;
        }
      ).foreign_keys,
      1,
    );
  } finally {
    current?.db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("login throttling rejects repeated invalid credentials", async () => {
  const { app, db } = createApp({
    databasePath: ":memory:",
    bootstrapManager: manager,
  });
  try {
    for (let attempt = 0; attempt < 10; attempt++) {
      assert.equal(
        (
          await request(app)
            .post("/api/auth/login")
            .send({ email: manager.email, password: "incorrect" })
        ).status,
        401,
      );
    }
    const limited = await request(app)
      .post("/api/auth/login")
      .send(credentials(manager));
    assert.equal(limited.status, 429);
    assert.equal(limited.body.error.code, "RATE_LIMITED");
  } finally {
    db.close();
  }
});

test("login rejects password suffixes beyond bcrypt 72-byte limit", async () => {
  const { app, db } = createApp({ databasePath: ":memory:" });
  try {
    const password = "p".repeat(72);
    const registration = await request(app)
      .post("/api/auth/register")
      .send({ ...account, password });
    assert.equal(registration.status, 201);
    const suffixed = await request(app)
      .post("/api/auth/login")
      .send({ email: account.email, password: password + "different" });
    assert.equal(suffixed.status, 400);
    assert.equal(
      (
        await request(app)
          .post("/api/auth/login")
          .send({ email: account.email, password })
      ).status,
      201,
    );
  } finally {
    db.close();
  }
});

test("demo seed is repeatable and preserves existing passwords and user edits", () => {
  const directory = mkdtempSync(
    path.join(os.tmpdir(), "teamflow-seed-review-"),
  );
  const databasePath = path.join(directory, "demo.db");
  let current: ReturnType<typeof createApp> | undefined;
  try {
    const runSeed = () =>
      spawnSync(
        process.execPath,
        [
          fileURLToPath(import.meta.resolve("tsx/cli")),
          fileURLToPath(new URL("../src/seed.ts", import.meta.url)),
        ],
        {
          encoding: "utf8",
          env: {
            ...process.env,
            DATABASE_PATH: databasePath,
            DEMO_MANAGER_EMAIL: "manager@example.test",
            DEMO_MEMBER_EMAIL: "member@example.test",
            DEMO_MANAGER_PASSWORD: "",
            DEMO_MEMBER_PASSWORD: "",
          },
        },
      );
    const first = runSeed();
    assert.equal(first.status, 0, first.stderr);
    current = createApp({ databasePath });
    const passwordBefore = (
      current.db
        .prepare("SELECT password_hash FROM users WHERE email=?")
        .get("manager@example.test") as { password_hash: string }
    ).password_hash;
    assert.match(passwordBefore, /^\$2[aby]\$/);
    current.db
      .prepare(
        "UPDATE tasks SET title=? WHERE id=(SELECT id FROM tasks LIMIT 1)",
      )
      .run("User edited title");
    const counts = ["users", "members", "projects", "tasks", "risks"].map(
      (table) =>
        (
          current!.db.prepare(`SELECT COUNT(*) count FROM ${table}`).get() as {
            count: number;
          }
        ).count,
    );
    assert.deepEqual(counts, [2, 5, 1, 12, 4]);
    current.db.close();
    current = undefined;
    const second = runSeed();
    assert.equal(second.status, 0, second.stderr);
    assert.doesNotMatch(second.stdout, /New demo login/);
    current = createApp({ databasePath });
    assert.deepEqual(
      ["users", "members", "projects", "tasks", "risks"].map(
        (table) =>
          (
            current!.db
              .prepare(`SELECT COUNT(*) count FROM ${table}`)
              .get() as { count: number }
          ).count,
      ),
      [2, 5, 1, 12, 4],
    );
    assert.equal(
      (
        current.db
          .prepare("SELECT password_hash FROM users WHERE email=?")
          .get("manager@example.test") as { password_hash: string }
      ).password_hash,
      passwordBefore,
    );
    assert.equal(
      (
        current.db
          .prepare("SELECT COUNT(*) count FROM tasks WHERE title=?")
          .get("User edited title") as { count: number }
      ).count,
      1,
    );
  } finally {
    current?.db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
