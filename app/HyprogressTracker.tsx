"use client";
import { useState } from "react";
import { getLevelXp, calculateCurrentLevel, calculateXpIntoLevel, calculateXpRemaining, calculateSourceCounts } from "@/lib/bedwarsXp";

type PlayerData = {
	username: string;
	totalXp: number;
};

export default function HyprogressTracker() {
	const [searchInput, setSearchInput] = useState("");
	const [player, setPlayer] = useState<PlayerData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSearch() {
		const username = searchInput.trim();

		if (!username || isLoading)
			return;

		setIsLoading(true);
		setPlayer(null);
		setError(null);

		try {
			const response = await fetch(`/api/player/${encodeURIComponent(username)}`);
			const data = await response.json();
			if (!response.ok)
				throw new Error(data.error || "Failed to find player");

			if (typeof data.xp !== "number" || !data.username)
				throw new Error("Invalid player data");

			setPlayer({
				username: data.username,
				totalXp: data.xp,
			});
		} catch (error) {
			console.error("Player search error:", error);
			setError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

	const currentLevel = player ? calculateCurrentLevel(player.totalXp) : 0;
	const xpIntoLevel = player ? calculateXpIntoLevel(player.totalXp) : 0;
	const xpRemaining = player ? calculateXpRemaining(player.totalXp) : 0;
	const progressPercent = player ? Math.round((xpIntoLevel / getLevelXp(currentLevel)) * 100) : 0;
	const sourceCounts = player ? calculateSourceCounts(xpRemaining) : [];

	return (
		<div className="relative min-h-screen overflow-hidden bg-slate-950">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[22px_22px]" />
			<div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-xl -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

			<div className="relative mx-auto max-w-3xl px-4 pb-24 text-slate-50 sm:px-6">
				<header className="flex flex-wrap items-center justify-between gap-y-2 border-b border-slate-800 py-6">
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-emerald-400" />
						<span className="text-sm font-semibold tracking-wide">HyProgress</span>
					</div>
					<nav className="flex gap-4 text-[11px] tracking-wide text-slate-500 sm:gap-6 sm:text-xs">
						<span className="text-slate-100">TRACKER</span>
					</nav>
				</header>

				<section className="border-b border-slate-800 py-14 text-center">
					<span className="mb-6 inline-block rounded-full border border-emerald-900 bg-emerald-400/5 px-4 py-1 text-[11px] tracking-widest text-emerald-400">
						HYPIXEL BEDWARS
					</span>
					<h1 className="mb-4 font-['Press_Start_2P'] text-2xl leading-[1.8] text-slate-100 sm:text-3xl">
						GRIND <span className="text-emerald-400">SMARTER</span>
					</h1>
					<p className="mx-auto mb-8 max-w-sm text-sm text-slate-500">
						Search a player and see exactly what it takes to reach the next star.
					</p>

					<div className="mx-auto flex max-w-md gap-2">
						<input
							className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
							placeholder="Search a Hypixel player..."
							value={searchInput}
							onChange={(event) => setSearchInput(event.target.value)}
							onKeyDown={(event) => { if (event.key === "Enter") handleSearch(); }}
						/>
						<button
							className="shrink-0 rounded-lg bg-emerald-400 px-5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-50"
							onClick={handleSearch}
							disabled={isLoading}
						>
							{isLoading ? "..." : "Search"}
						</button>
					</div>
					{error && (
						<p className="mt-3 text-xs text-red-400">
							{error}
						</p>
					)}
				</section>

				{player && (
					<>
						<section className="flex flex-col gap-6 border-b border-slate-800 py-10 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-4">
								<span className="font-['Press_Start_2P'] text-3xl text-amber-400">{currentLevel}</span>
								<div>
									<p className="text-base font-semibold text-slate-100">{player.username}</p>
									<p className="text-xs tracking-wide text-slate-500">
										{player.totalXp.toLocaleString()} XP
									</p>
								</div>
							</div>

							<div className="w-full sm:w-72">
								<div className="mb-1.5 flex justify-between font-mono text-[11px] text-slate-500">
									<span>LVL {currentLevel} &rarr; {currentLevel + 1}</span>
									<span><span>
										{xpIntoLevel.toLocaleString()} /{" "}
										{getLevelXp(currentLevel).toLocaleString()}
									</span></span>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-slate-800">
									<div
										className="h-full rounded-full bg-emerald-400"
										style={{ width: `${progressPercent}%` }}
									/>
								</div>
							</div>
						</section>

						<section className="py-10">
							<div className="mb-6 flex items-baseline justify-between">
								<h2 className="text-sm font-semibold tracking-wide text-slate-100">NEXT LEVEL GOAL</h2>
								<span className="font-mono text-sm text-emerald-400">{xpRemaining.toLocaleString()} XP left</span>
							</div>

							<div className="divide-y divide-slate-800 rounded-lg border border-slate-800">
								{sourceCounts.map((source) => (
									<div key={source.id} className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm text-slate-300">{source.label}</p>
											<p className="text-[11px] text-slate-600 sm:hidden">{source.xpEach} XP each</p>
										</div>

										<div className="hidden flex-1 items-center gap-3 sm:flex">
											<div className="h-1.5 flex-1 rounded-full bg-slate-800">
												<div
													className="h-full rounded-full bg-emerald-400/40"
													style={{ width: `${source.efficiencyPercent}%` }}
												/>
											</div>
											<span className="w-14 shrink-0 text-right font-mono text-[11px] text-slate-500">
												{source.xpEach} XP
											</span>
										</div>

										<div className="shrink-0 text-right font-mono text-base font-semibold text-slate-100">
											~{source.count.toLocaleString()}
										</div>
									</div>
								))}
							</div>
						</section>
					</>
				)}
			</div>
		</div>
	);
}