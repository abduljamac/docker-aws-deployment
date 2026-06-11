"use client";

import { useState } from "react";
import type { ShortLink } from "shared";
import { shortUrl } from "../../lib/api";

type LinkListProps = {
	links: ShortLink[];
	loading: boolean;
};

export function LinkList({ links, loading }: LinkListProps) {
	const [copiedCode, setCopiedCode] = useState<string | null>(null);

	async function copy(code: string) {
		await navigator.clipboard.writeText(shortUrl(code));
		setCopiedCode(code);
		setTimeout(() => setCopiedCode(null), 1500);
	}

	if (loading) {
		return <p className="text-sm text-zinc-500">Loading links…</p>;
	}

	if (links.length === 0) {
		return (
			<p className="text-sm text-zinc-500">
				No links yet. Shorten your first URL above.
			</p>
		);
	}

	return (
		<ul className="flex w-full flex-col divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
			{links.map((link) => (
				<li
					key={link.code}
					className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
				>
					<div className="flex min-w-0 flex-col gap-1">
						<a
							href={shortUrl(link.code)}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
						>
							{shortUrl(link.code)}
						</a>
						<span className="truncate text-xs text-zinc-500">{link.url}</span>
					</div>
					<div className="flex shrink-0 items-center gap-3">
						<span className="text-xs text-zinc-500">
							{link.clicks} click{link.clicks === 1 ? "" : "s"}
						</span>
						<button
							type="button"
							onClick={() => copy(link.code)}
							className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
						>
							{copiedCode === link.code ? "Copied!" : "Copy"}
						</button>
					</div>
				</li>
			))}
		</ul>
	);
}
