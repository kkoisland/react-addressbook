import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { SettingsProvider } from "./useSettings";

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<SettingsProvider>
			<App />
		</SettingsProvider>
	</StrictMode>,
);
