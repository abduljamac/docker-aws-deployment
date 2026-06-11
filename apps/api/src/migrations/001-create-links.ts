export const createLinksTable = `
	CREATE TABLE IF NOT EXISTS links (
		code TEXT PRIMARY KEY,
		url TEXT NOT NULL,
		clicks INTEGER NOT NULL DEFAULT 0,
		created_at TIMESTAMPTZ NOT NULL DEFAULT now()
	);
`;
