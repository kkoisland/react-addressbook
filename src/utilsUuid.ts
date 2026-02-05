const generateUuid = (): string => {
	return crypto.randomUUID();
};

export default generateUuid;
