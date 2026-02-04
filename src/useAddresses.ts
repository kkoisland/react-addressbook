import type { Address } from "./types";
import { useLocalStorage } from "./useLocalStorage";
import { generateUuid } from "./utilsUuid";

const STORAGE_KEY = "addressbook_addresses";

type NewAddress = Omit<Address, "id" | "createdAt" | "updatedAt">;

export function useAddresses() {
	const [addresses, setAddresses] = useLocalStorage<Address[]>(STORAGE_KEY, []);

	const addAddress = (data: NewAddress): Address => {
		const now = new Date().toISOString();
		const newAddress: Address = {
			...data,
			id: generateUuid(),
			createdAt: now,
			updatedAt: now,
		};
		setAddresses((prev) => [...prev, newAddress]);
		return newAddress;
	};

	const updateAddress = (id: string, updates: Partial<Address>): void => {
		setAddresses((prev) =>
			prev.map((addr) =>
				addr.id === id
					? { ...addr, ...updates, updatedAt: new Date().toISOString() }
					: addr,
			),
		);
	};

	const deleteAddress = (id: string): void => {
		setAddresses((prev) => prev.filter((addr) => addr.id !== id));
	};

	const getAddressById = (id: string): Address | undefined => {
		return addresses.find((addr) => addr.id === id);
	};

	return {
		addresses,
		addAddress,
		updateAddress,
		deleteAddress,
		getAddressById,
	};
}
