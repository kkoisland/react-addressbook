import { expect, test } from "@playwright/test";
import {
	clearLocalStorage,
	createAddressJp,
	setupLocalStorage,
} from "./testHelpers";

test.describe("Basic App", () => {
	test.beforeEach(async ({ page }) => {
		await clearLocalStorage(page);
	});

	test("should display the app title", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("h1")).toHaveText("Address Book");
	});

	test("should display address list with test data", async ({ page }) => {
		const address = createAddressJp({ id: "test-1", name: "テスト太郎" });
		await setupLocalStorage(page, [address]);
		await expect(page.getByText("テスト太郎")).toBeVisible();
	});
});
