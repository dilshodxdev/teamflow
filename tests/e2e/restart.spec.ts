import { test, expect } from "@playwright/test";
import { readFileSync, statSync, utimesSync } from "node:fs";
import { execFileSync } from "node:child_process";

const demo = JSON.parse(
  readFileSync("apps/backend/data/demo-credentials.json", "utf8"),
);
const backendPid = () =>
  Number(
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess",
      ],
      { encoding: "utf8", windowsHide: true },
    ).trim(),
  );

test("SQLite data and browser session survive an actual backend watcher restart", async ({
  page,
}) => {
  test.setTimeout(45_000);
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(demo.manager.email);
  await page.getByLabel("Parol", { exact: true }).fill(demo.manager.password);
  await page.getByRole("button", { name: /^Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const response = await page.request.post("/api/projects", {
    data: {
      name: "Temporary restart acceptance",
      description: "Must persist across process restart",
      startDate: "2026-11-17",
      dueDate: "2026-11-18",
    },
  });
  expect(response.status()).toBe(201);
  const project = (await response.json()).data;
  try {
    const previous = backendPid();
    expect(previous).toBeGreaterThan(0);
    // Notify the running tsx watcher without changing any source contents.
    const source = "apps/backend/src/server.ts";
    const stats = statSync(source);
    utimesSync(source, stats.atime, new Date());
    await expect
      .poll(backendPid, { timeout: 15_000, intervals: [250, 500] })
      .not.toBe(previous);
    await expect
      .poll(
        async () => {
          try {
            return (await page.request.get("/api/health")).status();
          } catch {
            return 0;
          }
        },
        { timeout: 10_000 },
      )
      .toBe(200);
    expect(backendPid()).toBeGreaterThan(0);
    expect(backendPid()).not.toBe(previous);
    await page.goto("/projects");
    await page.reload();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(
      page.getByRole("heading", { name: project.name, exact: true }),
    ).toBeVisible();
    expect(
      (await page.request.get(`/api/projects/${project.id}`)).status(),
    ).toBe(200);
  } finally {
    await page.request.delete(`/api/projects/${project.id}`, {
      headers: { "Content-Type": "application/json" },
    });
  }
});
