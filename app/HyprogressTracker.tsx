"use client";
import { useState } from "react";
import { getLevelXp, calculateCurrentLevel, calculateXpIntoLevel, calculateXpRemaining, calculateSourceCounts } from "@/lib/bedwarsXp";
import Image from "next/image";

type PlayerData = {
	username: string;
	totalXp: number;
};

type CategoryId = "wins" | "combat" | "resources" | "time";

type CategoryMeta = {
	label: string;
	textClass: string;
	dotClass: string;
	borderClass: string;
};

const CATEGORY_ORDER: CategoryId[] = ["wins", "combat", "resources", "time"];

const CATEGORY_META: Record<CategoryId, CategoryMeta> = {
	wins: { label: "Wins", textClass: "text-emerald-400", dotClass: "bg-emerald-400", borderClass: "border-emerald-400/40" },
	combat: { label: "Combat", textClass: "text-rose-400", dotClass: "bg-rose-400", borderClass: "border-rose-400/40" },
	resources: { label: "Resources", textClass: "text-amber-400", dotClass: "bg-amber-400", borderClass: "border-amber-400/40" },
	time: { label: "Time", textClass: "text-sky-400", dotClass: "bg-sky-400", borderClass: "border-sky-400/40" }
};

const SOURCE_CATEGORY: Record<string, CategoryId> = {
	soloWin: "wins",
	threeFourWin: "wins",
	dreamsWin: "wins",
	finalKill: "combat",
	firstKill: "combat",
	bedDestroyed: "combat",
	diamond: "resources",
	emerald: "resources",
	minutePlayed: "time"
};

type PrestigeTier = {
	textClass: string;
	fillClass: string;
};

function getPrestigeTier(level: number): PrestigeTier {
	if (level >= 400)
		return { textClass: "text-emerald-300", fillClass: "bg-emerald-400" };
	if (level >= 300)
		return { textClass: "text-cyan-300", fillClass: "bg-cyan-400" };
	if (level >= 200)
		return { textClass: "text-amber-300", fillClass: "bg-amber-400" };
	if (level >= 100)
		return { textClass: "text-slate-300", fillClass: "bg-slate-400" };

	return { textClass: "text-stone-300", fillClass: "bg-stone-400" };
}

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
				throw new Error(data.error || "Couldn't find that player. Check the spelling and try again.");

			if (typeof data.xp !== "number" || !data.username)
				throw new Error("Hypixel returned unexpected data for that player.");

			setPlayer({ username: data.username, totalXp: data.xp });
		}
		catch (error) {
			console.error("Player search error:", error);
			setError(error instanceof Error ? error.message : "Something went wrong. Try again in a moment.");
		}
		finally {
			setIsLoading(false);
		}
	}

	const currentLevel = player ? calculateCurrentLevel(player.totalXp) : 0;
	const xpIntoLevel = player ? calculateXpIntoLevel(player.totalXp) : 0;
	const xpRemaining = player ? calculateXpRemaining(player.totalXp) : 0;
	const levelXp = player ? getLevelXp(currentLevel) : 0;
	const progressPercent = player ? Math.round((xpIntoLevel / levelXp) * 100) : 0;
	const sourceCounts = player ? calculateSourceCounts(xpRemaining) : [];
	const tier = getPrestigeTier(currentLevel);

	const groupedSources = CATEGORY_ORDER.map((categoryId) => {
		return {
			categoryId,
			meta: CATEGORY_META[categoryId],
			rows: sourceCounts.filter((source) => SOURCE_CATEGORY[source.id] === categoryId)
		};
	}).filter((group) => group.rows.length > 0);

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#0B0B0F] text-stone-100">

			<div className="relative mx-auto max-w-2xl px-5 pb-24 sm:px-6">
				<header className="flex items-center justify-between border-b border-white/10 py-6">
					<div className="flex items-center gap-2">
						<Image src="/logo.svg" alt="Hyprogress" width={30} height={30} className="rounded-sm" />
						<span className="text-[13px] font-semibold tracking-[0.08em]">HyPprogress</span>
					</div>
					<span className="text-[11px] tracking-[0.14em] text-stone-500">TRACKER</span>
				</header>

				<section className="border-b border-white/10 py-16 text-center">
					<span className="mb-7 inline-block rounded-full border border-white/10 px-3.5 py-1 text-[10px] tracking-[0.18em] text-stone-400">
						HYPIXEL BEDWARS
					</span>
					<h1 className="mb-4 font-['Fraunces'] text-[2.5rem] font-semibold leading-[1.15] tracking-tight text-stone-50 sm:text-5xl">
						Know exactly<br />what&rsquo;s <em className="text-emerald-400">left</em>.
					</h1>
					<p className="mx-auto mb-9 max-w-sm text-[15px] leading-relaxed text-stone-500">
						Search any player and see a clear breakdown of what closes the gap to their next star.
					</p>

					<div className="mx-auto flex max-w-md items-stretch gap-2">
						<div className="relative flex-1">
							<span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-stone-600">
								&gt;
							</span>
							<input
								className="w-full rounded-lg border border-white/10 bg-white/3 py-3 pl-8 pr-4 font-mono text-sm text-stone-100 placeholder:text-stone-600 focus:border-emerald-400/60 focus:outline-none"
								placeholder="e.g. Technoblade"
								value={searchInput}
								onChange={(event) => setSearchInput(event.target.value)}
								onKeyDown={(event) => { if (event.key === "Enter") handleSearch(); }}
							/>
						</div>
						<button
							className="shrink-0 rounded-lg bg-emerald-400 px-5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-50"
							onClick={handleSearch}
							disabled={isLoading}
						>
							{isLoading ? "Searching" : "Search"}
						</button>
					</div>

					{error && (
						<p className="mt-4 text-[13px] text-rose-400">{error}</p>
					)}
				</section>

				{player && (
					<section className="pt-12">
						<div className="rounded-2xl bg-linear-to-b from-white/6 to-white/0 p-px">
							<div className="rounded-[15px] bg-[#101014] px-6 py-7 sm:px-8">
								<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
									<div className="flex items-center gap-4">
										<span className={`font-mono text-5xl font-bold tabular-nums ${tier.textClass}`}>
											{currentLevel}
										</span>
										<span className={`h-1.5 w-1.5 rounded-full ${tier.fillClass}`} />
										<p className="font-['Fraunces'] text-xl text-stone-50">{player.username}</p>
									</div>
									<div className="font-mono text-sm text-stone-500">
										{player.totalXp.toLocaleString()} XP total
									</div>
								</div>

								<div className="mt-6">
									<div className="mb-1.5 flex justify-between font-mono text-[11px] text-stone-500">
										<span>LVL {currentLevel} &rarr; {currentLevel + 1}</span>
										<span>{xpIntoLevel.toLocaleString()} / {levelXp.toLocaleString()} &middot; {progressPercent}%</span>
									</div>
									<div className="h-1.5 overflow-hidden rounded-full bg-white/5">
										<div className="h-full rounded-full bg-emerald-400" style={{ width: `${progressPercent}%` }} />
									</div>
								</div>

								<div className="relative my-7">
									<div className="absolute -left-9 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#0B0B0F] sm:-left-11" />
									<div className="absolute -right-9 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#0B0B0F] sm:-right-11" />
									<div className="border-t border-dashed border-white/15" />
								</div>

								<div className="mb-5 flex items-baseline justify-between">
									<h2 className="text-[13px] font-semibold tracking-[0.08em] text-stone-200">NEXT LEVEL GOAL</h2>
									<span className="font-mono text-sm text-emerald-400">{xpRemaining.toLocaleString()} XP left</span>
								</div>

								<div className="space-y-6">
									{groupedSources.map((group) => (
										<div key={group.categoryId}>
											<div className="mb-2 flex items-center gap-2">
												<span className={`h-1.5 w-1.5 rounded-full ${group.meta.dotClass}`} />
												<span className="text-[10px] font-semibold tracking-[0.14em] text-stone-500">
													{group.meta.label.toUpperCase()}
												</span>
											</div>
											<div className="space-y-2.5">
												{group.rows.map((source) => (
													<div
														key={source.id}
														className={`flex items-center justify-between gap-3 border-l-2 pl-3 ${group.meta.borderClass}`}
													>
														<div className="min-w-0">
															<p className="truncate text-[14px] text-stone-300">{source.label}</p>
															<p className="font-mono text-[11px] text-stone-600">{source.xpEach} XP each</p>
														</div>
														<span className="shrink-0 font-mono text-lg font-semibold tabular-nums text-stone-100">
															~{source.count.toLocaleString()}
														</span>
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
