import { useEffect, useState } from "react";

function App() {
	const [isDark, setIsDark] = useState(() => {
		return document.documentElement.classList.contains("dark");
	});

	useEffect(() => {
		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [isDark]);

	return (
		<div className="min-h-screen bg-white text-gray-800 dark:bg-slate-900 dark:text-slate-200 p-4">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Address Book</h1>
				<div className="flex items-center gap-4">
					<button type="button" onClick={() => setIsDark(!isDark)}>
						{isDark ? "☀️" : "🌙"}
					</button>
				</div>
			</div>
		</div>
	);
}

export default App;
