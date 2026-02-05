import { useMemo, useState } from "react";
import type { Address } from "./types";

export type SearchField =
	| "all"
	| "name"
	| "address"
	| "postalCodeJP"
	| "note"
	| "tempNote";

// Special value for searching empty/null fields
export const EMPTY_VALUE = "__empty__";

export interface AdvancedFilters {
	name: string;
	title: string;
	address: string;
	postalCodeJP: string;
	printType: string | null;
	statusPerm: string | null;
	statusNext: string | null;
	phone: string;
	email: string;
	replyYear: string;
	replyType: string | null;
	note: string;
	tempNote: string;
}

const emptyAdvancedFilters: AdvancedFilters = {
	name: "",
	title: "",
	address: "",
	postalCodeJP: "",
	printType: null,
	statusPerm: null,
	statusNext: null,
	phone: "",
	email: "",
	replyYear: "",
	replyType: null,
	note: "",
	tempNote: "",
};

// Check if any filter has a value
function hasAnyAdvancedFilter(filters: AdvancedFilters): boolean {
	return (
		filters.name.trim() !== "" ||
		filters.title.trim() !== "" ||
		filters.address.trim() !== "" ||
		filters.postalCodeJP.trim() !== "" ||
		filters.printType !== null ||
		filters.statusPerm !== null ||
		filters.statusNext !== null ||
		filters.phone.trim() !== "" ||
		filters.email.trim() !== "" ||
		filters.replyYear.trim() !== "" ||
		filters.replyType !== null ||
		filters.note.trim() !== "" ||
		filters.tempNote.trim() !== ""
	);
}

// Check if text filter is searching for empty value (== syntax)
function isSearchingEmpty(query: string): boolean {
	return query.trim() === "==";
}

// Text filter matching (supports == for empty search)
function matchesTextFilter(value: string, query: string): boolean {
	if (isSearchingEmpty(query)) {
		return value.trim() === "";
	}
	return value.toLowerCase().includes(query.toLowerCase());
}

// Dropdown filter matching (supports EMPTY_VALUE for null search)
function matchesDropdownFilter(
	value: string | null,
	filter: string | null,
): boolean {
	if (filter === EMPTY_VALUE) {
		return value === null;
	}
	return value === filter;
}

export function useFilter(addresses: Address[]) {
	// Quick search bar state
	const [searchQuery, setSearchQuery] = useState("");
	const [searchField, setSearchField] = useState<SearchField>("all");

	// Advanced search panel state
	const [advancedFilters, setAdvancedFilters] =
		useState<AdvancedFilters>(emptyAdvancedFilters);
	const [isSearchMode, setIsSearchMode] = useState(false);

	// Filter logic
	const filteredAddresses = useMemo(() => {
		// In search mode, show empty until filters are entered
		if (isSearchMode && !hasAnyAdvancedFilter(advancedFilters)) {
			return [];
		}

		let result = addresses;

		// Quick search bar filter (only in normal mode)
		if (!isSearchMode && searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter((addr) => {
				if (searchField === "all") {
					return (
						addr.name.toLowerCase().includes(query) ||
						addr.address.toLowerCase().includes(query) ||
						addr.postalCodeJP.toLowerCase().includes(query) ||
						addr.note.toLowerCase().includes(query) ||
						addr.tempNote.toLowerCase().includes(query) ||
						addr.phones.some((p) => p.number.toLowerCase().includes(query)) ||
						addr.emails.some((e) => e.address.toLowerCase().includes(query))
					);
				}
				const fieldValue = addr[searchField];
				return fieldValue.toLowerCase().includes(query);
			});
		}

		// Advanced filters (AND logic, only in search mode)
		if (isSearchMode) {
			if (advancedFilters.name.trim()) {
				result = result.filter((addr) =>
					matchesTextFilter(addr.name, advancedFilters.name),
				);
			}
			if (advancedFilters.title.trim()) {
				result = result.filter((addr) =>
					matchesTextFilter(addr.title, advancedFilters.title),
				);
			}
			if (advancedFilters.address.trim()) {
				result = result.filter((addr) =>
					matchesTextFilter(addr.address, advancedFilters.address),
				);
			}
			if (advancedFilters.postalCodeJP.trim()) {
				result = result.filter((addr) =>
					matchesTextFilter(addr.postalCodeJP, advancedFilters.postalCodeJP),
				);
			}
			if (advancedFilters.printType !== null) {
				result = result.filter((addr) =>
					matchesDropdownFilter(addr.printType, advancedFilters.printType),
				);
			}
			if (advancedFilters.statusPerm !== null) {
				result = result.filter((addr) =>
					matchesDropdownFilter(addr.statusPerm, advancedFilters.statusPerm),
				);
			}
			if (advancedFilters.statusNext !== null) {
				result = result.filter((addr) =>
					matchesDropdownFilter(addr.statusNext, advancedFilters.statusNext),
				);
			}
			if (advancedFilters.phone.trim()) {
				if (isSearchingEmpty(advancedFilters.phone)) {
					result = result.filter((addr) => addr.phones.length === 0);
				} else {
					const q = advancedFilters.phone.toLowerCase();
					result = result.filter((addr) =>
						addr.phones.some((p) => p.number.toLowerCase().includes(q)),
					);
				}
			}
			if (advancedFilters.email.trim()) {
				if (isSearchingEmpty(advancedFilters.email)) {
					result = result.filter((addr) => addr.emails.length === 0);
				} else {
					const q = advancedFilters.email.toLowerCase();
					result = result.filter((addr) =>
						addr.emails.some((e) => e.address.toLowerCase().includes(q)),
					);
				}
			}
			if (advancedFilters.replyYear.trim()) {
				if (isSearchingEmpty(advancedFilters.replyYear)) {
					result = result.filter((addr) => addr.replyStatuses.length === 0);
				} else {
					const q = advancedFilters.replyYear.toLowerCase();
					result = result.filter((addr) =>
						addr.replyStatuses.some((r) => r.year.toLowerCase().includes(q)),
					);
				}
			}
			if (advancedFilters.replyType !== null) {
				if (advancedFilters.replyType === EMPTY_VALUE) {
					result = result.filter((addr) => addr.replyStatuses.length === 0);
				} else {
					result = result.filter((addr) =>
						addr.replyStatuses.some(
							(r) => r.type === advancedFilters.replyType,
						),
					);
				}
			}
			if (advancedFilters.note.trim()) {
				result = result.filter((addr) =>
					matchesTextFilter(addr.note, advancedFilters.note),
				);
			}
			if (advancedFilters.tempNote.trim()) {
				result = result.filter((addr) =>
					matchesTextFilter(addr.tempNote, advancedFilters.tempNote),
				);
			}
		}

		return result;
	}, [addresses, searchQuery, searchField, advancedFilters, isSearchMode]);

	const clearAdvancedFilters = () => {
		setAdvancedFilters(emptyAdvancedFilters);
	};

	const enterSearchMode = () => {
		setIsSearchMode(true);
	};

	const exitSearchMode = () => {
		setIsSearchMode(false);
		clearAdvancedFilters();
	};

	const hasFilters = hasAnyAdvancedFilter(advancedFilters);

	return {
		// Quick search
		searchQuery,
		setSearchQuery,
		searchField,
		setSearchField,
		// Advanced search
		advancedFilters,
		setAdvancedFilters,
		clearAdvancedFilters,
		hasFilters,
		// Mode
		isSearchMode,
		enterSearchMode,
		exitSearchMode,
		// Results
		filteredAddresses,
	};
}
