import { useMemo } from "react";
import type { Address } from "./types";
import type { AdvancedFilters } from "./useFilter";
import { EMPTY_VALUE } from "./useFilter";
import { defaultOptions } from "./types";

interface AddressSearchPanelProps {
	filters: AdvancedFilters;
	onChange: (filters: AdvancedFilters) => void;
	onClear: () => void;
	addresses: Address[];
}

export function AddressSearchPanel({
	filters,
	onChange,
	onClear,
	addresses,
}: AddressSearchPanelProps) {
	const printTypes = defaultOptions.printTypeOptions.filter((o) => o.active);
	const statusPermOptions = defaultOptions.statusPermOptions.filter(
		(o) => o.active,
	);
	const statusNextOptions = defaultOptions.statusNextOptions.filter(
		(o) => o.active,
	);
	const replyTypes = defaultOptions.replyTypeOptions.filter((o) => o.active);

	// Collect unique years from existing addresses
	const existingYears = useMemo(() => {
		const years = new Set<string>();
		for (const addr of addresses) {
			for (const reply of addr.replyStatuses) {
				if (reply.year) {
					years.add(reply.year);
				}
			}
		}
		return Array.from(years).sort().reverse();
	}, [addresses]);

	const updateFilter = <K extends keyof AdvancedFilters>(
		key: K,
		value: AdvancedFilters[K],
	) => {
		onChange({ ...filters, [key]: value });
	};

	return (
		<form
			className="space-y-4"
			autoComplete="off"
			onSubmit={(e) => e.preventDefault()}
		>
			<div className="flex justify-between items-center border-b pb-2 dark:border-gray-700">
				<h2 className="text-lg font-semibold">Search</h2>
				<button
					type="button"
					onClick={onClear}
					className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-slate-700 dark:border-gray-600"
				>
					Clear
				</button>
			</div>

			<div className="grid grid-cols-2 gap-4">
				{/* Left column - Basic info (matches AddressForm layout) */}
				<div className="space-y-3">
					<label className="block">
						<span className="block text-sm font-medium mb-1">Name</span>
						<input
							type="text"
							name="search-filter-name"
							value={filters.name}
							onChange={(e) => updateFilter("name", e.target.value)}
							placeholder="Search name... (== for empty)"
							className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
							autoComplete="one-time-code"
						/>
					</label>

					<label className="block">
						<span className="block text-sm font-medium mb-1">Title</span>
						<input
							type="text"
							name="search-filter-title"
							value={filters.title}
							onChange={(e) => updateFilter("title", e.target.value)}
							placeholder="Search title... (== for empty)"
							className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
							autoComplete="one-time-code"
						/>
					</label>

					<label className="block">
						<span className="block text-sm font-medium mb-1">
							Postal Code (JP)
						</span>
						<input
							type="text"
							name="search-filter-postal"
							value={filters.postalCodeJP}
							onChange={(e) => updateFilter("postalCodeJP", e.target.value)}
							placeholder="Search postal code... (== for empty)"
							className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
							autoComplete="one-time-code"
						/>
					</label>

					<label className="block">
						<span className="block text-sm font-medium mb-1">Address</span>
						<input
							type="text"
							name="search-filter-address"
							value={filters.address}
							onChange={(e) => updateFilter("address", e.target.value)}
							placeholder="Search address... (== for empty)"
							className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
							autoComplete="one-time-code"
						/>
					</label>

					<div className="grid grid-cols-3 gap-2">
						<label className="block">
							<span className="block text-sm font-medium mb-1">Print Type</span>
							<select
								value={filters.printType || ""}
								onChange={(e) =>
									updateFilter("printType", e.target.value || null)
								}
								className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
							>
								<option value="">All</option>
								<option value={EMPTY_VALUE}>Empty</option>
								{printTypes.map((t) => (
									<option key={t.id} value={t.id}>
										{t.label}
									</option>
								))}
							</select>
						</label>

						<label className="block">
							<span className="block text-sm font-medium mb-1">
								Status Perm
							</span>
							<select
								value={filters.statusPerm || ""}
								onChange={(e) =>
									updateFilter("statusPerm", e.target.value || null)
								}
								className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
							>
								<option value="">All</option>
								<option value={EMPTY_VALUE}>Empty</option>
								{statusPermOptions.map((t) => (
									<option key={t.id} value={t.id}>
										{t.label}
									</option>
								))}
							</select>
						</label>

						<label className="block">
							<span className="block text-sm font-medium mb-1">
								Status Next
							</span>
							<select
								value={filters.statusNext || ""}
								onChange={(e) =>
									updateFilter("statusNext", e.target.value || null)
								}
								className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
							>
								<option value="">All</option>
								<option value={EMPTY_VALUE}>Empty</option>
								{statusNextOptions.map((t) => (
									<option key={t.id} value={t.id}>
										{t.label}
									</option>
								))}
							</select>
						</label>
					</div>
				</div>

				{/* Right column - Phones, Emails, Reply Status, Notes (matches AddressForm layout) */}
				<div className="space-y-4">
					{/* Phone search */}
					<div className="space-y-2">
						<span className="text-sm font-medium">Phones</span>
						<input
							type="text"
							name="search-filter-phone"
							value={filters.phone}
							onChange={(e) => updateFilter("phone", e.target.value)}
							placeholder="Search phone... (== for empty)"
							aria-label="Phone number"
							className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600"
							autoComplete="one-time-code"
						/>
					</div>

					{/* Email search */}
					<div className="space-y-2">
						<span className="text-sm font-medium">Emails</span>
						<input
							type="text"
							name="search-filter-email"
							value={filters.email}
							onChange={(e) => updateFilter("email", e.target.value)}
							placeholder="Search email... (== for empty)"
							aria-label="Email address"
							className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600"
							autoComplete="one-time-code"
						/>
					</div>

					{/* Reply Status search */}
					<div className="space-y-2">
						<span className="text-sm font-medium">Reply Status</span>
						<div className="flex gap-2">
							<select
								value={filters.replyYear}
								onChange={(e) => updateFilter("replyYear", e.target.value)}
								aria-label="Reply year"
								className="flex-1 px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600"
							>
								<option value="">All Years</option>
								<option value="==">Empty</option>
								{existingYears.map((year) => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
							<select
								value={filters.replyType || ""}
								onChange={(e) =>
									updateFilter("replyType", e.target.value || null)
								}
								aria-label="Reply type"
								className="px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600"
							>
								<option value="">All Types</option>
								<option value={EMPTY_VALUE}>Empty</option>
								{replyTypes.map((t) => (
									<option key={t.id} value={t.id}>
										{t.label}
									</option>
								))}
							</select>
						</div>
					</div>

					<label className="block">
						<span className="block text-sm font-medium mb-1">Note</span>
						<input
							type="text"
							name="search-filter-note"
							value={filters.note}
							onChange={(e) => updateFilter("note", e.target.value)}
							placeholder="Search in notes... (== for empty)"
							className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600"
							autoComplete="one-time-code"
						/>
					</label>

					<label className="block">
						<span className="block text-sm font-medium mb-1">Temp Note</span>
						<input
							type="text"
							name="search-filter-tempnote"
							value={filters.tempNote}
							onChange={(e) => updateFilter("tempNote", e.target.value)}
							placeholder="Search in temp notes... (== for empty)"
							className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600"
							autoComplete="one-time-code"
						/>
					</label>
				</div>
			</div>
		</form>
	);
}
