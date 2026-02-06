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
				// End of quoted field
				inQuotes = false;
			} else {
				current += char;
			}
		} else {
			if (char === '"') {
				// Start of quoted field
				inQuotes = true;
			} else if (char === ",") {
				// Field separator
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

// UUID pattern for record detection
const UUID_PATTERN =
	/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;

// Split to export into records
const splitRecords = (content: string): string[][] => {
	// Data may export with different line endings: \r\n, \n, or \r (Mac classic)
	const records: string[][] = [];

	// First, try normal line-by-line parsing (handle all line ending types)
	const lines = content.split(/\r\n|\n|\r/).filter((line) => line.trim());

	if (lines.length > 1) {
		// Normal CSV with newlines
		return lines.map((line) => parseCsvLine(line));
	}

	// Single line - need to split by UUID pattern
	// Pattern: ,"UUID" or ""UUID at record boundaries
	const parts = content.split(
		/(?:,|^)"([0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12})"/g,
	);

	if (parts.length <= 1) {
		// Fallback: try parsing as single record
		return [parseCsvLine(content)];
	}

	// Reconstruct records from split parts
	for (let i = 1; i < parts.length; i += 2) {
		const uuid = parts[i];
		const restOfRecord = parts[i + 1] || "";
		// Reconstruct the record starting with the UUID
		const recordContent = `"${uuid}"${restOfRecord}`;
		const fields = parseCsvLine(recordContent);
		if (fields.length > 0 && UUID_PATTERN.test(fields[0])) {
			records.push(fields);
		}
	}

	return records;
};

// cvs data column mapping (0-indexed)
// Format: UUID, Created, Admin, Modified, Admin, then data fields...
const FM_ADDRESS_MAPPING = {
	primaryKey: 0, // UUID for linking
	title: 5,
	name: 6,
	postalCodeJP: 7,
	address: 8,
	note: 10,
	printType: 11,
	statusPerm: 12,
	statusNext: 13,
} as const;

// Phone/Email/Reply: ForeignKey is at the END (column 7)
const FM_PHONE_MAPPING = {
	foreignKey: 7,
	type: 5,
	number: 6,
} as const;

const FM_EMAIL_MAPPING = {
	foreignKey: 7,
	type: 5,
	address: 6,
} as const;

const FM_REPLY_MAPPING = {
	foreignKey: 7,
	year: 5,
	type: 6,
} as const;

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
	return "replyOther";
}

// Parse addresses CSV
const parseAddresses = (content: string): Map<string, Partial<Address>> => {
	const records = splitRecords(content);
	const addressMap = new Map<string, Partial<Address>>();

	for (const fields of records) {
		const primaryKey = fields[FM_ADDRESS_MAPPING.primaryKey]?.trim();
		if (!primaryKey || !UUID_PATTERN.test(primaryKey)) continue;

		addressMap.set(primaryKey, {
			name: fields[FM_ADDRESS_MAPPING.name]?.trim() || "",
			title: fields[FM_ADDRESS_MAPPING.title]?.trim() || "",
			postalCodeJP: fields[FM_ADDRESS_MAPPING.postalCodeJP]?.trim() || "",
			address: fields[FM_ADDRESS_MAPPING.address]?.trim() || "",
			note: fields[FM_ADDRESS_MAPPING.note]?.trim() || "",
			tempNote: "",
			printType: mapPrintType(fields[FM_ADDRESS_MAPPING.printType] || ""),
			statusPerm: mapStatusPerm(fields[FM_ADDRESS_MAPPING.statusPerm] || ""),
			statusNext: mapStatusNext(fields[FM_ADDRESS_MAPPING.statusNext] || ""),
			phones: [],
			emails: [],
			replyStatuses: [],
		});
	}

	return addressMap;
};

// Parse phones CSV
const parsePhones = (content: string): Map<string, Phone[]> => {
	const records = splitRecords(content);
	const phoneMap = new Map<string, Phone[]>();

	for (const fields of records) {
		const foreignKey = fields[FM_PHONE_MAPPING.foreignKey]?.trim();
		if (!foreignKey) continue;

		const phone: Phone = {
			id: generateUuid(),
			type: mapPhoneType(fields[FM_PHONE_MAPPING.type] || ""),
			number: fields[FM_PHONE_MAPPING.number]?.trim() || "",
		};

		if (phone.number) {
			const existing = phoneMap.get(foreignKey) || [];
			existing.push(phone);
			phoneMap.set(foreignKey, existing);
		}
	}

	return phoneMap;
};

// Parse emails CSV
const parseEmails = (content: string): Map<string, Email[]> => {
	const records = splitRecords(content);
	const emailMap = new Map<string, Email[]>();

	for (const fields of records) {
		const foreignKey = fields[FM_EMAIL_MAPPING.foreignKey]?.trim();
		if (!foreignKey) continue;

		const email: Email = {
			id: generateUuid(),
			type: mapEmailType(fields[FM_EMAIL_MAPPING.type] || ""),
			address: fields[FM_EMAIL_MAPPING.address]?.trim() || "",
		};

		if (email.address) {
			const existing = emailMap.get(foreignKey) || [];
			existing.push(email);
			emailMap.set(foreignKey, existing);
		}
	}

	return emailMap;
};

// Parse reply status CSV
const parseReplyStatuses = (content: string): Map<string, ReplyStatus[]> => {
	const records = splitRecords(content);
	const replyMap = new Map<string, ReplyStatus[]>();

	for (const fields of records) {
		const foreignKey = fields[FM_REPLY_MAPPING.foreignKey]?.trim();
		if (!foreignKey) continue;

		const reply: ReplyStatus = {
			id: generateUuid(),
			year: fields[FM_REPLY_MAPPING.year]?.trim() || "",
			type: mapReplyType(fields[FM_REPLY_MAPPING.type] || ""),
		};

		if (reply.year) {
			const existing = replyMap.get(foreignKey) || [];
			existing.push(reply);
			replyMap.set(foreignKey, existing);
		}
	}

	return replyMap;
};

// Merge all data into Address array
const mergeData = (
	addressMap: Map<string, Partial<Address>>,
	phoneMap: Map<string, Phone[]>,
	emailMap: Map<string, Email[]>,
	replyMap: Map<string, ReplyStatus[]>,
): Address[] => {
	const now = new Date().toISOString();
	const addresses: Address[] = [];

	for (const [primaryKey, partial] of addressMap) {
		const address: Address = {
			id: generateUuid(),
			name: partial.name || "",
			title: partial.title || "",
			postalCodeJP: partial.postalCodeJP || "",
			address: partial.address || "",
			note: partial.note || "",
			tempNote: partial.tempNote || "",
			printType: partial.printType || null,
			statusPerm: partial.statusPerm || null,
			statusNext: partial.statusNext || null,
			phones: phoneMap.get(primaryKey) || [],
			emails: emailMap.get(primaryKey) || [],
			replyStatuses: replyMap.get(primaryKey) || [],
			createdAt: now,
			updatedAt: now,
		};
		addresses.push(address);
	}

	return addresses;
};

export interface ImportResult {
	success: boolean;
	addresses: Address[];
	totalRecords: number;
	importedCount: number;
	skippedCount: number;
	errors: string[];
}

// Main import function
const importData = (
	addressesContent: string,
	phonesContent: string | null,
	emailsContent: string | null,
	replyContent: string | null,
): ImportResult => {
	const errors: string[] = [];

	try {
		const addressMap = parseAddresses(addressesContent);
		const phoneMap = phonesContent
			? parsePhones(phonesContent)
			: new Map<string, Phone[]>();
		const emailMap = emailsContent
			? parseEmails(emailsContent)
			: new Map<string, Email[]>();
		const replyMap = replyContent
			? parseReplyStatuses(replyContent)
			: new Map<string, ReplyStatus[]>();

		const addresses = mergeData(addressMap, phoneMap, emailMap, replyMap);

		// Filter out addresses with no name
		const validAddresses = addresses.filter((a) => a.name.trim() !== "");
		const skippedCount = addresses.length - validAddresses.length;

		if (skippedCount > 0) {
			errors.push(`Skipped ${skippedCount} records with empty names`);
		}

		return {
			success: true,
			addresses: validAddresses,
			totalRecords: addressMap.size,
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

export {
	parseCsvLine,
	splitRecords,
	parseAddresses,
	parsePhones,
	parseEmails,
	parseReplyStatuses,
	mergeData,
	importData,
};
