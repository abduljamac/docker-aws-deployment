"use client";

import { useLinks } from "../hooks/use-links";
import { LinkForm } from "./components/link-form";
import { LinkList } from "./components/link-list";

export default function Home() {
	const { links, loading, error, addLink } = useLinks();

	return (
		<div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex w-full max-w-3xl flex-1 flex-col gap-8 bg-white px-6 py-16 sm:px-16 dark:bg-black">
				<header className="flex flex-col gap-2">
					<h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
						Short links
					</h1>
					<p className="text-sm text-zinc-500">
						Paste a long URL, get a short one back.
					</p>
				</header>
				<LinkForm onCreate={addLink} />
				{error && (
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				)}
				<LinkList links={links} loading={loading} />
			</main>
		</div>
	);
}
