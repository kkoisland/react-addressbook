import type { Page } from "@playwright/test";

const STORAGE_KEY = "addressbook_addresses";

interface TestAddress {
	id: string;
	name: string;
	postalCodeJP: string;
	address: string;
	title: string;
	note: string;
	tempNote: string;
	printType: "labelJp" | "labelUs" | null;
	statusPerm: string | null;
	statusNext: string | null;
	createdAt: string;
	updatedAt: string;
	phones: { id: string; type: string; number: string }[];
	emails: { id: string; type: string; address: string }[];
	replyStatuses: { id: string; year: string; type: string | null }[];
}

export const createAddressJp = (
	overrides: Partial<TestAddress> = {},
): TestAddress => ({
	id: `test-jp-${Date.now()}`,
	name: "山田太郎",
	postalCodeJP: "150-0001",
	address: "東京都渋谷区神宮前1-2-3",
	title: "様",
	note: "",
	tempNote: "",
	printType: "labelJp",
	statusPerm: "statusPermYes",
	statusNext: "statusNextYes",
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z",
	phones: [{ id: "p-jp-1", type: "phoneHome", number: "03-1234-5678" }],
	emails: [
		{ id: "e-jp-1", type: "emailPrimary", address: "yamada@example.com" },
	],
	replyStatuses: [],
	...overrides,
});

export const createAddressUs = (
	overrides: Partial<TestAddress> = {},
): TestAddress => ({
	id: `test-us-${Date.now()}`,
	name: "John Smith",
	postalCodeJP: "",
	address: "123 Main Street, San Francisco, CA 94102, USA",
	title: "Mr.",
	note: "",
	tempNote: "",
	printType: "labelUs",
	statusPerm: "statusPermYes",
	statusNext: "statusNextYes",
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z",
	phones: [{ id: "p-us-1", type: "phoneMobile", number: "+1-415-555-0100" }],
	emails: [
		{
			id: "e-us-1",
			type: "emailPrimary",
			address: "john.smith@example.com",
		},
	],
	replyStatuses: [],
	...overrides,
});

export const createMultipleAddresses = (count: number): TestAddress[] => {
	const addresses: TestAddress[] = [];
	for (let i = 0; i < count; i++) {
		const isJp = i % 2 === 0;
		addresses.push(
			isJp
				? createAddressJp({
						id: `test-jp-${i}`,
						name: `テスト太郎${i}`,
						statusPerm: i === 0 ? "statusPermYes" : "statusPermNo",
					})
				: createAddressUs({
						id: `test-us-${i}`,
						name: `Test User ${i}`,
						statusPerm: i === 1 ? "statusPermYes" : "statusPermNo",
					}),
		);
	}
	return addresses;
};

export const setupLocalStorage = async (
	page: Page,
	addresses: TestAddress[],
): Promise<void> => {
	await page.goto("/");
	await page.evaluate(
		({ key, data }) => {
			localStorage.setItem(key, JSON.stringify(data));
		},
		{ key: STORAGE_KEY, data: addresses },
	);
	await page.reload();
};

export const clearLocalStorage = async (page: Page): Promise<void> => {
	await page.goto("/");
	await page.evaluate(() => localStorage.clear());
	await page.reload();
};
