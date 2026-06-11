import type { ShortLink } from "shared";
import { pool } from "../config/db.js";
import { generateCode } from "../utils/generate-code.js";
import { HttpError } from "../utils/http-error.js";

const CODE_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;
const RESERVED_CODES = new Set(["api", "health"]);
const UNIQUE_VIOLATION = "23505";
const MAX_GENERATE_ATTEMPTS = 5;

type LinkRow = {
	code: string;
	url: string;
	clicks: number;
	created_at: Date;
};

function toShortLink(row: LinkRow): ShortLink {
	return {
		code: row.code,
		url: row.url,
		clicks: row.clicks,
		createdAt: new Date(row.created_at).toISOString(),
	};
}

function isUniqueViolation(err: unknown): boolean {
	return (
		typeof err === "object" &&
		err !== null &&
		(err as { code?: string }).code === UNIQUE_VIOLATION
	);
}

function assertValidUrl(url: unknown): asserts url is string {
	if (typeof url !== "string") {
		throw new HttpError(400, "url is required");
	}
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new HttpError(400, "url must be a valid URL");
	}
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw new HttpError(400, "url must use http or https");
	}
}

async function insertLink(code: string, url: string): Promise<ShortLink> {
	const result = await pool.query<LinkRow>(
		"INSERT INTO links (code, url) VALUES ($1, $2) RETURNING code, url, clicks, created_at",
		[code, url],
	);
	return toShortLink(result.rows[0]);
}

export async function createLink(
	url: unknown,
	customCode?: unknown,
): Promise<ShortLink> {
	assertValidUrl(url);

	if (customCode !== undefined) {
		if (typeof customCode !== "string" || !CODE_PATTERN.test(customCode)) {
			throw new HttpError(
				400,
				"code must be 3-32 characters: letters, numbers, - or _",
			);
		}
		if (RESERVED_CODES.has(customCode)) {
			throw new HttpError(400, `"${customCode}" is a reserved code`);
		}
		try {
			return await insertLink(customCode, url);
		} catch (err) {
			if (isUniqueViolation(err)) {
				throw new HttpError(409, `code "${customCode}" is already taken`);
			}
			throw err;
		}
	}

	let lastError: unknown;
	for (let attempt = 0; attempt < MAX_GENERATE_ATTEMPTS; attempt++) {
		try {
			return await insertLink(generateCode(), url);
		} catch (err) {
			if (!isUniqueViolation(err)) {
				throw err;
			}
			lastError = err;
		}
	}
	throw lastError;
}

export async function listLinks(): Promise<ShortLink[]> {
	const result = await pool.query<LinkRow>(
		"SELECT code, url, clicks, created_at FROM links ORDER BY created_at DESC",
	);
	return result.rows.map(toShortLink);
}

export async function resolveLink(code: string): Promise<string | null> {
	const result = await pool.query<{ url: string }>(
		"UPDATE links SET clicks = clicks + 1 WHERE code = $1 RETURNING url",
		[code],
	);
	return result.rows[0]?.url ?? null;
}
