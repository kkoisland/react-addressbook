import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SettingsProvider } from "./useSettings.tsx";

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<SettingsProvider>
			<App />
		</SettingsProvider>
	</StrictMode>,
);
