"use client";

import { useCallback, useEffect, useState } from "react";
import type { ShortLink } from "shared";
import { createLink, fetchLinks } from "../lib/api";

export function useLinks() {
	const [links, setLinks] = useState<ShortLink[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		fetchLinks()
			.then((data) => {
				if (!cancelled) {
					setLinks(data);
					setError(null);
				}
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : "Failed to load links");
				}
			})
			.finally(() => {
				if (!cancelled) {
					setLoading(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const addLink = useCallback(async (url: string, code?: string) => {
		const link = await createLink(url, code);
		setLinks((prev) => [link, ...prev]);
		return link;
	}, []);

	return { links, loading, error, addLink };
}
