import type { Phone } from "./types";
import { defaultOptions } from "./types";
import { generateUuid } from "./utilsUuid";

interface AddressFormPhoneProps {
	phones: Phone[];
	onChange: (phones: Phone[]) => void;
}

export function AddressFormPhone({ phones, onChange }: AddressFormPhoneProps) {
	const phoneTypes = defaultOptions.phoneTypeOptions.filter((o) => o.active);

	const addPhone = () => {
		onChange([
			...phones,
			{ id: generateUuid(), type: phoneTypes[0]?.id || "", number: "" },
		]);
	};

	const updatePhone = (id: string, field: keyof Phone, value: string) => {
		onChange(phones.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
	};

	const removePhone = (id: string) => {
		onChange(phones.filter((p) => p.id !== id));
	};

	return (
		<div className="space-y-2">
			<div className="flex justify-between items-center">
				<span className="text-sm font-medium">Phones</span>
				<button
					type="button"
					onClick={addPhone}
					className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
				>
					+ Add
				</button>
			</div>
			{phones.map((phone) => (
				<div key={phone.id} className="flex gap-2 items-center">
					<select
						value={phone.type}
						onChange={(e) => updatePhone(phone.id, "type", e.target.value)}
						className="px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600"
						aria-label="Phone type"
					>
						{phoneTypes.map((t) => (
							<option key={t.id} value={t.id}>
								{t.label}
							</option>
						))}
					</select>
					<input
						type="text"
						value={phone.number}
						onChange={(e) => updatePhone(phone.id, "number", e.target.value)}
						placeholder="Phone number"
						aria-label="Phone number"
						className="flex-1 px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600"
					/>
					<button
						type="button"
						onClick={() => removePhone(phone.id)}
						className="text-red-500 hover:text-red-700 text-sm"
					>
						×
					</button>
				</div>
			))}
		</div>
	);
}
