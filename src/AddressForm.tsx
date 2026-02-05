import { useEffect, useState } from "react";
import AddressFormEmail from "./AddressFormEmail";
import AddressFormPhone from "./AddressFormPhone";
import AddressFormReplyStatus from "./AddressFormReplyStatus";
import type { Address, Email, Phone, ReplyStatus } from "./types";
import { defaultOptions } from "./types";

interface AddressFormProps {
	address: Address | null;
	onSave: (address: Omit<Address, "id" | "createdAt" | "updatedAt">) => void;
	onUpdate: (id: string, updates: Partial<Address>) => void;
	onCancel: () => void;
}

const emptyAddress = {
	name: "",
	postalCodeJP: "",
	address: "",
	title: "",
	note: "",
	tempNote: "",
	printType: null as string | null,
	statusPerm: null as string | null,
	statusNext: null as string | null,
	phones: [] as Phone[],
	emails: [] as Email[],
	replyStatuses: [] as ReplyStatus[],
};

const AddressForm = ({
	address,
	onSave,
	onUpdate,
	onCancel,
}: AddressFormProps) => {
	const [formData, setFormData] = useState(emptyAddress);

	useEffect(() => {
		if (address) {
			setFormData({
				name: address.name,
				postalCodeJP: address.postalCodeJP,
				address: address.address,
				title: address.title,
				note: address.note,
				tempNote: address.tempNote,
				printType: address.printType,
				statusPerm: address.statusPerm,
				statusNext: address.statusNext,
				phones: address.phones,
				emails: address.emails,
				replyStatuses: address.replyStatuses,
			});
		} else {
			setFormData(emptyAddress);
		}
	}, [address]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (address) {
			onUpdate(address.id, formData);
		} else {
			onSave(formData);
		}
	};

	const printTypes = defaultOptions.printTypeOptions.filter((o) => o.active);
	const statusPermOptions = defaultOptions.statusPermOptions.filter(
		(o) => o.active,
	);
	const statusNextOptions = defaultOptions.statusNextOptions.filter(
		(o) => o.active,
	);

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="flex justify-between items-center border-b pb-2 dark:border-gray-700">
				<h2 className="text-lg font-semibold">
					{address ? "Edit Address" : "New Address"}
				</h2>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onCancel}
						className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-slate-700 dark:border-gray-600"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
					>
						Save
					</button>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				{/* Left column - Basic info */}
				<div className="space-y-3">
					<label className="block">
						<span className="block text-sm font-medium mb-1">Name</span>
						<input
							type="text"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
							required
						/>
					</label>

					<label className="block">
						<span className="block text-sm font-medium mb-1">Title</span>
						<input
							type="text"
							value={formData.title}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							placeholder="様, Mr., Ms."
							className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
						/>
					</label>

					<label className="block">
						<span className="block text-sm font-medium mb-1">
							Postal Code (JP)
						</span>
						<input
							type="text"
							value={formData.postalCodeJP}
							onChange={(e) =>
								setFormData({ ...formData, postalCodeJP: e.target.value })
							}
							placeholder="123-4567"
							className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
						/>
					</label>

					<label className="block">
						<span className="block text-sm font-medium mb-1">Address</span>
						<textarea
							value={formData.address}
							onChange={(e) =>
								setFormData({ ...formData, address: e.target.value })
							}
							rows={2}
							className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
						/>
					</label>

					<div className="grid grid-cols-3 gap-2">
						<label className="block">
							<span className="block text-sm font-medium mb-1">Print Type</span>
							<select
								value={formData.printType || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										printType: e.target.value || null,
									})
								}
								className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
							>
								<option value="">-</option>
								{printTypes.map((t) => (
									<option key={t.id} value={t.id}>
										{t.label}
									</option>
								))}
							</select>
						</label>

						<label className="block">
							<span className="block text-sm font-medium mb-1">
								Status Perm
							</span>
							<select
								value={formData.statusPerm || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										statusPerm: e.target.value || null,
									})
								}
								className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
							>
								<option value="">-</option>
								{statusPermOptions.map((t) => (
									<option key={t.id} value={t.id}>
										{t.label}
									</option>
								))}
							</select>
						</label>

						<label className="block">
							<span className="block text-sm font-medium mb-1">
								Status Next
							</span>
							<select
								value={formData.statusNext || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										statusNext: e.target.value || null,
									})
								}
								className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
							>
								<option value="">-</option>
								{statusNextOptions.map((t) => (
									<option key={t.id} value={t.id}>
										{t.label}
									</option>
								))}
							</select>
						</label>
					</div>
				</div>

				{/* Right column - Phones, Emails, Reply Status, Notes */}
				<div className="space-y-4">
					<AddressFormPhone
						phones={formData.phones}
						onChange={(phones) => setFormData({ ...formData, phones })}
					/>

					<AddressFormEmail
						emails={formData.emails}
						onChange={(emails) => setFormData({ ...formData, emails })}
					/>

					<AddressFormReplyStatus
						replyStatuses={formData.replyStatuses}
						onChange={(replyStatuses) =>
							setFormData({ ...formData, replyStatuses })
						}
					/>

					<label className="block">
						<span className="block text-sm font-medium mb-1">Note</span>
						<textarea
							value={formData.note}
							onChange={(e) =>
								setFormData({ ...formData, note: e.target.value })
							}
							rows={3}
							placeholder="Permanent notes..."
							className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600"
						/>
					</label>

					<label className="block">
						<span className="block text-sm font-medium mb-1">Temp Note</span>
						<input
							type="text"
							value={formData.tempNote}
							onChange={(e) =>
								setFormData({ ...formData, tempNote: e.target.value })
							}
							placeholder="Temporary note..."
							className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600"
						/>
					</label>
				</div>
			</div>
		</form>
	);
};

export default AddressForm;
