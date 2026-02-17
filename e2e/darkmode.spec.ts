import { expect, test } from "@playwright/test";
import { clearLocalStorage } from "./testHelpers";

test.describe("Dark Mode", () => {
	test.beforeEach(async ({ page }) => {
		await clearLocalStorage(page);
	});

	test("should toggle from light to dark mode", async ({ page }) => {
		// Emulate light color scheme to start with known state
		await page.emulateMedia({ colorScheme: "light" });
		await page.goto("/");
		await expect(page.locator("h1")).toHaveText("Address Book");

		// Should start in light mode (no dark class)
		await expect(page.locator("html")).not.toHaveClass(/dark/);

		// Click theme toggle button (moon emoji in light mode)
		await page.getByRole("button", { name: "🌙" }).click();

		// Should now be in dark mode
		await expect(page.locator("html")).toHaveClass(/dark/);
	});

	test("should toggle from dark back to light mode", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "light" });
		await page.goto("/");
		await expect(page.locator("h1")).toHaveText("Address Book");

		// Toggle to dark
		await page.getByRole("button", { name: "🌙" }).click();
		await expect(page.locator("html")).toHaveClass(/dark/);

		// Toggle back to light
		await page.getByRole("button", { name: "☀️" }).click();
		await expect(page.locator("html")).not.toHaveClass(/dark/);
	});

	test("should persist dark mode after page reload", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "light" });
		await page.goto("/");
		await expect(page.locator("h1")).toHaveText("Address Book");

		// Toggle to dark
		await page.getByRole("button", { name: "🌙" }).click();
		await expect(page.locator("html")).toHaveClass(/dark/);

		// Reload
		await page.reload();
		await page.waitForLoadState("networkidle");

		// Should still be dark
		await expect(page.locator("html")).toHaveClass(/dark/);
	});
});
