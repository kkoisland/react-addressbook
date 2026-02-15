import type { Address } from "./types";

interface AddressCardProps {
	address: Address;
	isSelected: boolean;
	onSelect: (id: string) => void;
}

const AddressCard = ({ address, isSelected, onSelect }: AddressCardProps) => {
	return (
		<tr
			className={`cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 ${
				isSelected ? "bg-indigo-50 dark:bg-indigo-900/30" : ""
			}`}
			onClick={() => onSelect(address.id)}
		>
			<td className="px-3 py-2">{address.name}</td>
			<td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
				{address.address}
			</td>
			<td className="px-3 py-2 text-sm">
				{address.statusPerm === "statusPermYes" ? "Yes" : "No"}
			</td>
		</tr>
	);
};

export default AddressCard;
