import type { Address, Email, LabelType, Phone, ReplyStatus } from "./types";
import generateUuid from "./utilsUuid";

// Parse a single CSV line handling quoted fields
const parseCsvLine = (line: string): string[] => {
	const result: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		const nextChar = line[i + 1];

		if (inQuotes) {
			if (char === '"' && nextChar === '"') {
				// Escaped quote
				current += '"';
				i++;
			} else if (char === '"') {
				inQuotes = false;
			} else {
				current += char;
			}
		} else {
			if (char === '"') {
				inQuotes = true;
			} else if (char === ",") {
				result.push(current);
				current = "";
			} else {
				current += char;
			}
		}
	}
	result.push(current);
	return result;
};

// New single-file CSV column mapping (0-indexed, name-first format)
const NEW_CSV_COL = {
	name: 0,
	title: 1,
	postalCodeJP: 2,
	address: 3,
	createdAt: 5,
	updatedAt: 6,
	note: 7,
	printType: 8,
	statusNext: 10,
	statusPerm: 11,
	emailAddress: 16,
	emailType: 17,
	phoneNumber: 18,
	phoneType: 19,
	replyType: 20,
	replyYear: 21,
} as const;

// FileMaker uses \x0b (vertical tab) as an internal line break within fields
const FILEMAKER_LINE_BREAK = "\x0b";

const normalizeField = (value: string): string =>
	value.replace(new RegExp(FILEMAKER_LINE_BREAK, "g"), "\n").trim();

// Map option values to React option IDs
function mapPrintType(value: string): LabelType | null {
	if (!value || value.trim() === "") return null;
	const v = value.toLowerCase().trim();
	if (v.includes("label") && v.includes("j")) return "labelJp";
	if (v.includes("label") && v.includes("us")) return "labelUs";
	return null;
}

function mapStatusPerm(value: string): string | null {
	if (!value || value.trim() === "") return null;
	const v = value.toLowerCase().trim();
	if (v === "yes" || v === "y") return "statusPermYes";
	if (v === "no" || v === "n") return "statusPermNo";
	if (v.includes("not") && v.includes("year")) return "statusPermNotThisYear";
	if (v === "temp" || v === "temporary") return "statusPermTemp";
	if (v === "message" || v === "msg") return "statusPermMessage";
	return null;
}

function mapStatusNext(value: string): string | null {
	if (!value || value.trim() === "") return null;
	const v = value.toLowerCase().trim();
	if (v === "yes" || v === "y") return "statusNextYes";
	if (v === "no" || v === "n") return "statusNextNo";
	if (v === "n(西山家)") return "statusNextNishiyama";
	if (v === "h(樋口家)") return "statusNextHiguchi";
	if (v === "not decided") return "statusNextNotDecided";
	if (v === "その他") return "statusNextOther";
	return null;
}

function mapPhoneType(value: string): string {
	const v = value.toLowerCase().trim();
	if (v === "home" || v === "h") return "phoneHome";
	if (v === "mobile" || v === "cell" || v === "m") return "phoneMobile";
	if (v === "work" || v === "w") return "phoneWork";
	return "phoneOther";
}

function mapEmailType(value: string): string {
	const v = value.toLowerCase().trim();
	if (v === "primary" || v === "1" || v === "main") return "emailPrimary";
	if (v === "secondary" || v === "2") return "emailSecondary";
	if (v === "previously" || v === "prev" || v === "old")
		return "emailPreviously";
	return "emailPrimary";
}

function mapReplyType(value: string): string | null {
	if (!value || value.trim() === "") return null;
	const v = value.toLowerCase().trim();
	if (v === "card" || v === "c") return "replyCard";
	if (v === "postcard" || v === "pc") return "replyPostCard";
	if (v === "letter" || v === "l") return "replyLetter";
	if (v === "message" || v === "msg") return "replyMessage";
	if (v === "email" || v === "e") return "replyEmail";
	if (v === "ecard" || v === "e-card") return "replyEcard";
	if (v === "postc&card") return "replyPostCCard";
	if (v === "email&card") return "replyEmailCard";
	if (v === "email&letter") return "replyEmailLetter";
	return "replyOther";
}

// Extract phone/email/reply from one CSV row into a partial address
function extractContactFields(
	fields: string[],
	address: Partial<Address>,
): void {
	const phoneNumber = fields[NEW_CSV_COL.phoneNumber]?.trim();
	const emailAddress = fields[NEW_CSV_COL.emailAddress]?.trim();
	const replyYear = fields[NEW_CSV_COL.replyYear]?.trim();
	const replyType = fields[NEW_CSV_COL.replyType]?.trim();

	if (phoneNumber) {
		const phone: Phone = {
			id: generateUuid(),
			type: mapPhoneType(fields[NEW_CSV_COL.phoneType] || ""),
			number: phoneNumber,
		};
		if (!address.phones) address.phones = [];
		address.phones.push(phone);
	}

	if (emailAddress) {
		const email: Email = {
			id: generateUuid(),
			type: mapEmailType(fields[NEW_CSV_COL.emailType] || ""),
			address: emailAddress,
		};
		if (!address.emails) address.emails = [];
		address.emails.push(email);
	}

	if (replyYear) {
		const reply: ReplyStatus = {
			id: generateUuid(),
			year: replyYear,
			type: mapReplyType(replyType || ""),
		};
		if (!address.replyStatuses) address.replyStatuses = [];
		address.replyStatuses.push(reply);
	}
}

function buildAddress(partial: Partial<Address>, now: string): Address {
	return {
		id: generateUuid(),
		name: partial.name || "",
		title: partial.title || "",
		postalCodeJP: partial.postalCodeJP || "",
		address: partial.address || "",
		note: partial.note || "",
		tempNote: "",
		printType: partial.printType || null,
		statusNext: partial.statusNext || null,
		statusPerm: partial.statusPerm || null,
		phones: partial.phones || [],
		emails: partial.emails || [],
		replyStatuses: partial.replyStatuses || [],
		createdAt: now,
		updatedAt: now,
	};
}

export interface ImportResult {
	success: boolean;
	addresses: Address[];
	totalRecords: number;
	importedCount: number;
	skippedCount: number;
	errors: string[];
}

// Import from new single-file CSV (name-first, with continuation rows)
const importFromNewCsv = (content: string): ImportResult => {
	try {
		const lines = content.split(/\r\n|\n|\r/).filter((line) => line.trim());
		if (lines.length <= 1) {
			return {
				success: false,
				addresses: [],
				totalRecords: 0,
				importedCount: 0,
				skippedCount: 0,
				errors: ["File is empty or has only a header row"],
			};
		}

		const now = new Date().toISOString();
		const addresses: Address[] = [];
		let current: Partial<Address> | null = null;

		// Skip header row (index 0)
		for (let i = 1; i < lines.length; i++) {
			const fields = parseCsvLine(lines[i]);
			const name = fields[NEW_CSV_COL.name]?.trim() || "";

			if (name) {
				if (current) {
					addresses.push(buildAddress(current, now));
				}
				current = {
					name,
					title: fields[NEW_CSV_COL.title]?.trim() || "",
					postalCodeJP: fields[NEW_CSV_COL.postalCodeJP]?.trim() || "",
					address: normalizeField(fields[NEW_CSV_COL.address] || ""),
					note: normalizeField(fields[NEW_CSV_COL.note] || ""),
					tempNote: "",
					printType: mapPrintType(fields[NEW_CSV_COL.printType] || ""),
					statusNext: mapStatusNext(fields[NEW_CSV_COL.statusNext] || ""),
					statusPerm: mapStatusPerm(fields[NEW_CSV_COL.statusPerm] || ""),
					phones: [],
					emails: [],
					replyStatuses: [],
				};
				extractContactFields(fields, current);
			} else if (current) {
				// Continuation row: additional phone/email/reply for current record
				extractContactFields(fields, current);
			}
		}

		if (current) {
			addresses.push(buildAddress(current, now));
		}

		const validAddresses = addresses.filter((a) => a.name.trim() !== "");
		const skippedCount = addresses.length - validAddresses.length;
		const errors: string[] = [];

		if (skippedCount > 0) {
			errors.push(`Skipped ${skippedCount} records with empty names`);
		}

		return {
			success: true,
			addresses: validAddresses,
			totalRecords: validAddresses.length + skippedCount,
			importedCount: validAddresses.length,
			skippedCount,
			errors,
		};
	} catch (error) {
		return {
			success: false,
			addresses: [],
			totalRecords: 0,
			importedCount: 0,
			skippedCount: 0,
			errors: [
				error instanceof Error ? error.message : "Unknown error occurred",
			],
		};
	}
};

export { parseCsvLine, importFromNewCsv };
