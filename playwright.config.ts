import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	workers: isCI ? 1 : undefined,
	reporter: "html",
	timeout: isCI ? 60_000 : 30_000,
	use: {
		baseURL: "http://localhost:5173",
		trace: "on-first-retry",
	},
	projects: isCI
		? [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
		: [
				{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
				{ name: "firefox", use: { ...devices["Desktop Firefox"] } },
				{ name: "webkit", use: { ...devices["Desktop Safari"] } },
			],
	webServer: {
		command: "pnpm dev",
		url: "http://localhost:5173",
		reuseExistingServer: !isCI,
	},
});
