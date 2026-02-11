import { useEffect, useMemo, useState } from "react";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import AddressSearchPanel from "./AddressSearchPanel";
import type { Address, LabelType } from "./types";
import { type SearchField, useFilter } from "./useFilter";

const searchFieldOptions: { value: SearchField; label: string }[] = [
	{ value: "all", label: "All Fields" },
	{ value: "name", label: "Name" },
	{ value: "address", label: "Address" },
	{ value: "postalCodeJP", label: "Postal Code" },
	{ value: "note", label: "Note" },
	{ value: "tempNote", label: "Temp Note" },
];

interface AddressListProps {
	addresses: Address[];
	addAddress: (
		data: Omit<Address, "id" | "createdAt" | "updatedAt">,
	) => Address;
	updateAddress: (id: string, updates: Partial<Address>) => void;
	deleteAddress: (id: string) => void;
	onPrint?: (addresses: Address[]) => void;
	onModeChange?: (active: boolean) => void;
	requestPrintMode?: boolean;
}

const AddressList = ({
	addresses,
	addAddress,
	updateAddress,
	deleteAddress,
	onPrint,
	onModeChange,
	requestPrintMode,
}: AddressListProps) => {
	const {
		searchQuery,
		setSearchQuery,
		searchField,
		setSearchField,
		advancedFilters,
		setAdvancedFilters,
		clearAdvancedFilters,
		hasFilters,
		isSearchMode,
		enterSearchMode,
		exitSearchMode,
		filteredAddresses,
	} = useFilter(addresses);

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [isPrintMode, setIsPrintMode] = useState(false);

	const selectedAddress = selectedId
		? filteredAddresses.find((a) => a.id === selectedId) || null
		: null;

	// Quick print counts
	const printQuickCounts = useMemo(
		() => ({
			labelJp: addresses.filter(
				(a) => a.printType === "labelJp" && a.statusPerm === "statusPermYes",
			).length,
			labelUs: addresses.filter(
				(a) => a.printType === "labelUs" && a.statusPerm === "statusPermYes",
			).length,
		}),
		[addresses],
	);

	// Notify parent of mode changes (print mode or search mode)
	useEffect(() => {
		onModeChange?.(isSearchMode || isPrintMode);
	}, [isSearchMode, isPrintMode, onModeChange]);

	// Enter print mode when requested by parent (e.g., header Print button)
	useEffect(() => {
		if (requestPrintMode && !isPrintMode && !isSearchMode) {
			setIsPrintMode(true);
			setIsCreating(false);
			setSelectedId(null);
		}
	}, [requestPrintMode, isPrintMode, isSearchMode]);

	// Esc to exit search mode or print mode
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (isSearchMode) {
					exitSearchMode();
				} else if (isPrintMode) {
					setIsPrintMode(false);
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isSearchMode, isPrintMode, exitSearchMode]);

	const handleSelect = (id: string) => {
		setSelectedId(id);
		setIsCreating(false);
		if (isSearchMode) {
			exitSearchMode();
		}
		if (isPrintMode) {
			setIsPrintMode(false);
		}
	};

	const handleNewAddress = () => {
		setSelectedId(null);
		setIsCreating(true);
		if (isSearchMode) {
			exitSearchMode();
		}
		if (isPrintMode) {
			setIsPrintMode(false);
		}
	};

	const handleFind = () => {
		enterSearchMode();
		setIsPrintMode(false);
		setIsCreating(false);
		setSelectedId(null);
	};

	const handleCloseFind = () => {
		exitSearchMode();
	};

	const handleClosePrint = () => {
		setIsPrintMode(false);
	};

	const handleQuickPrint = (labelType: LabelType) => {
		if (!onPrint) return;
		const filtered = addresses.filter(
			(a) => a.printType === labelType && a.statusPerm === "statusPermYes",
		);
		onPrint(filtered);
	};

	const handleCustomPrint = () => {
		setIsPrintMode(false);
		enterSearchMode();
		setIsCreating(false);
		setSelectedId(null);
	};

	const handleSave = (
		data: Omit<Address, "id" | "createdAt" | "updatedAt">,
	) => {
		const newAddress = addAddress(data);
		setSelectedId(newAddress.id);
		setIsCreating(false);
	};

	const handleUpdate = (id: string, updates: Partial<Address>) => {
		updateAddress(id, updates);
	};

	const handleDelete = (id: string) => {
		deleteAddress(id);
		if (selectedId === id) {
			setSelectedId(null);
		}
	};

	const handleCancel = () => {
		setIsCreating(false);
		setSelectedId(null);
	};

	return (
		<div className="flex flex-col h-full gap-2">
			{/* Search bar - always visible, disabled in search mode */}
			<div className="flex items-center gap-2">
				<select
					value={searchField}
					onChange={(e) => setSearchField(e.target.value as SearchField)}
					className={`px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600 ${isSearchMode || isPrintMode ? "opacity-50 cursor-not-allowed" : ""}`}
					aria-label="Search field"
					disabled={isSearchMode || isPrintMode}
				>
					{searchFieldOptions.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
				<div className="relative flex-1 max-w-md">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder={isSearchMode ? "Use search panel →" : "Search..."}
						className={`w-full pl-8 pr-8 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600 ${isSearchMode || isPrintMode ? "opacity-50 cursor-not-allowed" : ""}`}
						aria-label="Search query"
						disabled={isSearchMode || isPrintMode}
					/>
					<span
						className={`absolute left-2 top-1/2 -translate-y-1/2 ${isSearchMode || isPrintMode ? "text-gray-300 dark:text-gray-600" : "text-gray-400"}`}
					>
						🔍
					</span>
					{searchQuery && !isSearchMode && !isPrintMode && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
							aria-label="Clear search"
						>
							✕
						</button>
					)}
				</div>
				<div className="flex-1" />
				{isPrintMode ? (
					<>
						<button
							type="button"
							onClick={() => handleQuickPrint("labelJp")}
							className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
						>
							Label J ({printQuickCounts.labelJp})
						</button>
						<button
							type="button"
							onClick={() => handleQuickPrint("labelUs")}
							className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
						>
							Label US ({printQuickCounts.labelUs})
						</button>
						<button
							type="button"
							onClick={handleCustomPrint}
							className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-slate-700 dark:border-gray-600"
						>
							Custom
						</button>
						<button
							type="button"
							onClick={handleClosePrint}
							className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-slate-700 dark:border-gray-600"
						>
							✕
						</button>
					</>
				) : isSearchMode ? (
					<>
						{onPrint && (
							<button
								type="button"
								onClick={() => onPrint(filteredAddresses)}
								className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
							>
								🖨️ Print Preview ({filteredAddresses.length})
							</button>
						)}
						<button
							type="button"
							onClick={handleCloseFind}
							className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-slate-700 dark:border-gray-600"
						>
							✕ Close Find
						</button>
					</>
				) : (
					<>
						<button
							type="button"
							onClick={handleNewAddress}
							className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
						>
							+ New
						</button>
						<button
							type="button"
							onClick={handleFind}
							className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-slate-700 dark:border-gray-600"
							title="Cmd+F"
						>
							🔍 Find
						</button>
					</>
				)}
			</div>

			{/* Main content */}
			<div className="flex gap-4 flex-1 min-h-0">
				{/* Left: Table list */}
				<div className="w-1/2 flex flex-col">
					<div className="mb-2">
						<span className="text-sm text-gray-600 dark:text-gray-400">
							{filteredAddresses.length} of {addresses.length} addresses
						</span>
					</div>

					<div className="flex-1 overflow-auto border rounded dark:border-gray-700">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 dark:bg-slate-800 sticky top-0">
								<tr>
									<th className="px-3 py-2 text-left font-medium">Name</th>
									<th className="px-3 py-2 text-left font-medium">Address</th>
									<th className="px-3 py-2 text-left font-medium">Status</th>
									<th className="px-3 py-2 text-left font-medium">Reply</th>
									<th className="px-3 py-2 text-left font-medium" />
								</tr>
							</thead>
							<tbody>
								{filteredAddresses.map((address) => (
									<AddressCard
										key={address.id}
										address={address}
										isSelected={address.id === selectedId}
										onSelect={handleSelect}
										onDelete={handleDelete}
									/>
								))}
								{filteredAddresses.length === 0 && (
									<tr>
										<td
											colSpan={5}
											className="px-3 py-8 text-center text-gray-500"
										>
											{isSearchMode && !hasFilters
												? "Enter search criteria to find addresses."
												: addresses.length === 0
													? 'No addresses yet. Click "+ New" to add one.'
													: "No addresses match your search."}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Right: Form or Search Panel */}
				<div className="w-1/2 border rounded p-4 dark:border-gray-700 overflow-auto">
					{isSearchMode ? (
						<AddressSearchPanel
							filters={advancedFilters}
							onChange={setAdvancedFilters}
							onClear={clearAdvancedFilters}
							addresses={addresses}
						/>
					) : isCreating || selectedAddress ? (
						<AddressForm
							address={selectedAddress}
							onSave={handleSave}
							onUpdate={handleUpdate}
							onCancel={handleCancel}
						/>
					) : (
						<div className="flex items-center justify-center h-full text-gray-500">
							Select an address or create a new one
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AddressList;
