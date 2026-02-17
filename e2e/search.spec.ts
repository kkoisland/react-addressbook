import { expect, test } from "@playwright/test";
import {
	clearLocalStorage,
	createAddressJp,
	createAddressUs,
	setupLocalStorage,
} from "./testHelpers";

test.describe("Search and Filter", () => {
	const jpAddress = createAddressJp({
		id: "test-jp-1",
		name: "山田太郎",
		address: "東京都渋谷区神宮前1-2-3",
		postalCodeJP: "150-0001",
	});
	const usAddress = createAddressUs({
		id: "test-us-1",
		name: "John Smith",
		address: "123 Main Street, San Francisco, CA 94102, USA",
	});

	test.beforeEach(async ({ page }) => {
		await clearLocalStorage(page);
		await setupLocalStorage(page, [jpAddress, usAddress]);
		// Wait for list to render
		await expect(page.getByText("2 of 2 addresses")).toBeVisible();
	});

	test("should show all addresses initially", async ({ page }) => {
		await expect(page.getByRole("cell", { name: "山田太郎" })).toBeVisible();
		await expect(page.getByRole("cell", { name: "John Smith" })).toBeVisible();
	});

	test("should filter by quick search text", async ({ page }) => {
		const searchInput = page.getByLabel("Search query");
		await searchInput.fill("山田");
		await expect(page.getByText("1 of 2 addresses")).toBeVisible();
		await expect(page.getByRole("cell", { name: "山田太郎" })).toBeVisible();
		await expect(
			page.getByRole("cell", { name: "John Smith" }),
		).not.toBeVisible();
	});

	test("should clear quick search with clear button", async ({ page }) => {
		const searchInput = page.getByLabel("Search query");
		await searchInput.fill("山田");
		await expect(page.getByText("1 of 2 addresses")).toBeVisible();

		// Click the clear (✕) button
		await page.getByLabel("Clear search").click();
		await expect(page.getByText("2 of 2 addresses")).toBeVisible();
	});

	test("should filter by search field selection", async ({ page }) => {
		// Change search field to "Name"
		await page.getByLabel("Search field").selectOption("name");
		const searchInput = page.getByLabel("Search query");
		await searchInput.fill("Smith");
		await expect(page.getByText("1 of 2 addresses")).toBeVisible();
		await expect(page.getByRole("cell", { name: "John Smith" })).toBeVisible();
	});

	test("should open Find panel and search with advanced filters", async ({
		page,
	}) => {
		// Click Find button
		await page.getByRole("button", { name: "Find" }).click();
		await expect(page.locator("h2", { hasText: "Search" })).toBeVisible();

		// Search by name in the search panel
		const nameInput = page.locator('input[name="search-filter-name"]');
		await nameInput.fill("山田");

		await expect(page.getByText("1 of 2 addresses")).toBeVisible();
		await expect(page.getByRole("cell", { name: "山田太郎" })).toBeVisible();
	});

	test("should close Find panel with close button", async ({ page }) => {
		await page.getByRole("button", { name: "Find" }).click();
		await expect(page.locator("h2", { hasText: "Search" })).toBeVisible();

		// Click close (✕) button — it's next to the Print Preview button in search mode
		await page.getByRole("button", { name: "✕" }).click();

		// Should return to normal mode with all addresses
		await expect(page.getByText("2 of 2 addresses")).toBeVisible();
		await expect(page.getByRole("button", { name: "Find" })).toBeVisible();
	});

	test("should close Find panel with Escape key", async ({ page }) => {
		await page.getByRole("button", { name: "Find" }).click();
		await expect(page.locator("h2", { hasText: "Search" })).toBeVisible();

		await page.keyboard.press("Escape");

		await expect(page.getByText("2 of 2 addresses")).toBeVisible();
		await expect(page.getByRole("button", { name: "Find" })).toBeVisible();
	});

	test("should filter by dropdown in advanced search (statusPerm)", async ({
		page,
	}) => {
		await page.getByRole("button", { name: "Find" }).click();

		// Both test addresses have statusPerm = "statusPermYes"
		// Filter by "No" should show 0
		const searchPanel = page.locator("form", { hasText: "Search" });
		const statusPermSelect = searchPanel.locator("select").nth(1);
		await statusPermSelect.selectOption("statusPermNo");

		await expect(page.getByText("0 of 2 addresses")).toBeVisible();
	});
});
