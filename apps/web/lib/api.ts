import type { CreateLinkResponse, ListLinksResponse, ShortLink } from "shared";

export const apiUrl =
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function shortUrl(code: string): string {
	return `${apiUrl}/${code}`;
}

export async function fetchLinks(): Promise<ShortLink[]> {
	const res = await fetch(`${apiUrl}/api/links`);
	const body = (await res.json()) as ListLinksResponse;
	if (!body.ok) {
		throw new Error(body.error);
	}
	return body.data;
}

export async function createLink(
	url: string,
	code?: string,
): Promise<ShortLink> {
	const res = await fetch(`${apiUrl}/api/links`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(code ? { url, code } : { url }),
	});
	const body = (await res.json()) as CreateLinkResponse;
	if (!body.ok) {
		throw new Error(body.error);
	}
	return body.data;
}
