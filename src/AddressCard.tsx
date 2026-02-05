import type { Address } from "./types";

interface AddressCardProps {
	address: Address;
	isSelected: boolean;
	onSelect: (id: string) => void;
	onDelete: (id: string) => void;
}

const AddressCard = ({
	address,
	isSelected,
	onSelect,
	onDelete,
}: AddressCardProps) => {
	const latestReply = address.replyStatuses[0];

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
			<td className="px-3 py-2 text-sm">{address.statusPerm || "-"}</td>
			<td className="px-3 py-2 text-sm">
				{latestReply ? `${latestReply.year} ${latestReply.type || ""}` : "-"}
			</td>
			<td className="px-3 py-2">
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						if (confirm(`Delete "${address.name}"?`)) {
							onDelete(address.id);
						}
					}}
					className="text-red-500 hover:text-red-700 text-sm"
				>
					Delete
				</button>
			</td>
		</tr>
	);
};

export default AddressCard;
