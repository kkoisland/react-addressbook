import { useState } from "react";
import type { Email } from "./types";
import { defaultOptions } from "./types";
import generateUuid from "./utilsUuid";

interface AddressFormEmailProps {
	emails: Email[];
	onChange: (emails: Email[]) => void;
}

const AddressFormEmail = ({ emails, onChange }: AddressFormEmailProps) => {
	const emailTypes = defaultOptions.emailTypeOptions.filter((o) => o.active);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const addEmail = () => {
		onChange([
			...emails,
			{ id: generateUuid(), type: emailTypes[0]?.id || "", address: "" },
		]);
	};

	const updateEmail = (id: string, field: keyof Email, value: string) => {
		onChange(emails.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
	};

	const removeEmail = (id: string) => {
		onChange(emails.filter((e) => e.id !== id));
	};

	const handleCopy = (id: string, value: string) => {
		navigator.clipboard.writeText(value);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 1000);
	};

	return (
		<div className="space-y-2">
			<div className="flex justify-between items-center">
				<span className="text-sm font-medium">Emails</span>
				<button
					type="button"
					onClick={addEmail}
					className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
				>
					+ Add
				</button>
			</div>
			{emails.map((email) => (
				<div key={email.id} className="flex gap-2 items-center">
					<select
						value={email.type}
						onChange={(e) => updateEmail(email.id, "type", e.target.value)}
						className="input-base text-sm"
						aria-label="Email type"
					>
						{emailTypes.map((t) => (
							<option key={t.id} value={t.id}>
								{t.label}
							</option>
						))}
					</select>
					<input
						type="email"
						value={email.address}
						onChange={(e) => updateEmail(email.id, "address", e.target.value)}
						placeholder="Email address"
						aria-label="Email address"
						className="flex-1 input-base text-sm"
					/>
					{email.address && (
						<button
							type="button"
							onClick={() => handleCopy(email.id, email.address)}
							className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm cursor-pointer"
							title="Copy"
						>
							{copiedId === email.id ? "✓" : "📋"}
						</button>
					)}
					<button
						type="button"
						onClick={() => removeEmail(email.id)}
						className="text-red-500 hover:text-red-700 text-sm"
					>
						×
					</button>
				</div>
			))}
		</div>
	);
};

export default AddressFormEmail;
