import { useEffect, useState } from "react";
import type { LabelType, SenderInfo } from "./types";
import useLocalStorage from "./useLocalStorage";

interface SenderPrintPreviewProps {
	onBack: () => void;
}

const STORAGE_KEY = "addressbook_sender";

const defaultSenderInfo: SenderInfo = {
	name: "",
	address: "",
};

const SenderPrintPreview = ({ onBack }: SenderPrintPreviewProps) => {
	const [senderInfo, setSenderInfo] = useLocalStorage<SenderInfo>(
		STORAGE_KEY,
		defaultSenderInfo,
	);
	const [labelType, setLabelType] = useState<LabelType>("labelUs");
	const [showCountryLabel, setShowCountryLabel] = useState(false);
	const [copies, setCopies] = useState(1);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onBack();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onBack]);

	const handlePrint = () => {
		window.print();
	};

	return (
		<div className="h-full flex flex-col">
			{/* Header - hidden when printing */}
			<div className="print-hide flex justify-between items-center border-b pb-4 mb-4 dark:border-gray-700">
				<h2 className="text-lg font-semibold">Sender Label</h2>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onBack}
						className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-slate-700 dark:border-gray-600"
					>
						✕ Back
					</button>
					<button
						type="button"
						onClick={handlePrint}
						className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
					>
						Print
					</button>
				</div>
			</div>

			{/* Editor - hidden when printing */}
			<div className="print-hide flex gap-8">
				{/* Left: Edit form */}
				<div className="flex-1 space-y-4">
					<label className="block">
						<span className="block text-sm font-medium mb-1">Name</span>
						<input
							type="text"
							value={senderInfo.name}
							onChange={(e) =>
								setSenderInfo({ ...senderInfo, name: e.target.value })
							}
							placeholder="Your name"
							className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
						/>
					</label>

					<label className="block">
						<span className="block text-sm font-medium mb-1">Address</span>
						<textarea
							value={senderInfo.address}
							onChange={(e) =>
								setSenderInfo({ ...senderInfo, address: e.target.value })
							}
							placeholder="Your address"
							rows={4}
							className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
						/>
					</label>

					<div className="grid grid-cols-2 gap-4">
						<label className="block">
							<span className="block text-sm font-medium mb-1">Label Type</span>
							<select
								value={labelType}
								onChange={(e) => setLabelType(e.target.value as LabelType)}
								className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
							>
								<option value="labelJp">Label J</option>
								<option value="labelUs">Label US</option>
							</select>
						</label>

						<label className="block">
							<span className="block text-sm font-medium mb-1">Copies</span>
							<input
								type="number"
								value={copies}
								onChange={(e) =>
									setCopies(
										Math.max(1, Number.parseInt(e.target.value, 10) || 1),
									)
								}
								min={1}
								max={100}
								className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600"
							/>
						</label>
					</div>

					{labelType === "labelJp" && (
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={showCountryLabel}
								onChange={(e) => setShowCountryLabel(e.target.checked)}
								className="w-4 h-4"
							/>
							<span className="text-sm">Show JAPAN</span>
						</label>
					)}
				</div>

				{/* Right: Preview */}
				<div className="flex-1">
					<h3 className="text-sm font-medium mb-2">Preview:</h3>
					<div className="print-label w-[63.5mm] h-[38.1mm] p-2 border border-gray-300 dark:border-gray-600 bg-white text-black text-sm flex flex-col justify-between">
						{labelType === "labelUs" ? (
							<>
								<div className="text-left">{senderInfo.name}</div>
								<div className="text-left whitespace-pre-wrap">
									{senderInfo.address}
								</div>
							</>
						) : (
							<>
								<div className="text-left whitespace-pre-wrap">
									{senderInfo.address}
								</div>
								<div className="text-right">{senderInfo.name}</div>
								{showCountryLabel && (
									<div className="text-center text-xs font-bold">JAPAN</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>

			{/* Print content - visible only when printing */}
			<div className="print-show hidden">
				{Array.from({ length: copies }, (_, i) => `sender-copy-${i}`).map(
					(id) => (
						<div
							key={id}
							className="print-label w-[63.5mm] h-[38.1mm] p-2 bg-white text-black text-sm flex flex-col justify-between"
						>
							{labelType === "labelUs" ? (
								<>
									<div className="text-left">{senderInfo.name}</div>
									<div className="text-left whitespace-pre-wrap">
										{senderInfo.address}
									</div>
								</>
							) : (
								<>
									<div className="text-left whitespace-pre-wrap">
										{senderInfo.address}
									</div>
									<div className="text-right">{senderInfo.name}</div>
									{showCountryLabel && (
										<div className="text-center text-xs font-bold">JAPAN</div>
									)}
								</>
							)}
						</div>
					),
				)}
			</div>
		</div>
	);
};

export default SenderPrintPreview;
