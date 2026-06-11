"use client";

import { useState } from "react";

type LinkFormProps = {
	onCreate: (url: string, code?: string) => Promise<unknown>;
};

export function LinkForm({ onCreate }: LinkFormProps) {
	const [url, setUrl] = useState("");
	const [code, setCode] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			await onCreate(url.trim(), code.trim() || undefined);
			setUrl("");
			setCode("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create link");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
			<div className="flex flex-col gap-3 sm:flex-row">
				<input
					type="url"
					required
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="https://example.com/a/very/long/url"
					className="h-12 flex-1 rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
				/>
				<input
					type="text"
					value={code}
					onChange={(e) => setCode(e.target.value)}
					placeholder="custom-code (optional)"
					pattern="[A-Za-z0-9_-]{3,32}"
					title="3-32 characters: letters, numbers, - or _"
					className="h-12 rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 sm:w-56 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
				/>
				<button
					type="submit"
					disabled={submitting}
					className="h-12 rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
				>
					{submitting ? "Shortening…" : "Shorten"}
				</button>
			</div>
			{error && (
				<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
			)}
		</form>
	);
}
