/** Standard API response wrapper */
export type ApiResponse<T> =
	| { ok: true; data: T }
	| { ok: false; error: string };

/** GET /health */
export type HealthResponse = {
	ok: boolean;
};

/** Error response with optional error code */
export type ErrorResponse = {
	ok: false;
	error: string;
	code?: string;
};

/** A stored short link */
export type ShortLink = {
	code: string;
	url: string;
	clicks: number;
	createdAt: string;
};

/** POST /api/links request body */
export type CreateLinkRequest = {
	url: string;
	code?: string;
};

/** POST /api/links response */
export type CreateLinkResponse = ApiResponse<ShortLink>;

/** GET /api/links response */
export type ListLinksResponse = ApiResponse<ShortLink[]>;

/** Paginated list response */
export type PaginatedResponse<T> = {
	ok: true;
	data: T[];
	total: number;
	page: number;
	pageSize: number;
};
