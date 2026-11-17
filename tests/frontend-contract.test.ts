import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { createApp } from "../apps/backend/src/app.ts";
import { request } from "../apps/frontend/src/services/api.ts";
import { projectsService } from "../apps/frontend/src/services/projects.ts";
import { getTodayDateString } from "../apps/frontend/src/utils/date.ts";

test("frontend HTTP client sends JSON content type for a bodyless authenticated DELETE", async () => {
  const manager = {
    fullName: "Client test manager",
    email: "client-manager@example.test",
    password: randomBytes(24).toString("base64url"),
  };
  const { app, db } = createApp({
    databasePath: ":memory:",
    bootstrapManager: manager,
  });
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const base = `http://127.0.0.1:${address.port}/api`;
    const login = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: manager.email,
        password: manager.password,
      }),
    });
    assert.equal(login.status, 201);
    const cookie = login.headers.get("set-cookie")!.split(";")[0];
    const created = await request<{ id: string }>(`${base}/projects`, {
      headers: { Cookie: cookie },
      data: {
        name: "Client regression",
        description: "",
        startDate: "2026-11-17",
        dueDate: "2026-11-18",
      },
    });
    await request<void>(`${base}/projects/${created.id}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    const response = await fetch(`${base}/projects/${created.id}`, {
      headers: { Cookie: cookie },
    });
    assert.equal(response.status, 404);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    db.close();
  }
});

test("frontend today uses Asia/Tashkent across the UTC midnight boundary", (t) => {
  const previousTimezone = process.env.TZ;
  process.env.TZ = "UTC";
  t.mock.timers.enable({
    apis: ["Date"],
    now: Date.parse("2026-11-16T20:30:00.000Z"),
  });
  try {
    assert.equal(getTodayDateString(), "2026-11-17");
  } finally {
    t.mock.timers.reset();
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
});

test("the final application reads real projects despite a saved browser mock flag", async () => {
  const manager = {
    fullName: "Real data manager",
    email: "real-data@example.test",
    password: randomBytes(24).toString("base64url"),
  };
  const { app, db } = createApp({
    databasePath: ":memory:",
    bootstrapManager: manager,
  });
  const server = app.listen(0, "127.0.0.1");
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalFetch = globalThis.fetch;
  try {
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const base = `http://127.0.0.1:${address.port}`;
    const login = await originalFetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: manager.email,
        password: manager.password,
      }),
    });
    const cookie = login.headers.get("set-cookie")!.split(";")[0];
    const created = await request<{ id: string }>(`${base}/api/projects`, {
      headers: { Cookie: cookie },
      data: {
        name: "Real backend record",
        description: "",
        startDate: "2026-11-17",
        dueDate: "2026-11-18",
      },
    });
    // Translate the browser's relative URL and session into a real HTTP call.
    // The transport is not mocked and no browser storage is inspected.
    globalThis.fetch = (input, init) => {
      const headers = new Headers(init?.headers);
      headers.set("Cookie", cookie);
      return originalFetch(new URL(String(input), base), { ...init, headers });
    };
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { localStorage: { getItem: () => "true" } },
    });
    const projects = await projectsService.getProjects();
    assert.equal(projects.length, 1);
    assert.equal(projects[0].id, created.id);
    assert.equal(projects[0].name, "Real backend record");
  } finally {
    globalThis.fetch = originalFetch;
    if (previousWindow)
      Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    db.close();
  }
});
