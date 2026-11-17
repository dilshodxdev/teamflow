import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  rmSync,
  existsSync,
  writeFileSync,
  readFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import request from "supertest";
import { createApp } from "../src/app.js";

const manager = {
  fullName: "Overnight Manager",
  email: "overnight-manager@example.test",
  password: "overnight-manager-password",
};
const memberAccount = {
  fullName: "Overnight Member",
  email: "overnight-member@example.test",
  password: "overnight-member-password",
};
const credentials = ({ email, password }: typeof manager) => ({
  email,
  password,
});

test("removing a member revokes every login and unassigns both task and risk records", async () => {
  const { app, db } = createApp({
    databasePath: ":memory:",
    bootstrapManager: manager,
  });
  try {
    const mgr = request.agent(app),
      first = request.agent(app),
      second = request.agent(app);
    assert.equal(
      (await mgr.post("/api/auth/login").send(credentials(manager))).status,
      201,
    );
    await first.post("/api/auth/register").send(memberAccount);
    const member = (
      await mgr.post("/api/members").send({
        fullName: memberAccount.fullName,
        email: memberAccount.email,
        role: "QA",
      })
    ).body.data;
    assert.equal(
      (await second.post("/api/auth/login").send(credentials(memberAccount)))
        .status,
      201,
    );
    const project = (
      await mgr.post("/api/projects").send({
        name: "Revocation review",
        description: "",
        startDate: "2026-11-17",
        dueDate: "2026-11-30",
      })
    ).body.data;
    const task = (
      await mgr.post("/api/tasks").send({
        projectId: project.id,
        title: "Assigned task",
        description: "",
        assigneeId: member.id,
        startDate: "2026-11-17",
        dueDate: "2026-11-20",
        priority: "high",
        status: "todo",
      })
    ).body.data;
    const risk = (
      await mgr.post("/api/risks").send({
        projectId: project.id,
        title: "Assigned risk",
        probability: 3,
        impact: 5,
        mitigation: "",
        assigneeId: member.id,
        status: "active",
      })
    ).body.data;
    assert.equal((await first.get("/api/tasks")).status, 200);
    assert.equal((await second.get("/api/risks")).status, 200);
    assert.equal(
      (await mgr.delete("/api/members/" + member.id).send({})).status,
      204,
    );
    assert.equal((await first.get("/api/auth/me")).status, 401);
    assert.equal((await second.get("/api/auth/me")).status, 401);
    assert.equal(
      (await mgr.get("/api/tasks/" + task.id)).body.data.assigneeId,
      null,
    );
    assert.equal(
      (await mgr.get("/api/risks")).body.data.find(
        (entry: { id: string }) => entry.id === risk.id,
      ).assigneeId,
      null,
    );
    const relogin = await second
      .post("/api/auth/login")
      .send(credentials(memberAccount));
    assert.equal(relogin.status, 201);
    assert.equal(relogin.body.data.role, "pending");
    assert.equal((await second.get("/api/projects")).status, 403);
  } finally {
    db.close();
  }
});

test("current database permissions control an already issued session on every request", async () => {
  const { app, db } = createApp({
    databasePath: ":memory:",
    bootstrapManager: manager,
  });
  try {
    const mgr = request.agent(app);
    const login = await mgr.post("/api/auth/login").send(credentials(manager));
    assert.equal(login.body.data.role, "manager");
    const project = {
      name: "Current permissions",
      description: "",
      startDate: "2026-11-17",
      dueDate: "2026-11-30",
    };
    db.prepare("UPDATE members SET access_role=? WHERE id=?").run(
      "member",
      login.body.data.memberId,
    );
    assert.equal((await mgr.get("/api/auth/me")).body.data.role, "member");
    assert.equal((await mgr.get("/api/projects")).status, 200);
    assert.equal((await mgr.post("/api/projects").send(project)).status, 403);
    db.prepare("UPDATE members SET user_id=NULL WHERE id=?").run(
      login.body.data.memberId,
    );
    assert.equal((await mgr.get("/api/auth/me")).body.data.role, "pending");
    assert.equal((await mgr.get("/api/projects")).status, 403);
  } finally {
    db.close();
  }
});

const seed = (databasePath: string, overrides: Record<string, string> = {}) =>
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
        DEMO_MANAGER_PASSWORD: "valid-demo-manager-password",
        DEMO_MEMBER_PASSWORD: "valid-demo-member-password",
        ...overrides,
      },
    },
  );

test("demo seed never elevates a registered account matching the fictional manager email", async () => {
  const directory = mkdtempSync(
    path.join(os.tmpdir(), "teamflow-seed-identity-"),
  );
  const databasePath = path.join(directory, "identity.db");
  let current: ReturnType<typeof createApp> | undefined;
  try {
    current = createApp({ databasePath });
    assert.equal(
      (
        await request(current.app)
          .post("/api/auth/register")
          .send({ ...memberAccount, email: "manager@example.test" })
      ).status,
      201,
    );
    const before = current.db
      .prepare("SELECT id,password_hash FROM users WHERE email=?")
      .get("manager@example.test");
    current.db.close();
    current = undefined;
    const result = seed(databasePath);
    assert.equal(result.status, 0, result.stderr);
    current = createApp({ databasePath });
    assert.deepEqual(
      current.db
        .prepare("SELECT id,password_hash FROM users WHERE email=?")
        .get("manager@example.test"),
      before,
    );
    const login = await request(current.app).post("/api/auth/login").send({
      email: "manager@example.test",
      password: memberAccount.password,
    });
    assert.equal(login.status, 201);
    assert.equal(login.body.data.role, "pending");
    const managers = current.db
      .prepare("SELECT COUNT(*) count FROM members WHERE access_role='manager'")
      .get() as { count: number };
    assert.equal(managers.count, 0);
  } finally {
    current?.db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("invalid second demo password rolls back the first account and all demonstration rows", () => {
  const directory = mkdtempSync(
    path.join(os.tmpdir(), "teamflow-seed-rollback-"),
  );
  const databasePath = path.join(directory, "rollback.db");
  let current: ReturnType<typeof createApp> | undefined;
  try {
    const result = seed(databasePath, { DEMO_MEMBER_PASSWORD: "short" });
    assert.notEqual(result.status, 0);
    current = createApp({ databasePath });
    for (const table of ["users", "members", "projects", "tasks", "risks"]) {
      assert.equal(
        (
          current.db.prepare(`SELECT COUNT(*) count FROM ${table}`).get() as {
            count: number;
          }
        ).count,
        0,
      );
    }
    assert.equal(
      existsSync(path.join(directory, "rollback.demo-credentials.json")),
      false,
    );
  } finally {
    current?.db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("credential file collision rolls back generated accounts and preserves the existing file", () => {
  const directory = mkdtempSync(
    path.join(os.tmpdir(), "teamflow-seed-file-collision-"),
  );
  const databasePath = path.join(directory, "collision.db");
  const credentialsPath = path.join(
    directory,
    "collision.demo-credentials.json",
  );
  let current: ReturnType<typeof createApp> | undefined;
  try {
    const sentinel = "existing private credentials must be preserved\n";
    writeFileSync(credentialsPath, sentinel, { encoding: "utf8", flag: "wx" });
    const result = seed(databasePath, {
      DEMO_MANAGER_PASSWORD: "",
      DEMO_MEMBER_PASSWORD: "",
    });
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(credentialsPath, "utf8"), sentinel);
    current = createApp({ databasePath });
    for (const table of ["users", "members", "projects", "tasks", "risks"]) {
      assert.equal(
        (
          current.db.prepare(`SELECT COUNT(*) count FROM ${table}`).get() as {
            count: number;
          }
        ).count,
        0,
      );
    }
  } finally {
    current?.db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
