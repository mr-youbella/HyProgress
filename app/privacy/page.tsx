import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description: "How Hyprogress handles search analytics, rate limiting, and third-party API data.",
	alternates: { canonical: "/privacy" }
};

const sections = [
	{
		title: "What Hyprogress collects",
		content: "When a player lookup completes, Hyprogress stores the searched Minecraft player name and the time of the search. This information is used to power the private Admin analytics dashboard and understand which player pages are useful. Hyprogress does not require an account or ask for your Minecraft password."
	},
	{
		title: "Rate limiting",
		content: "The service uses the request IP address temporarily to limit repeated API requests and reduce abuse. The application does not intentionally save that IP address in its player_searches database table."
	},
	{
		title: "External services",
		content: "Player data is requested from Mojang and Hypixel. The displayed public statistics may include Bedwars level, total games played, wins, kills, final kills, beds, and related values. Skin images may be loaded from Statsify. Search analytics are stored in a hosted PostgreSQL database, and temporary rate-limit counters are handled by Upstash Redis. Each service may process requests according to its own privacy policy."
	},
	{
		title: "Cookies and Admin access",
		content: "The public player search does not require an account. The private Admin area uses a short-lived, HttpOnly session cookie after successful authentication. This cookie is used only to protect Admin preview actions and is not used to identify public visitors."
	},
	{
		title: "Data retention and requests",
		content: "Search records remain until the project owner removes them or changes the database retention policy. If you have a question about a search record or want to request its removal, contact the project owner through the project’s official contact channel."
	}
];

export default function PrivacyPage() {
	return (
		<main className="flex min-h-dvh flex-col bg-[#0B0B0F] px-5 py-8 text-stone-100 sm:px-8 sm:py-12">
			<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
				<header className="flex items-center justify-between border-b border-white/10 pb-6">
					<Link className="flex items-center gap-2 text-sm font-semibold tracking-[0.08em] text-stone-200" href="/">
						<Image src="/logo.svg" alt="Hyprogress" width={20} height={20} className="rounded-sm" />
						HYPROGRESS
					</Link>
					<Link className="text-xs text-stone-500 transition-colors hover:text-stone-200" href="/">
						Back to search
					</Link>
				</header>

				<section className="border-b border-white/10 py-14 sm:py-20">
					<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Hyprogress</p>
					<h1 className="mt-3 font-['Fraunces'] text-4xl font-semibold tracking-tight text-stone-50 sm:text-5xl">
						Privacy Policy
					</h1>
					<p className="mt-4 max-w-xl text-sm leading-7 text-stone-400">
						A clear explanation of what the site uses, why it is used, and what is not collected.
					</p>
					<p className="mt-6 font-mono text-[11px] text-stone-600">Last updated: October 1, 2026</p>
				</section>

				<div className="divide-y divide-white/10">
					{sections.map((section) => (
						<section className="py-8" key={section.title}>
							<h2 className="text-sm font-semibold tracking-[0.08em] text-stone-200">{section.title}</h2>
							<p className="mt-3 text-sm leading-7 text-stone-400">{section.content}</p>
						</section>
					))}
				</div>

				<footer className="mt-auto border-t border-white/10 pt-7 text-xs leading-6 text-stone-600">
					Hyprogress is an independent community project and is not affiliated with Mojang, Hypixel, or Minecraft.
				</footer>
			</div>
		</main>
	);
}
