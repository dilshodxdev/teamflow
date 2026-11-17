import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { createApp } from "../apps/backend/dist/app.js";

// This catches production packaging/static-path errors that Vite and Supertest
// cannot detect. It never opens or resets the user's database.
test("compiled production app serves SPA assets and real authenticated REST writes", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "teamflow-production-"));
  const manager = {
    fullName: "Production test manager",
    email: "production-manager@example.test",
    password: randomBytes(24).toString("base64url"),
  };
  const { app, db } = createApp({
    databasePath: path.join(directory, "test.db"),
    bootstrapManager: manager,
  });
  let server;
  try {
    server = await new Promise((resolve, reject) => {
      const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
      listening.once("error", reject);
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    const call = (route, { method = "GET", body, cookie } = {}) =>
      fetch(base + route, {
        method,
        headers: {
          ...(method === "GET"
            ? {}
            : { "Content-Type": "application/json", Origin: base }),
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    assert.equal((await call("/api/health")).status, 200);
    const page = await call("/");
    assert.equal(page.status, 200, "built frontend must be served by Express");
    const html = await page.text();
    assert.match(html, /id=["']root["']/);
    const script = html.match(/<script\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1];
    assert.ok(script, "built HTML must reference a JavaScript asset");
    const asset = await fetch(new URL(script, base));
    assert.equal(asset.status, 200);
    assert.match(asset.headers.get("content-type"), /javascript/);
    const deepLink = await call("/projects");
    assert.equal(deepLink.status, 200);
    assert.equal(
      await deepLink.text(),
      html,
      "SPA deep links must receive the entry document",
    );
    assert.equal((await call("/api/projects")).status, 401);
    const login = await call("/api/auth/login", {
      method: "POST",
      body: { email: manager.email, password: manager.password },
    });
    assert.equal(login.status, 201);
    assert.equal((await login.json()).data.role, "manager");
    const cookie = login.headers.get("set-cookie")?.split(";")[0];
    assert.ok(cookie, "login must set a session cookie");
    const created = await call("/api/projects", {
      method: "POST",
      cookie,
      body: {
        name: "Production integration",
        description: "Temporary acceptance record",
        startDate: "2026-11-17",
        dueDate: "2026-11-18",
      },
    });
    assert.equal(created.status, 201);
    const project = (await created.json()).data;
    assert.equal(project.status, "planned");
    assert.equal(project.progress, 0);
    assert.equal(
      (
        await call(`/api/projects/${project.id}`, {
          method: "PATCH",
          cookie,
          body: { name: "Production updated" },
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await call(`/api/projects/${project.id}`, {
          method: "DELETE",
          cookie,
          body: {},
        })
      ).status,
      204,
    );
    const register = await call("/api/auth/register", {
      method: "POST",
      body: {
        fullName: "Production pending",
        email: "production-pending@example.test",
        password: randomBytes(24).toString("base64url"),
      },
    });
    assert.equal(register.status, 201);
    assert.equal((await register.json()).data.role, "pending");
    const pendingCookie = register.headers.get("set-cookie")?.split(";")[0];
    assert.equal(
      (await call("/api/projects", { cookie: pendingCookie })).status,
      403,
    );
    assert.equal(
      (await call("/api/auth/logout", { method: "POST", cookie, body: {} }))
        .status,
      204,
    );
    assert.equal((await call("/api/auth/me", { cookie })).status, 401);
    const missing = await call("/api/does-not-exist");
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, "NOT_FOUND");
  } finally {
    if (server)
      await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    db.close();
    const resolved = path.resolve(directory);
    assert.ok(resolved.startsWith(path.resolve(tmpdir()) + path.sep));
    assert.ok(path.basename(resolved).startsWith("teamflow-production-"));
    rmSync(resolved, { recursive: true, force: true });
  }
});
