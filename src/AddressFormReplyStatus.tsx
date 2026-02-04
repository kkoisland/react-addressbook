import type { ReplyStatus } from "./types";
import { defaultOptions } from "./types";
import { generateUuid } from "./utilsUuid";

interface AddressFormReplyStatusProps {
	replyStatuses: ReplyStatus[];
	onChange: (replyStatuses: ReplyStatus[]) => void;
}

export function AddressFormReplyStatus({
	replyStatuses,
	onChange,
}: AddressFormReplyStatusProps) {
	const replyTypes = defaultOptions.replyTypeOptions.filter((o) => o.active);

	const addReplyStatus = () => {
		const currentYear = new Date().getFullYear().toString();
		onChange([
			{ id: generateUuid(), year: currentYear, type: null },
			...replyStatuses,
		]);
	};

	const updateReplyStatus = (
		id: string,
		field: keyof ReplyStatus,
		value: string | null,
	) => {
		onChange(
			replyStatuses.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
		);
	};

	const removeReplyStatus = (id: string) => {
		onChange(replyStatuses.filter((r) => r.id !== id));
	};

	return (
		<div className="space-y-2">
			<div className="flex justify-between items-center">
				<span className="text-sm font-medium">Reply History</span>
				<button
					type="button"
					onClick={addReplyStatus}
					className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
				>
					+ Add
				</button>
			</div>
			{replyStatuses.map((reply) => (
				<div key={reply.id} className="flex gap-2 items-center">
					<input
						type="text"
						value={reply.year}
						onChange={(e) =>
							updateReplyStatus(reply.id, "year", e.target.value)
						}
						placeholder="Year"
						aria-label="Year"
						className="w-20 px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600"
					/>
					<select
						value={reply.type || ""}
						onChange={(e) =>
							updateReplyStatus(reply.id, "type", e.target.value || null)
						}
						aria-label="Reply type"
						className="flex-1 px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-gray-600"
					>
						<option value="">-</option>
						{replyTypes.map((t) => (
							<option key={t.id} value={t.id}>
								{t.label}
							</option>
						))}
					</select>
					<button
						type="button"
						onClick={() => removeReplyStatus(reply.id)}
						className="text-red-500 hover:text-red-700 text-sm"
					>
						×
					</button>
				</div>
			))}
		</div>
	);
}
