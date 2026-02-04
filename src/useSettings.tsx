import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface SettingsContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	isDarkMode: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const STORAGE_KEY = "addressbook_settings";

interface Settings {
	theme: Theme;
}

const defaultSettings: Settings = {
	theme: "system",
};

export function SettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState<Settings>(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				return JSON.parse(stored);
			} catch {
				return defaultSettings;
			}
		}
		return defaultSettings;
	});

	const [systemDark, setSystemDark] = useState(() =>
		window.matchMedia("(prefers-color-scheme: dark)").matches,
	);

	// Listen for system theme changes
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	}, []);

	// Save to localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	}, [settings]);

	const isDarkMode = useMemo(() => {
		if (settings.theme === "system") {
			return systemDark;
		}
		return settings.theme === "dark";
	}, [settings.theme, systemDark]);

	// Apply dark class to document
	useEffect(() => {
		if (isDarkMode) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [isDarkMode]);

	const setTheme = (theme: Theme) => {
		setSettings((prev) => ({ ...prev, theme }));
	};

	return (
		<SettingsContext.Provider value={{ theme: settings.theme, setTheme, isDarkMode }}>
			{children}
		</SettingsContext.Provider>
	);
}

export function useSettings() {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error("useSettings must be used within SettingsProvider");
	}
	return context;
}
