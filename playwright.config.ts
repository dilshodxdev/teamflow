import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 20_000,
  expect: { timeout: 2_000 },
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    channel: "msedge",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    timezoneId: "UTC",
    trace: "off",
    screenshot: "only-on-failure",
  },
});
