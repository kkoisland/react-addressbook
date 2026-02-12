import { useState } from "react";
import AddressList from "./AddressList";
import ImportPage from "./ImportPage";
import PrintPreview from "./PrintPreview";
import SenderPrintPreview from "./SenderPrintPreview";
import type { Address } from "./types";
import useAddresses from "./useAddresses";
import { useSettings } from "./useSettings";

type Page = "list" | "import" | "print" | "print-sender";

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
	const [printAddresses, setPrintAddresses] = useState<Address[]>([]);
	const [isModalMode, setIsModalMode] = useState(false);
	const [requestPrintMode, setRequestPrintMode] = useState(false);

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

	const handlePrint = (addressesToPrint: Address[]) => {
		setPrintAddresses(addressesToPrint);
		setCurrentPage("print");
	};

	const handleModeChange = (active: boolean) => {
		setIsModalMode(active);
		if (!active) {
			setRequestPrintMode(false);
		}
	};

	return (
		<div className="h-screen flex flex-col bg-white text-gray-800 dark:bg-slate-900 dark:text-slate-200 p-4">
			<div className="print-hide flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Address Book</h1>
				<div className="flex items-center gap-2">
					{currentPage === "list" && !isModalMode && (
						<>
							<button
								type="button"
								onClick={() => setRequestPrintMode(true)}
								className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-slate-700 dark:border-gray-600"
							>
								🖨️ Print
							</button>
							<button
								type="button"
								onClick={() => setCurrentPage("print-sender")}
								className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-slate-700 dark:border-gray-600"
							>
								🏠 Sender
							</button>
							<button
								type="button"
								onClick={() => setCurrentPage("import")}
								className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-slate-700 dark:border-gray-600"
							>
								📥 Import
							</button>
						</>
					)}
					<button type="button" onClick={toggleTheme} className="px-2 py-1">
						{isDarkMode ? "☀️" : "🌙"}
					</button>
				</div>
			</div>
			<div className="flex-1 overflow-hidden">
				{currentPage === "list" && (
					<AddressList
						addresses={addresses}
						addAddress={addAddress}
						updateAddress={updateAddress}
						deleteAddress={deleteAddress}
						onPrint={handlePrint}
						onModeChange={handleModeChange}
						requestPrintMode={requestPrintMode}
					/>
				)}
				{currentPage === "import" && (
					<ImportPage
						onImport={handleImport}
						onClearAll={clearAllAddresses}
						onBack={() => setCurrentPage("list")}
						existingCount={addresses.length}
						addresses={addresses}
					/>
				)}
				{currentPage === "print" && (
					<PrintPreview
						addresses={printAddresses.length > 0 ? printAddresses : addresses}
						onBack={() => {
							setPrintAddresses([]);
							setCurrentPage("list");
						}}
					/>
				)}
				{currentPage === "print-sender" && (
					<SenderPrintPreview onBack={() => setCurrentPage("list")} />
				)}
			</div>
		</div>
	);
}

export default App;
