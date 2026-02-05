import { useState } from "react";
import AddressList from "./AddressList";
import ImportPage from "./ImportPage";
import type { Address } from "./types";
import useAddresses from "./useAddresses";
import { useSettings } from "./useSettings";

type Page = "list" | "import";

function App() {
	const { isDarkMode, setTheme, theme } = useSettings();
	const {
		addresses,
		addAddress,
		updateAddress,
		deleteAddress,
		clearAllAddresses,
	} = useAddresses();
	const [currentPage, setCurrentPage] = useState<Page>("list");

	const toggleTheme = () => {
		if (theme === "system") {
			setTheme(isDarkMode ? "light" : "dark");
		} else {
			setTheme(isDarkMode ? "light" : "dark");
		}
	};

	const handleImport = (importedAddresses: Address[]) => {
		for (const addr of importedAddresses) {
			addAddress({
				name: addr.name,
				title: addr.title,
				postalCodeJP: addr.postalCodeJP,
				address: addr.address,
				note: addr.note,
				tempNote: addr.tempNote,
				printType: addr.printType,
				statusPerm: addr.statusPerm,
				statusNext: addr.statusNext,
				phones: addr.phones,
				emails: addr.emails,
				replyStatuses: addr.replyStatuses,
			});
		}
		setCurrentPage("list");
	};

	return (
		<div className="h-screen flex flex-col bg-white text-gray-800 dark:bg-slate-900 dark:text-slate-200 p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Address Book</h1>
				<div className="flex items-center gap-4">
					{currentPage === "list" && (
						<button
							type="button"
							onClick={() => setCurrentPage("import")}
							className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-slate-700 dark:border-gray-600"
						>
							📥 Import
						</button>
					)}
					<button type="button" onClick={toggleTheme}>
						{isDarkMode ? "☀️" : "🌙"}
					</button>
				</div>
			</div>
			<div className="flex-1 overflow-hidden">
				{currentPage === "list" ? (
					<AddressList
						addresses={addresses}
						addAddress={addAddress}
						updateAddress={updateAddress}
						deleteAddress={deleteAddress}
					/>
				) : (
					<ImportPage
						onImport={handleImport}
						onClearAll={clearAllAddresses}
						onBack={() => setCurrentPage("list")}
						existingCount={addresses.length}
						addresses={addresses}
					/>
				)}
			</div>
		</div>
	);
}

export default App;
