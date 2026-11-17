import { test, expect } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";

const productionUrl = process.env.TEAMFLOW_PRODUCTION_URL;
test("production compiled app uses only its local origin", async ({ page }) => {
  test.skip(
    !productionUrl,
    "Set TEAMFLOW_PRODUCTION_URL after starting the compiled application.",
  );
  const target = new URL(productionUrl!);
  expect(["localhost", "127.0.0.1"]).toContain(target.hostname);
  const unexpected: string[] = [],
    errors: string[] = [];
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (
      ["http:", "https:"].includes(url.protocol) &&
      url.origin !== target.origin
    ) {
      unexpected.push(url.origin);
      return route.abort();
    }
    return route.continue();
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(target.origin + "/projects");
  await expect(page).toHaveURL(target.origin + "/login");
  const demo = JSON.parse(
    readFileSync("apps/backend/data/demo-credentials.json", "utf8"),
  );
  await page.getByLabel("Email", { exact: true }).fill(demo.manager.email);
  await page.getByLabel("Parol", { exact: true }).fill(demo.manager.password);
  await page.getByRole("button", { name: /^Kirish/ }).click();
  await expect(page).toHaveURL(target.origin + "/dashboard");
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
  const expectedCounts = { projects: 1, tasks: 12, members: 5, risks: 4 };
  for (const [collection, count] of Object.entries(expectedCounts)) {
    const response = await page.request.get(
      target.origin + "/api/" + collection,
    );
    expect(response.status()).toBe(200);
    expect((await response.json()).data).toHaveLength(count);
  }
  mkdirSync("docs/screenshots", { recursive: true });
  await page.screenshot({
    path: "docs/screenshots/dashboard-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.screenshot({
    path: "docs/screenshots/dashboard-mobile.png",
    fullPage: true,
  });
  expect(unexpected).toEqual([]);
  expect(errors).toEqual([]);
  await page.getByRole("button", { name: "Chiqish", exact: true }).click();
  await expect(page).toHaveURL(target.origin + "/login");
});
