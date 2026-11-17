import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { randomBytes, randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const credentials = JSON.parse(
  readFileSync("apps/backend/data/demo-credentials.json", "utf8"),
);
async function login(page: Page) {
  await page.goto("/login");
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill(credentials.manager.email);
  await page
    .getByRole("textbox", { name: "Parol", exact: true })
    .fill(credentials.manager.password);
  await page.getByRole("button", { name: /^Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("button", { name: /Chiqish/ })).toBeVisible();
}

test("invalid login preserves input and displays the server error", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("wrong@example.test");
  await page
    .getByRole("textbox", { name: "Parol", exact: true })
    .fill("incorrect-password");
  await page.getByRole("button", { name: /^Kirish/ }).click();
  await expect(
    page.getByText("Invalid credentials", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Email", exact: true }),
  ).toHaveValue("wrong@example.test");
});

test("project loading has visible progress feedback", async ({ page }) => {
  await login(page);
  await page.route("**/api/projects", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      await route.continue();
    } catch {
      /* page may close during teardown */
    }
  });
  await page.goto("/projects");
  await expect(page.getByRole("status")).toContainText("Yuklanmoqda");
});

test("project fetch errors are visible and can be retried", async ({
  page,
}) => {
  await login(page);
  await page.route("**/api/projects", (route) =>
    route.fulfill({
      status: 503,
      json: {
        error: {
          code: "TEST_FAILURE",
          message: "Sinov: loyiha serveri vaqtincha ishlamayapti",
        },
      },
    }),
  );
  await page.goto("/projects");
  await expect(page.getByRole("alert")).toContainText(
    "Sinov: loyiha serveri vaqtincha ishlamayapti",
  );
  await page.unroute("**/api/projects");
  await page
    .getByRole("button", { name: "Qayta urinish", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("failed logout keeps the authenticated view and displays an error", async ({
  page,
}) => {
  await login(page);
  await page.route("**/api/auth/logout", (route) =>
    route.fulfill({
      status: 503,
      json: {
        error: {
          code: "TEST_FAILURE",
          message: "Sinov: chiqish amalga oshmadi",
        },
      },
    }),
  );
  await page.getByRole("button", { name: /Chiqish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("alert")).toContainText(
    "Sinov: chiqish amalga oshmadi",
  );
});

test("a revoked session leaves protected pages after the next API request", async ({
  page,
}) => {
  await login(page);
  await page.route("**/api/projects", (route) =>
    route.fulfill({
      status: 401,
      json: { error: { code: "UNAUTHORIZED", message: "Session expired" } },
    }),
  );
  await page.goto("/projects");
  await expect(page).toHaveURL(/\/login$/);
});

test("calendar opens the Tashkent month at a UTC month boundary", async ({
  page,
}) => {
  await login(page);
  await page.clock.install({ time: new Date("2026-11-30T20:30:00.000Z") });
  await page.goto("/calendar");
  await expect(page.getByText("Dekabr 2026", { exact: true })).toBeVisible();
});

test("dashboard task details follow the selected project including empty projects", async ({
  page,
}) => {
  await login(page);
  const response = await page.request.post("/api/projects", {
    data: {
      name: "Temporary empty-filter acceptance",
      description: "Automated test record",
      startDate: "2026-11-17",
      dueDate: "2026-11-18",
    },
  });
  expect(response.status()).toBe(201);
  const project = (await response.json()).data;
  try {
    await page.goto("/dashboard");
    await page.getByRole("combobox").selectOption(project.id);
    await expect(
      page.getByText("Tanlangan vazifa", { exact: true }),
    ).toHaveCount(0);
  } finally {
    await page.request.delete(`/api/projects/${project.id}`, {
      headers: { "Content-Type": "application/json" },
    });
  }
});

test("project dialog announces its name and contains keyboard focus", async ({
  page,
}) => {
  await login(page);
  await page.goto("/projects");
  const trigger = page.getByRole("button", { name: /Yangi loyiha/ });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveAccessibleName("Yangi loyiha yaratish");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.locator(":focus")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("dashboard timeline uses task dates and omits tasks outside the displayed week", async ({
  page,
}) => {
  await login(page);
  const response = await page.request.post("/api/projects", {
    data: {
      name: "Temporary timeline acceptance",
      description: "",
      startDate: "2026-11-01",
      dueDate: "2026-11-30",
    },
  });
  const project = (await response.json()).data;
  try {
    for (const [title, startDate, dueDate] of [
      ["Outside current week", "2026-11-01", "2026-11-02"],
      ["Earlier timeline task", "2026-11-17", "2026-11-18"],
      ["Later timeline task", "2026-11-20", "2026-11-21"],
    ]) {
      expect(
        (
          await page.request.post("/api/tasks", {
            data: {
              projectId: project.id,
              title,
              description: "",
              assigneeId: null,
              startDate,
              dueDate,
              priority: "medium",
              status: "todo",
            },
          })
        ).status(),
      ).toBe(201);
    }
    await page.clock.install({ time: new Date("2026-11-17T10:00:00.000Z") });
    await page.goto("/dashboard");
    await page.getByRole("combobox").selectOption(project.id);
    await expect(
      page.getByText("Outside current week", { exact: true }),
    ).toHaveCount(0);
    const early = page.getByTitle(
      "Earlier timeline task (2026-11-17 — 2026-11-18)",
      { exact: true },
    );
    const late = page.getByTitle(
      "Later timeline task (2026-11-20 — 2026-11-21)",
      { exact: true },
    );
    await expect(early).toBeVisible();
    await expect(late).toBeVisible();
    const first = (await early.boundingBox())!,
      last = (await late.boundingBox())!,
      track = (await early.locator("..").boundingBox())!;
    expect((last.x - first.x) / track.width).toBeCloseTo(3 / 7, 1);
  } finally {
    await page.request.delete(`/api/projects/${project.id}`, {
      headers: { "Content-Type": "application/json" },
    });
  }
});

test("Back navigation restores an unfiltered Kanban URL", async ({ page }) => {
  await login(page);
  const project = (await (await page.request.get("/api/projects")).json())
    .data[0];
  await page.goto("/tasks");
  const filter = page.getByRole("combobox").filter({
    has: page.getByRole("option", { name: "Barcha loyihalar", exact: true }),
  });
  await filter.selectOption(project.id);
  await expect(page).toHaveURL(new RegExp(project.id));
  await page.goBack();
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(filter).toHaveValue("");
});

test("pending-account logout failures stay visible without an unhandled rejection", async ({
  page,
}) => {
  const email = `pending-logout-${randomUUID()}@example.test`;
  const registration = await page.request.post("/api/auth/register", {
    data: {
      fullName: "Temporary pending logout",
      email,
      password: randomBytes(24).toString("base64url"),
    },
  });
  expect(registration.status()).toBe(201);
  const userId = (await registration.json()).data.id;
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto("/pending");
    await expect(
      page.getByRole("heading", { name: "Tasdiqlash kutilmoqda" }),
    ).toBeVisible();
    await page.route("**/api/auth/logout", (route) =>
      route.fulfill({
        status: 503,
        json: {
          error: {
            code: "TEST_FAILURE",
            message: "Sinov: pending chiqish amalga oshmadi",
          },
        },
      }),
    );
    await page.getByRole("button", { name: /Chiqish/ }).click();
    await expect(page).toHaveURL(/\/pending$/);
    await expect(page.getByRole("alert")).toContainText(
      "Sinov: pending chiqish amalga oshmadi",
    );
    expect(errors).toEqual([]);
  } finally {
    const db = new DatabaseSync("apps/backend/data/teamflow.db");
    try {
      db.exec("PRAGMA foreign_keys=ON");
      db.prepare("DELETE FROM users WHERE id=? AND email=?").run(userId, email);
    } finally {
      db.close();
    }
  }
});

test("small-screen pages fit the viewport and the mobile navigation works", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  for (const route of [
    "dashboard",
    "projects",
    "tasks",
    "calendar",
    "team",
    "risks",
  ]) {
    await page.goto("/" + route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(0);
    const dimensions = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));
    expect
      .soft(dimensions.content, route + " root overflow")
      .toBeLessThanOrEqual(dimensions.viewport + 1);
  }
  await page.getByRole("button", { name: "Menyu", exact: true }).click();
  await page.getByRole("link", { name: /Loyihalar/ }).click();
  await expect(page).toHaveURL(/\/projects$/);
});
