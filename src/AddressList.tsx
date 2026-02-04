import { useState } from "react";
import { AddressCard } from "./AddressCard";
import { AddressForm } from "./AddressForm";
import type { Address } from "./types";
import { useAddresses } from "./useAddresses";

export function AddressList() {
	const { addresses, addAddress, updateAddress, deleteAddress } =
		useAddresses();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);

	const selectedAddress = selectedId
		? addresses.find((a) => a.id === selectedId) || null
		: null;

	const handleSelect = (id: string) => {
		setSelectedId(id);
		setIsCreating(false);
	};

	const handleNewAddress = () => {
		setSelectedId(null);
		setIsCreating(true);
	};

	const handleSave = (
		data: Omit<Address, "id" | "createdAt" | "updatedAt">,
	) => {
		const newAddress = addAddress(data);
		setSelectedId(newAddress.id);
		setIsCreating(false);
	};

	const handleUpdate = (id: string, updates: Partial<Address>) => {
		updateAddress(id, updates);
	};

	const handleDelete = (id: string) => {
		deleteAddress(id);
		if (selectedId === id) {
			setSelectedId(null);
		}
	};

	const handleCancel = () => {
		setIsCreating(false);
		setSelectedId(null);
	};

	return (
		<div className="flex gap-4 h-full">
			{/* Left: Table list */}
			<div className="w-1/2 flex flex-col">
				<div className="flex justify-between items-center mb-2">
					<span className="text-sm text-gray-600 dark:text-gray-400">
						{addresses.length} addresses
					</span>
					<button
						type="button"
						onClick={handleNewAddress}
						className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
					>
						+ New
					</button>
				</div>

				<div className="flex-1 overflow-auto border rounded dark:border-gray-700">
					<table className="w-full text-sm">
						<thead className="bg-gray-50 dark:bg-slate-800 sticky top-0">
							<tr>
								<th className="px-3 py-2 text-left font-medium">Name</th>
								<th className="px-3 py-2 text-left font-medium">Address</th>
								<th className="px-3 py-2 text-left font-medium">Status</th>
								<th className="px-3 py-2 text-left font-medium">Reply</th>
								<th className="px-3 py-2 text-left font-medium" />
							</tr>
						</thead>
						<tbody>
							{addresses.map((address) => (
								<AddressCard
									key={address.id}
									address={address}
									isSelected={address.id === selectedId}
									onSelect={handleSelect}
									onDelete={handleDelete}
								/>
							))}
							{addresses.length === 0 && (
								<tr>
									<td
										colSpan={5}
										className="px-3 py-8 text-center text-gray-500"
									>
										No addresses yet. Click "+ New" to add one.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Right: Form */}
			<div className="w-1/2 border rounded p-4 dark:border-gray-700 overflow-auto">
				{isCreating || selectedAddress ? (
					<AddressForm
						address={selectedAddress}
						onSave={handleSave}
						onUpdate={handleUpdate}
						onCancel={handleCancel}
					/>
				) : (
					<div className="flex items-center justify-center h-full text-gray-500">
						Select an address or create a new one
					</div>
				)}
			</div>
		</div>
	);
}
