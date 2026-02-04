// Address (main table)
export interface Address {
	id: string;
	name: string;
	postalCodeJP: string; // Japanese postal code (empty for US, included in address)
	address: string;
	title: string; // Honorific (様, Mr./Ms., etc.)
	note: string; // Memo (multi-line, permanent, date+content history format)
	tempNote: string; // Temporary memo (searchable, easily deletable)
	printType: string | null; // References printTypeOptions.id (nullable)
	statusPerm: string | null; // References statusPermOptions.id (nullable)
	statusNext: string | null; // References statusNextOptions.id (nullable)
	createdAt: string;
	updatedAt: string;
	phones: Phone[];
	emails: Email[];
	replyStatuses: ReplyStatus[]; // Reply history (by year)
}

// Phone
export interface Phone {
	id: string;
	type: string; // Selected from AppOptions.phoneTypeOptions
	number: string;
}

// Email
export interface Email {
	id: string;
	type: string; // Selected from AppOptions.emailTypeOptions
	address: string;
}

// ReplyStatus (reply history)
export interface ReplyStatus {
	id: string;
	year: string; // "2020", "22-23", "25-26", etc.
	type: string | null; // Selected from AppOptions.replyTypeOptions
}

// Option item (extensible: order, visibility, custom label)
export interface OptionItem {
	id: string; // Stored value "printLabelJp" (camelCase, immutable)
	label: string; // Display name (customizable) "Label J"
	order: number; // Sort order
	active: boolean; // Enabled/disabled (hidden items preserve existing data)
}

// Options management interface
export interface AppOptions {
	statusPermOptions: OptionItem[];
	statusNextOptions: OptionItem[];
	printTypeOptions: OptionItem[];
	phoneTypeOptions: OptionItem[];
	emailTypeOptions: OptionItem[];
	replyTypeOptions: OptionItem[];
}

// Default values (app initial startup)
export const defaultOptions: AppOptions = {
	statusPermOptions: [
		{ id: "statusPermYes", label: "Yes", order: 1, active: true },
		{ id: "statusPermNo", label: "No", order: 2, active: true },
		{ id: "statusPermNotThisYear", label: "Not this year", order: 3, active: true },
		{ id: "statusPermTemp", label: "Temp", order: 4, active: true },
		{ id: "statusPermMessage", label: "Message", order: 5, active: true },
	],
	statusNextOptions: [
		{ id: "statusNextYes", label: "Yes", order: 1, active: true },
		{ id: "statusNextNo", label: "No", order: 2, active: true },
	],
	printTypeOptions: [
		{ id: "printLabelJp", label: "Label J", order: 1, active: true },
		{ id: "printLabelUs", label: "Label US", order: 2, active: true },
	],
	phoneTypeOptions: [
		{ id: "phoneHome", label: "Home", order: 1, active: true },
		{ id: "phoneMobile", label: "Mobile", order: 2, active: true },
		{ id: "phoneWork", label: "Work", order: 3, active: true },
		{ id: "phoneOther", label: "Other", order: 4, active: true },
	],
	emailTypeOptions: [
		{ id: "emailPrimary", label: "Primary", order: 1, active: true },
		{ id: "emailSecondary", label: "Secondary", order: 2, active: true },
		{ id: "emailPreviously", label: "Previously", order: 3, active: true },
	],
	replyTypeOptions: [
		{ id: "replyCard", label: "Card", order: 1, active: true },
		{ id: "replyPostCard", label: "PostCard", order: 2, active: true },
		{ id: "replyLetter", label: "Letter", order: 3, active: true },
		{ id: "replyMessage", label: "Message", order: 4, active: true },
		{ id: "replyEmail", label: "Email", order: 5, active: true },
		{ id: "replyOther", label: "Other", order: 6, active: true },
	],
};

// Sender info (saved as settings)
export interface SenderInfo {
	name: string;
	address: string;
}

// App settings
export interface Settings {
	locale: "ja" | "en";
	theme: "light" | "dark" | "system";
	defaultPrintTemplate: string;
}

export const defaultSettings: Settings = {
	locale: "ja",
	theme: "system",
	defaultPrintTemplate: "printLabelJp",
};

// Print template (JSON exportable, customizable)
export interface PrintTemplate {
	id: string;
	name: string;
	width: string;
	height: string;
	fields: PrintField[];
	countryLabel?: string; // Country name displayed at the bottom (e.g., "JAPAN")
}

export interface PrintField {
	field: string;
	prefix?: string;
	suffix?: string;
	align: "left" | "right";
	row: number;
}

// Default templates
export const defaultPrintTemplates: PrintTemplate[] = [
	{
		id: "printLabelJp",
		name: "Label J",
		width: "7cm",
		height: "2cm",
		fields: [
			{ field: "postalCodeJP", prefix: "〒 ", align: "left", row: 1 },
			{ field: "address", align: "left", row: 2 },
			{ field: "name", align: "right", row: 3 },
			{ field: "title", align: "right", row: 3 },
		],
		countryLabel: "JAPAN",
	},
	{
		id: "printLabelUs",
		name: "Label US",
		width: "6cm",
		height: "2cm",
		fields: [
			{ field: "title", align: "left", row: 1 },
			{ field: "name", align: "left", row: 1 },
			{ field: "address", align: "left", row: 2 },
		],
	},
];

// Import config
export interface ImportConfig {
	id: string;
	name: string;
	description: string;
	columnMapping: {
		[reactField: string]: number | string; // Column index or column name
	};
	skipRows: number; // Number of header rows to skip
	deletable: boolean; // Can be deleted from settings
}

// Default import configs
export const defaultImportConfigs: ImportConfig[] = [
	{
		id: "genericCsv",
		name: "Generic CSV",
		description: "Standard CSV with header row",
		columnMapping: {},
		skipRows: 1,
		deletable: false,
	},
	{
		id: "filemaker",
		name: "FileMaker Export",
		description: "FileMaker Pro export format (no header)",
		columnMapping: {
			title: 6,
			name: 7,
			postalCodeJP: 8,
			address: 9,
			note: 11,
			printType: 12,
			statusPerm: 13,
			statusNext: 14,
		},
		skipRows: 0,
		deletable: true,
	},
];
