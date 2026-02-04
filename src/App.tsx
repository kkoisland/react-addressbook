import { AddressList } from "./AddressList";
import { useSettings } from "./useSettings.tsx";

function App() {
	const { isDarkMode, setTheme, theme } = useSettings();

	const toggleTheme = () => {
		if (theme === "system") {
			setTheme(isDarkMode ? "light" : "dark");
		} else {
			setTheme(isDarkMode ? "light" : "dark");
		}
	};

	return (
		<div className="h-screen flex flex-col bg-white text-gray-800 dark:bg-slate-900 dark:text-slate-200 p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Address Book</h1>
				<div className="flex items-center gap-4">
					<button type="button" onClick={toggleTheme}>
						{isDarkMode ? "☀️" : "🌙"}
					</button>
				</div>
			</div>
			<div className="flex-1 overflow-hidden">
				<AddressList />
			</div>
		</div>
	);
}

export default App;
