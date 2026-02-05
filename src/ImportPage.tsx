import { useState } from "react";
import type { Address } from "./types";
import { importData } from "./utilsCsv";

interface ImportPageProps {
	onImport: (addresses: Address[]) => void;
	onClearAll: () => void;
	onBack: () => void;
	existingCount: number;
	addresses: Address[];
}

const IMPORT_FILES = {
	addresses: "/import-data/addresses.csv",
	phones: "/import-data/phones.csv",
	emails: "/import-data/emails.csv",
	reply: "/import-data/reply_status.csv",
};

const buttonStyle =
	"px-4 py-2 text-sm border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed";

const ImportPage = ({
	onImport,
	onClearAll,
	onBack,
	existingCount,
	addresses,
}: ImportPageProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<{
		success: boolean;
		message: string;
		count?: number;
	} | null>(null);

	const handleExport = () => {
		const dataStr = JSON.stringify(addresses, null, 2);
		const blob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `addressbook-export-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleImport = async () => {
		setIsLoading(true);
		setResult(null);

		try {
			const [addressesRes, phonesRes, emailsRes, replyRes] = await Promise.all([
				fetch(IMPORT_FILES.addresses),
				fetch(IMPORT_FILES.phones),
				fetch(IMPORT_FILES.emails),
				fetch(IMPORT_FILES.reply),
			]);

			if (!addressesRes.ok) {
				throw new Error(`Failed to load addresses.csv: ${addressesRes.status}`);
			}

			const [addressesContent, phonesContent, emailsContent, replyContent] =
				await Promise.all([
					addressesRes.text(),
					phonesRes.ok ? phonesRes.text() : null,
					emailsRes.ok ? emailsRes.text() : null,
					replyRes.ok ? replyRes.text() : null,
				]);

			const importResult = importData(
				addressesContent,
				phonesContent,
				emailsContent,
				replyContent,
			);

			if (!importResult.success) {
				setResult({
					success: false,
					message: `Import failed: ${importResult.errors.join(", ")}`,
				});
				return;
			}

			if (importResult.addresses.length === 0) {
				setResult({
					success: false,
					message: "No valid addresses found in the file",
				});
				return;
			}

			onImport(importResult.addresses);
			setResult({
				success: true,
				message: `Successfully imported ${importResult.addresses.length} addresses`,
				count: importResult.addresses.length,
			});
		} catch (err) {
			setResult({
				success: false,
				message: err instanceof Error ? err.message : "Unknown error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleClearAll = () => {
		if (
			window.confirm(
				"Are you sure you want to delete ALL current addresses? This cannot be undone.",
			)
		) {
			onClearAll();
			setResult({
				success: true,
				message: "All addresses have been deleted",
			});
		}
	};

	return (
		<div className="space-y-6 max-w-2xl">
			<div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
				<h2 className="text-xl font-semibold">Data Management</h2>
				<button type="button" onClick={onBack} className={buttonStyle}>
					← Back to List
				</button>
			</div>

			{existingCount > 0 && (
				<div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm">
					You have {existingCount} existing addresses. Imported addresses will
					be added to the existing data.
				</div>
			)}

			<div className="space-y-4">
				<h3 className="font-medium">Import from csv</h3>
				<div className="p-4 bg-gray-50 dark:bg-slate-800 rounded text-sm">
					<p className="font-medium mb-2">Files to import:</p>
					<ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
						<li>addresses.csv (required)</li>
						<li>phones.csv</li>
						<li>emails.csv</li>
						<li>reply_status.csv</li>
					</ul>
					<p className="mt-3 text-xs text-gray-500 dark:text-gray-400 border-t pt-2 dark:border-gray-700">
						Note: Put your personal CSV files in public/import-data/. The
						test-data folder contains sample files only. Copy files from
						test-data if you want to try importing.
					</p>
				</div>

				<button
					type="button"
					onClick={handleImport}
					disabled={isLoading}
					className={buttonStyle}
				>
					{isLoading ? "Importing..." : "Import All"}
				</button>
			</div>

			{result && (
				<div
					className={`p-3 rounded text-sm ${
						result.success
							? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
							: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
					}`}
				>
					{result.message}
				</div>
			)}

			<div className="border-t pt-6 dark:border-gray-700">
				<h3 className="font-medium mb-3">Export Data</h3>
				<button
					type="button"
					onClick={handleExport}
					disabled={existingCount === 0}
					className={buttonStyle}
				>
					Export as JSON ({existingCount} addresses)
				</button>
			</div>

			<div className="border-t pt-6 dark:border-gray-700">
				<h3 className="font-medium mb-3 text-red-600 dark:text-red-400">
					Danger Zone
				</h3>
				<button
					type="button"
					onClick={handleClearAll}
					className={`${buttonStyle} border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20`}
				>
					Clear All Current Data
				</button>
				<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
					Delete all addresses from localStorage.
				</p>
			</div>
		</div>
	);
};

export default ImportPage;
