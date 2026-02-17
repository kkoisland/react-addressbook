import { expect, test } from "@playwright/test";
import {
	clearLocalStorage,
	createAddressJp,
	createAddressUs,
	setupLocalStorage,
} from "./testHelpers";

test.describe("Print Preview", () => {
	const jpAddress = createAddressJp({
		id: "test-jp-1",
		name: "山田太郎",
		statusPerm: "statusPermYes",
		printType: "labelJp",
	});
	const usAddress = createAddressUs({
		id: "test-us-1",
		name: "John Smith",
		statusPerm: "statusPermYes",
		printType: "labelUs",
	});

	test.beforeEach(async ({ page }) => {
		await clearLocalStorage(page);
		await setupLocalStorage(page, [jpAddress, usAddress]);
		// Wait for list to render
		await expect(page.getByText("2 of 2 addresses")).toBeVisible();
	});

	test("should enter print mode and show print buttons", async ({ page }) => {
		await page.getByRole("button", { name: "Print" }).click();

		await expect(page.getByRole("button", { name: /Label J/ })).toBeVisible();
		await expect(page.getByRole("button", { name: /Label US/ })).toBeVisible();
		await expect(page.getByRole("button", { name: "Custom" })).toBeVisible();
	});

	test("should show correct counts on print buttons", async ({ page }) => {
		await page.getByRole("button", { name: "Print" }).click();

		await expect(
			page.getByRole("button", { name: "Label J (1)" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Label US (1)" }),
		).toBeVisible();
	});

	test("should navigate to PrintPreview when Label J is clicked", async ({
		page,
	}) => {
		await page.getByRole("button", { name: "Print" }).click();
		await page.getByRole("button", { name: "Label J (1)" }).click();

		await expect(page.getByText("Print Preview")).toBeVisible();
		await expect(page.getByRole("button", { name: /Print \(/ })).toBeVisible();
	});

	test("should navigate to PrintPreview when Label US is clicked", async ({
		page,
	}) => {
		await page.getByRole("button", { name: "Print" }).click();
		await page.getByRole("button", { name: "Label US (1)" }).click();

		await expect(page.getByText("Print Preview")).toBeVisible();
	});

	test("should enter search mode when Custom is clicked", async ({ page }) => {
		await page.getByRole("button", { name: "Print" }).click();
		await page.getByRole("button", { name: "Custom" }).click();

		// Should show search panel
		await expect(page.locator("h2", { hasText: "Search" })).toBeVisible();
	});

	test("should return from PrintPreview with Back button", async ({ page }) => {
		await page.getByRole("button", { name: "Print" }).click();
		await page.getByRole("button", { name: "Label J (1)" }).click();
		await expect(page.getByText("Print Preview")).toBeVisible();

		await page.getByRole("button", { name: "Back" }).click();
		await expect(page.locator("h1")).toHaveText("Address Book");
	});

	test("should exit print mode with close button", async ({ page }) => {
		await page.getByRole("button", { name: "Print" }).click();
		await expect(page.getByRole("button", { name: /Label J/ })).toBeVisible();

		// Click close (✕) button
		await page.getByRole("button", { name: "✕" }).click();

		// Should return to normal mode
		await expect(page.getByRole("button", { name: "+ New" })).toBeVisible();
	});

	test("should exit print mode with Escape key", async ({ page }) => {
		await page.getByRole("button", { name: "Print" }).click();
		await expect(page.getByRole("button", { name: /Label J/ })).toBeVisible();

		await page.keyboard.press("Escape");

		await expect(page.getByRole("button", { name: "+ New" })).toBeVisible();
	});
});

test.describe("Sender Print Preview", () => {
	test.beforeEach(async ({ page }) => {
		await clearLocalStorage(page);
		await page.goto("/");
		await expect(page.locator("h1")).toHaveText("Address Book");
	});

	test("should navigate to Sender page", async ({ page }) => {
		await page.getByRole("button", { name: "Sender" }).click();
		await expect(page.getByText("Sender Label")).toBeVisible();
	});

	test("should show name and address in preview", async ({ page }) => {
		await page.getByRole("button", { name: "Sender" }).click();
		await expect(page.getByText("Sender Label")).toBeVisible();

		// Fill in sender info
		await page.getByPlaceholder("Your name").fill("テスト送信者");
		await page.getByPlaceholder("Your address").fill("東京都港区1-2-3");

		// Verify preview shows the entered text (use print-hide area for the visible preview)
		const previewArea = page.locator(".print-hide .print-label");
		await expect(previewArea).toContainText("テスト送信者");
		await expect(previewArea).toContainText("東京都港区1-2-3");
	});

	test("should switch label type", async ({ page }) => {
		await page.getByRole("button", { name: "Sender" }).click();

		// Default is Label US, change to Label J
		const labelTypeSelect = page.locator("select").first();
		await labelTypeSelect.selectOption("labelJp");

		// Show JAPAN checkbox should appear for Label J
		await expect(page.getByText("Show JAPAN")).toBeVisible();
	});

	test("should return to main page with Back button", async ({ page }) => {
		await page.getByRole("button", { name: "Sender" }).click();
		await expect(page.getByText("Sender Label")).toBeVisible();

		await page.getByRole("button", { name: "Back" }).click();
		await expect(page.locator("h1")).toHaveText("Address Book");
	});

	test("should return to main page with Escape key", async ({ page }) => {
		await page.getByRole("button", { name: "Sender" }).click();
		await expect(page.getByText("Sender Label")).toBeVisible();

		await page.keyboard.press("Escape");
		await expect(page.locator("h1")).toHaveText("Address Book");
	});
});
