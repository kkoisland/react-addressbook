import { expect, test } from "@playwright/test";
import {
	clearLocalStorage,
	createAddressJp,
	setupLocalStorage,
} from "./testHelpers";

test.describe("CRUD Operations", () => {
	test.beforeEach(async ({ page }) => {
		await clearLocalStorage(page);
	});

	test("should show empty state when no addresses exist", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("h1")).toHaveText("Address Book");
		await expect(page.getByText("0 of 0 addresses")).toBeVisible();
		await expect(
			page.getByText('No addresses yet. Click "+ New" to add one.'),
		).toBeVisible();
		await expect(
			page.getByText("Select an address or create a new one"),
		).toBeVisible();
	});

	test("should show address list with table headers", async ({ page }) => {
		const address = createAddressJp({ id: "test-1", name: "山田太郎" });
		await setupLocalStorage(page, [address]);
		await expect(page.locator("thead th", { hasText: "Name" })).toBeVisible();
		await expect(
			page.locator("thead th", { hasText: "Address" }),
		).toBeVisible();
		await expect(page.locator("thead th", { hasText: "Status" })).toBeVisible();
		await expect(page.getByText("1 of 1 addresses")).toBeVisible();
	});

	test("should create a new address via New button", async ({ page }) => {
		await page.goto("/");
		await page.getByRole("button", { name: "+ New" }).click();
		await expect(page.getByText("New Address")).toBeVisible();

		// Fill in form
		await page.getByLabel("Name").fill("テスト新規");
		await page.getByLabel("Title").fill("様");
		await page.getByLabel("Postal Code (JP)").fill("100-0001");
		await page.getByLabel("Address").fill("東京都千代田区");

		// Save
		await page.getByRole("button", { name: "Save" }).click();

		// Verify it appears in the list (use cell to avoid matching form preview)
		await expect(page.getByRole("cell", { name: "テスト新規" })).toBeVisible();
		await expect(page.getByText("1 of 1 addresses")).toBeVisible();
		// After save, form switches to Edit mode
		await expect(page.getByText("Edit Address")).toBeVisible();
	});

	test("should select an address and show form", async ({ page }) => {
		const address = createAddressJp({
			id: "test-1",
			name: "山田太郎",
			address: "東京都渋谷区神宮前1-2-3",
		});
		await setupLocalStorage(page, [address]);

		// Click on the address in the list
		await page.getByRole("cell", { name: "山田太郎" }).click();

		// Verify form is shown with Edit Address heading
		await expect(page.getByText("Edit Address")).toBeVisible();
		// Verify form is populated
		await expect(page.getByLabel("Name")).toHaveValue("山田太郎");
	});

	test("should update an existing address", async ({ page }) => {
		const address = createAddressJp({ id: "test-1", name: "山田太郎" });
		await setupLocalStorage(page, [address]);

		// Select the address
		await page.getByRole("cell", { name: "山田太郎" }).click();
		await expect(page.getByText("Edit Address")).toBeVisible();

		// Edit the name
		await page.getByLabel("Name").clear();
		await page.getByLabel("Name").fill("山田花子");

		// Update
		await page.getByRole("button", { name: "Update" }).click();

		// Verify the list reflects the change
		await expect(page.getByRole("cell", { name: "山田花子" })).toBeVisible();
		await expect(
			page.getByRole("cell", { name: "山田太郎" }),
		).not.toBeVisible();
	});

	test("should delete an address with confirmation", async ({ page }) => {
		const address = createAddressJp({ id: "test-1", name: "山田太郎" });
		await setupLocalStorage(page, [address]);

		// Select the address
		await page.getByRole("cell", { name: "山田太郎" }).click();

		// Click Delete and accept the confirmation dialog
		page.on("dialog", (dialog) => dialog.accept());
		await page.getByRole("button", { name: "Delete" }).click();

		// Verify address is removed
		await expect(
			page.getByRole("cell", { name: "山田太郎" }),
		).not.toBeVisible();
		await expect(page.getByText("0 of 0 addresses")).toBeVisible();
	});

	test("should duplicate an address with confirmation", async ({ page }) => {
		const address = createAddressJp({ id: "test-1", name: "山田太郎" });
		await setupLocalStorage(page, [address]);

		// Select the address
		await page.getByRole("cell", { name: "山田太郎" }).click();

		// Click Duplicate and accept the confirmation dialog
		page.on("dialog", (dialog) => dialog.accept());
		await page.getByRole("button", { name: "Duplicate" }).click();

		// Verify there are now 2 addresses
		await expect(page.getByText("2 of 2 addresses")).toBeVisible();
	});

	test("should clear form and return to New mode", async ({ page }) => {
		const address = createAddressJp({ id: "test-1", name: "山田太郎" });
		await setupLocalStorage(page, [address]);

		// Select the address
		await page.getByRole("cell", { name: "山田太郎" }).click();
		await expect(page.getByText("Edit Address")).toBeVisible();

		// Click Clear
		await page.getByRole("button", { name: "Clear" }).click();

		// Form should be in New mode with empty fields
		await expect(page.getByText("New Address")).toBeVisible();
		await expect(page.getByLabel("Name")).toHaveValue("");
	});

	test("should cancel editing and return to default state", async ({
		page,
	}) => {
		const address = createAddressJp({ id: "test-1", name: "山田太郎" });
		await setupLocalStorage(page, [address]);

		// Select the address
		await page.getByRole("cell", { name: "山田太郎" }).click();
		await expect(page.getByText("Edit Address")).toBeVisible();

		// Click Cancel
		await page.getByRole("button", { name: "Cancel" }).click();

		// Should return to default state
		await expect(
			page.getByText("Select an address or create a new one"),
		).toBeVisible();
	});
});
