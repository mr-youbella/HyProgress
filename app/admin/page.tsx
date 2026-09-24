import Link from "next/link";
import type { Metadata } from "next";
import { getAdminSearchStats } from "@/lib/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Admin dashboard",
	robots: { index: false, follow: false }
};

function formatDate(date: Date): string {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(date);
}

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-xl border border-white/10 bg-white/3 p-5">
			<p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
				{label}
			</p>
			<p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-emerald-300">
				{value.toLocaleString()}
			</p>
		</div>
	);
}

export default async function AdminPage() {
	const stats = await getAdminSearchStats();

	return (
		<main className="min-h-screen bg-[#0B0B0F] px-5 py-8 text-stone-100 sm:px-8 sm:py-12">
			<div className="mx-auto max-w-5xl">
				<header className="flex items-center justify-between border-b border-white/10 pb-6">
					<div>
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
							Hyprogress · Private
						</p>
						<h1 className="mt-2 font-['Fraunces'] text-3xl font-semibold tracking-tight sm:text-4xl">
							Admin dashboard
						</h1>
					</div>
					<Link className="rounded-lg border border-white/10 px-3 py-2 text-xs text-stone-400 hover:text-stone-100" href="/">
						View site
					</Link>
				</header>

				{!stats ? (
					<section className="mt-8 rounded-xl border border-amber-400/25 bg-amber-400/5 p-6">
						<h2 className="font-semibold text-amber-200">Analytics are unavailable</h2>
						<p className="mt-2 text-sm text-stone-400">
							Check DATABASE_URL, SUPABASE_CA_CERT, the player_searches table, and Vercel logs.
						</p>
					</section>
				) : (
					<>
						<section className="mt-8 grid gap-3 sm:grid-cols-3">
							<Stat label="Total searches" value={stats.totalSearches} />
							<Stat label="Unique players" value={stats.uniquePlayers} />
							<Stat label="Last 24 hours" value={stats.searchesLast24Hours} />
						</section>

						<section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
							<div className="overflow-hidden rounded-xl border border-white/10 bg-white/3">
								<div className="border-b border-white/10 px-5 py-4">
									<h2 className="font-semibold">Latest searches</h2>
									<p className="mt-1 text-xs text-stone-500">Latest 30 completed searches.</p>
								</div>
								<div className="divide-y divide-white/5">
									{stats.recentSearches.length === 0 ? (
										<p className="px-5 py-8 text-sm text-stone-500">No searches yet.</p>
									) : (
										stats.recentSearches.map((search, index) => (
											<div className="flex items-center justify-between gap-4 px-5 py-3" key={`${search.playerName}-${search.searchedAt.getTime()}-${index}`}>
												<Link target="_blank" className="font-mono text-sm text-emerald-300 hover:text-emerald-200" href={`/player/${encodeURIComponent(search.playerName)}?from=admin`}>
													{search.playerName}
												</Link>
												<time className="shrink-0 text-right text-[11px] text-stone-500" dateTime={search.searchedAt.toISOString()}>
													{formatDate(search.searchedAt)}
												</time>
											</div>
										))
									)}
								</div>
							</div>

							<div className="overflow-hidden rounded-xl border border-white/10 bg-white/3">
								<div className="border-b border-white/10 px-5 py-4">
									<h2 className="font-semibold">Most searched players</h2>
									<p className="mt-1 text-xs text-stone-500">Search count and latest search.</p>
								</div>
								<div className="divide-y divide-white/5">
									{stats.topPlayers.length === 0 ? (
										<p className="px-5 py-8 text-sm text-stone-500">No searches yet.</p>
									) : (
										stats.topPlayers.map((player) => (
											<div className="px-5 py-3" key={player.playerName}>
												<div className="flex items-center justify-between gap-3">
													<Link target="_blank" className="truncate font-mono text-sm text-emerald-300 hover:text-emerald-200" href={`/player/${encodeURIComponent(player.playerName)}?from=admin`}>
														{player.playerName}
													</Link>
													<span className="font-mono text-sm tabular-nums">{player.searchCount.toLocaleString()}</span>
												</div>
												<time className="mt-1 block text-[11px] text-stone-500" dateTime={player.lastSearchedAt.toISOString()}>
													Last: {formatDate(player.lastSearchedAt)}
												</time>
											</div>
										))
									)}
								</div>
							</div>
						</section>
					</>
				)}
			</div>
		</main>
	);
}
