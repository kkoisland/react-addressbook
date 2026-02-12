import { useEffect, useMemo, useState } from "react";
import PrintLabel from "./PrintLabel";
import type { Address, LabelType } from "./types";

interface PrintPreviewProps {
	addresses: Address[];
	onBack: () => void;
}

// Dummy sample addresses for preview
const sampleAddressJp: Address = {
	id: "sample-jp",
	name: "山田 太郎",
	title: "様",
	postalCodeJP: "123-4567",
	address: "東京都渋谷区\n神南1-2-3",
	note: "",
	tempNote: "",
	printType: "labelJp",
	statusPerm: null,
	statusNext: null,
	phones: [],
	emails: [],
	replyStatuses: [],
	createdAt: "",
	updatedAt: "",
};

const sampleAddressUs: Address = {
	id: "sample-us",
	name: "John Smith",
	title: "Mr.",
	postalCodeJP: "",
	address: "123 Main Street\nNew York, NY 10001",
	note: "",
	tempNote: "",
	printType: "labelUs",
	statusPerm: null,
	statusNext: null,
	phones: [],
	emails: [],
	replyStatuses: [],
	createdAt: "",
	updatedAt: "",
};

type PrintMode = "labelJp" | "labelUs" | "mixed";

const PrintPreview = ({ addresses, onBack }: PrintPreviewProps) => {
	const [showCountryLabel, setShowCountryLabel] = useState(false);
	const [mixedLabelType, setMixedLabelType] = useState<LabelType>("labelJp");

	// Detect print mode from addresses
	const printMode: PrintMode = useMemo(() => {
		const allJp = addresses.every((a) => a.printType === "labelJp");
		if (allJp) return "labelJp";
		const allUs = addresses.every((a) => a.printType === "labelUs");
		if (allUs) return "labelUs";
		return "mixed";
	}, [addresses]);

	// Addresses to print (in mixed mode, filter by selected type)
	const printableAddresses = useMemo(() => {
		if (printMode === "mixed") {
			return addresses.filter(
				(a) => a.printType === mixedLabelType || a.printType === null,
			);
		}
		return addresses;
	}, [addresses, printMode, mixedLabelType]);

	// Sample address for preview
	const sampleAddress =
		printMode === "labelUs"
			? sampleAddressUs
			: printMode === "labelJp"
				? sampleAddressJp
				: mixedLabelType === "labelUs"
					? sampleAddressUs
					: sampleAddressJp;

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onBack();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onBack]);

	const handlePrint = () => {
		window.print();
	};

	return (
		<div className="h-full flex flex-col">
			{/* Header - hidden when printing */}
			<div className="print-hide flex justify-between items-center border-b pb-4 mb-4 dark:border-gray-700">
				<h2 className="text-lg font-semibold">Print Preview</h2>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onBack}
						className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-slate-700 dark:border-gray-600"
					>
						✕ Back
					</button>
					<button
						type="button"
						onClick={handlePrint}
						className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
					>
						Print ({printableAddresses.length})
					</button>
				</div>
			</div>

			{/* Options - hidden when printing */}
			<div className="print-hide mb-4 flex items-center gap-4">
				<span className="text-sm text-gray-600 dark:text-gray-400">
					{printMode === "mixed"
						? `${printableAddresses.length} ${mixedLabelType === "labelJp" ? "Label J" : "Label US"} of ${addresses.length} addresses`
						: `${printableAddresses.length} addresses`}
				</span>

				{/* Print type indicator */}
				{printMode !== "mixed" && (
					<span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-slate-800">
						{printMode === "labelJp" ? "Label J" : "Label US"}
					</span>
				)}

				{/* Pattern: mixed → dropdown */}
				{printMode === "mixed" && (
					<select
						value={mixedLabelType}
						onChange={(e) => setMixedLabelType(e.target.value as LabelType)}
						className="px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600"
					>
						<option value="labelJp">Label J</option>
						<option value="labelUs">Label US</option>
					</select>
				)}

				{/* Pattern: labelJp or mixed+labelJp → Show JAPAN */}
				{(printMode === "labelJp" ||
					(printMode === "mixed" && mixedLabelType === "labelJp")) && (
					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={showCountryLabel}
							onChange={(e) => setShowCountryLabel(e.target.checked)}
							className="w-4 h-4"
						/>
						<span className="text-sm">Show JAPAN</span>
					</label>
				)}

				{/* Pattern: labelUs → no options */}
			</div>

			{/* Preview area */}
			<div className="print-hide flex-1 overflow-auto">
				<h3 className="text-sm font-medium mb-2">Sample Preview:</h3>
				<PrintLabel
					address={sampleAddress}
					showCountryLabel={
						showCountryLabel && sampleAddress.printType === "labelJp"
					}
				/>
			</div>

			{/* Print content - visible only when printing */}
			<div className="print-show hidden">
				{printableAddresses.map((addr) => (
					<PrintLabel
						key={addr.id}
						address={addr}
						showCountryLabel={showCountryLabel && addr.printType !== "labelUs"}
					/>
				))}
			</div>
		</div>
	);
};

export default PrintPreview;
