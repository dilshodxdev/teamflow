import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

const manager = {
  fullName: "Manager",
  email: "manager@example.test",
  password: "password123",
};
const pending = {
  fullName: "Member",
  email: "member@example.test",
  password: "password123",
};
const project = {
  name: "Project",
  description: "Description",
  startDate: "2026-01-01",
  dueDate: "2026-12-31",
};
test("sessions, manual approval, authorization, CRUD and calculations", async () => {
  const { app, db } = createApp({
    databasePath: ":memory:",
    bootstrapManager: manager,
  });
  const mgr = request.agent(app),
    mem = request.agent(app);
  assert.equal((await request(app).get("/api/projects")).status, 401);
  assert.equal(
    (
      await mgr
        .post("/api/auth/login")
        .send({ email: manager.email, password: "wrongpass" })
    ).status,
    401,
  );
  assert.equal(
    (
      await mgr
        .post("/api/auth/login")
        .send({ email: manager.email, password: manager.password })
    ).status,
    201,
  );
  const reg = await mem.post("/api/auth/register").send(pending);
  assert.equal(reg.status, 201);
  assert.equal(reg.body.data.role, "pending");
  assert.equal((await mem.get("/api/projects")).status, 403);
  const member = await mgr
    .post("/api/members")
    .send({ fullName: "Member", email: pending.email, role: "Developer" });
  assert.equal(member.status, 201);
  assert.equal((await mem.get("/api/auth/me")).body.data.role, "member");
  const p = await mgr.post("/api/projects").send(project);
  assert.equal(p.status, 201);
  const pid = p.body.data.id;
  assert.equal((await mem.post("/api/projects").send(project)).status, 403);
  const task = {
    projectId: pid,
    title: "Task",
    description: "",
    assigneeId: member.body.data.id,
    startDate: "2026-01-01",
    dueDate: "2026-02-01",
    priority: "medium",
    status: "todo",
  };
  const t = await mem.post("/api/tasks").send(task);
  assert.equal(t.status, 201);
  assert.equal(
    (await mem.patch("/api/tasks/" + t.body.data.id).send({ status: "done" }))
      .status,
    200,
  );
  assert.equal(
    (
      await mem
        .delete("/api/tasks/" + t.body.data.id)
        .set("Content-Type", "application/json")
    ).status,
    403,
  );
  const read = await mgr.get("/api/projects/" + pid);
  assert.equal(read.body.data.progress, 100);
  assert.equal(read.body.data.status, "done");
  const risk = await mgr.post("/api/risks").send({
    projectId: pid,
    title: "Risk",
    probability: 4,
    impact: 4,
    mitigation: "Plan",
    assigneeId: member.body.data.id,
    status: "active",
  });
  assert.equal(risk.status, 201);
  assert.equal(risk.body.data.score, 16);
  assert.equal(risk.body.data.level, "high");
  assert.equal(
    (
      await mgr.post("/api/risks").send({
        projectId: pid,
        title: "Bad",
        probability: 6,
        impact: 4,
        mitigation: "",
        assigneeId: null,
        status: "active",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await mgr
        .delete("/api/members/" + member.body.data.id)
        .set("Content-Type", "application/json")
    ).status,
    204,
  );
  assert.equal(
    (await mgr.get("/api/tasks/" + t.body.data.id)).body.data.assigneeId,
    null,
  );
  assert.equal((await mem.get("/api/projects")).status, 401);
  assert.equal(
    (
      await mgr
        .delete("/api/projects/" + pid)
        .set("Content-Type", "application/json")
    ).status,
    204,
  );
  assert.equal((await mgr.get("/api/tasks/" + t.body.data.id)).status, 404);
  assert.equal((await mgr.get("/api/risks")).body.data.length, 0);
  assert.equal((await mgr.post("/api/auth/logout").send({})).status, 204);
  assert.equal((await mgr.get("/api/auth/me")).status, 401);
  db.close();
});

test("manager CRUD computes mixed progress, filters records and validates merged inputs", async () => {
  const { app, db } = createApp({
    databasePath: ":memory:",
    bootstrapManager: manager,
  });
  const mgr = request.agent(app);
  try {
    await mgr
      .post("/api/auth/login")
      .send({ email: manager.email, password: manager.password });
    const a = (await mgr.post("/api/projects").send(project)).body.data;
    const b = (
      await mgr.post("/api/projects").send({ ...project, name: "Other" })
    ).body.data;
    assert.equal(
      (await mgr.patch("/api/projects/" + a.id).send({ dueDate: "2025-12-31" }))
        .status,
      400,
    );
    assert.equal(
      (await mgr.patch("/api/projects/" + a.id).send({ name: "Renamed" })).body
        .data.name,
      "Renamed",
    );
    const base = {
      projectId: a.id,
      title: "Task",
      description: "",
      assigneeId: null,
      startDate: "2026-01-01",
      dueDate: "2026-02-01",
      priority: "low",
      status: "todo",
    };
    assert.equal(
      (
        await mgr
          .post("/api/tasks")
          .send({ ...base, projectId: "00000000-0000-4000-8000-000000000000" })
      ).status,
      400,
    );
    const first = (await mgr.post("/api/tasks").send(base)).body.data;
    const second = (
      await mgr.post("/api/tasks").send({ ...base, title: "Second" })
    ).body.data;
    await mgr.post("/api/tasks").send({ ...base, projectId: b.id });
    assert.equal(
      (await mgr.get("/api/projects/" + a.id)).body.data.status,
      "planned",
    );
    assert.equal(
      (
        await mgr
          .patch("/api/tasks/" + first.id)
          .send({ startDate: "2026-03-01" })
      ).status,
      400,
    );
    await mgr.patch("/api/tasks/" + first.id).send({ status: "done" });
    const mixed = (await mgr.get("/api/projects/" + a.id)).body.data;
    assert.equal(mixed.progress, 50);
    assert.equal(mixed.status, "in_progress");
    assert.equal(
      (await mgr.get("/api/tasks").query({ projectId: a.id })).body.data.length,
      2,
    );
    assert.equal(
      (await mgr.get("/api/tasks/" + first.id)).body.data.status,
      "done",
    );
    assert.equal(
      (
        await mgr
          .delete("/api/tasks/" + second.id)
          .set("Content-Type", "application/json")
      ).status,
      204,
    );
    assert.equal(
      (await mgr.get("/api/projects/" + a.id)).body.data.status,
      "done",
    );
    const risk = (
      await mgr.post("/api/risks").send({
        projectId: a.id,
        title: "Risk",
        probability: 1,
        impact: 5,
        mitigation: "",
        assigneeId: null,
        status: "active",
      })
    ).body.data;
    assert.equal(risk.level, "low");
    const updated = (
      await mgr.patch("/api/risks/" + risk.id).send({ probability: 2 })
    ).body.data;
    assert.equal(updated.score, 10);
    assert.equal(updated.level, "medium");
    assert.equal(
      (await mgr.get("/api/risks").query({ projectId: b.id })).body.data.length,
      0,
    );
    assert.equal(
      (await mgr.patch("/api/risks/" + risk.id).send({ score: 99 })).status,
      400,
    );
    assert.equal(
      (
        await mgr
          .delete("/api/risks/" + risk.id)
          .set("Content-Type", "application/json")
      ).status,
      204,
    );
    const primary = (await mgr.get("/api/members")).body.data[0];
    assert.equal(
      (
        await mgr
          .delete("/api/members/" + primary.id)
          .set("Content-Type", "application/json")
      ).status,
      403,
    );
    assert.equal(
      (
        await mgr
          .patch("/api/members/" + primary.id)
          .send({ email: "other@example.test" })
      ).status,
      403,
    );
  } finally {
    db.close();
  }
});
