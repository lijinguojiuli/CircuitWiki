import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    browserName: "chromium",
    headless: true,
    launchOptions: { channel: process.env.PLAYWRIGHT_CHANNEL || "chromium" },
  },
  reporter: "list",
});
