import type { Address, LabelType } from "./types";

interface PrintLabelProps {
	address: Address;
	labelType?: LabelType;
	showCountryLabel?: boolean;
}

const PrintLabel = ({
	address,
	labelType,
	showCountryLabel = false,
}: PrintLabelProps) => {
	// Use address's printType, fallback to provided labelType, default to labelJp
	const effectiveType = address.printType ?? labelType ?? "labelJp";

	if (effectiveType === "labelUs") {
		return (
			<div className="print-label print-label-us w-[63.5mm] h-[38.1mm] p-2 border border-gray-300 dark:border-gray-600 bg-white text-black text-sm flex flex-col justify-center">
				<div className="text-left">
					{address.title} {address.name}
				</div>
				<div className="text-left whitespace-pre-wrap">{address.address}</div>
			</div>
		);
	}

	// labelJp (default)
	return (
		<div className="print-label print-label-jp w-[63.5mm] h-[38.1mm] p-2 border border-gray-300 dark:border-gray-600 bg-white text-black text-sm flex flex-col justify-between">
			<div className="text-left">
				{address.postalCodeJP && <span>〒 {address.postalCodeJP}</span>}
			</div>
			<div className="text-left whitespace-pre-wrap">{address.address}</div>
			<div className="text-right">
				{address.name} {address.title}
			</div>
			{showCountryLabel && (
				<div className="text-center text-xs font-bold">JAPAN</div>
			)}
		</div>
	);
};

export default PrintLabel;
