"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getLevelXp, calculateCurrentLevel, calculateXpIntoLevel, calculateXpRemaining, calculateSourceCounts } from "@/lib/bedwarsXp";

type PlayerData = {
	username: string;
	skinUrl: string;
	totalXp: number;
	online: boolean;
	gameType: string | null;
	mode: string | null;
	lastLogin: number | null;
	firstLogin: number | null;
	guildName: string | null;
	guildTag: string | null;
	guildRank: string | null;
	hypixelRank: string | null;
	wins: number;
	losses: number;
	kills: number;
	deaths: number;
	finalKills: number;
	finalDeaths: number;
	bedsBroken: number;
	bedsLost: number;
	meleeKills: number;
	voidKills: number;
	fallKills: number;
	explosionKills: number;
	magicKills: number;
	fireKills: number;
	projectileKills: number;
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

function formatRatio(numerator: number, denominator: number): string {
	if (denominator === 0)
		return numerator > 0 ? "∞" : "0.00";

	return (numerator / denominator).toFixed(2);
}

function humanizeToken(value: string): string {
	return value
		.toLowerCase()
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function formatRelativeTime(timestampMs: number): string {
	const diffMs = Date.now() - timestampMs;
	const minute = 60_000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (diffMs < minute)
		return "just now";
	if (diffMs < hour)
		return `${Math.floor(diffMs / minute)}m ago`;
	if (diffMs < day)
		return `${Math.floor(diffMs / hour)}h ago`;

	return `${Math.floor(diffMs / day)}d ago`;
}

function formatDate(timestampMs: number): string {
	return new Date(timestampMs).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

function getHypixelRankColor(rank: string | null): string {
	if (!rank)
		return "text-stone-400";

	const rankUpper = rank.toUpperCase();

	if (rankUpper.includes("YOUTUBE") || rankUpper.includes("YT"))
		return "text-red-500";
	if (rankUpper.includes("ADMIN"))
		return "text-red-500";
	if (rankUpper.includes("MODERATOR") || rankUpper.includes("MOD"))
		return "text-emerald-400";
	if (rankUpper.includes("HELPER"))
		return "text-blue-400";

	if (rankUpper.includes("SUPERSTAR") || rankUpper.includes("MVP++"))
		return "text-amber-400";

	if (rankUpper === "MVP_PLUS" || rankUpper.includes("MVP+"))
		return "text-cyan-400";

	if (rankUpper === "MVP" || rankUpper.includes("MVP"))
		return "text-cyan-300";

	if (rankUpper === "VIP_PLUS" || rankUpper.includes("VIP+"))
		return "text-emerald-300";

	if (rankUpper === "VIP" || rankUpper.includes("VIP"))
		return "text-emerald-500";

	return "text-stone-400";
}

function getRankPrefix(rank: string | null): string {
	if (!rank)
		return "";

	const rankUpper = rank.toUpperCase();

	if (rankUpper.includes("YOUTUBE"))
		return "[YOUTUBE] ";
	if (rankUpper.includes("ADMIN"))
		return "[ADMIN] ";
	if (rankUpper.includes("MODERATOR") || rankUpper.includes("MOD"))
		return "[MOD] ";
	if (rankUpper.includes("HELPER"))
		return "[HELPER] ";

	if (rankUpper.includes("SUPERSTAR"))
		return "[MVP++] ";
	if (rankUpper === "MVP_PLUS")
		return "[MVP+] ";
	if (rankUpper === "MVP")
		return "[MVP] ";
	if (rankUpper === "VIP_PLUS")
		return "[VIP+] ";
	if (rankUpper === "VIP")
		return "[VIP] ";

	if (rankUpper.includes("MVP++"))
		return "[MVP++] ";
	if (rankUpper.includes("MVP+"))
		return "[MVP+] ";
	if (rankUpper.includes("MVP"))
		return "[MVP] ";
	if (rankUpper.includes("VIP+"))
		return "[VIP+] ";
	if (rankUpper.includes("VIP"))
		return "[VIP] ";

	return "";
}

type StatTile = {
	label: string;
	value: string;
	valueClass: string;
};

function buildStatRows(player: PlayerData): StatTile[][] {
	return [
		[
			{ label: "Wins", value: player.wins.toLocaleString(), valueClass: "text-emerald-400" },
			{ label: "Losses", value: player.losses.toLocaleString(), valueClass: "text-rose-400" },
			{ label: "WLR", value: formatRatio(player.wins, player.losses), valueClass: "text-amber-400" }
		],
		[
			{ label: "Final Kills", value: player.finalKills.toLocaleString(), valueClass: "text-emerald-400" },
			{ label: "Final Deaths", value: player.finalDeaths.toLocaleString(), valueClass: "text-rose-400" },
			{ label: "FKDR", value: formatRatio(player.finalKills, player.finalDeaths), valueClass: "text-amber-400" }
		],
		[
			{ label: "Kills", value: player.kills.toLocaleString(), valueClass: "text-emerald-400" },
			{ label: "Deaths", value: player.deaths.toLocaleString(), valueClass: "text-rose-400" },
			{ label: "KDR", value: formatRatio(player.kills, player.deaths), valueClass: "text-amber-400" }
		],
		[
			{ label: "Beds Broken", value: player.bedsBroken.toLocaleString(), valueClass: "text-emerald-400" },
			{ label: "Beds Lost", value: player.bedsLost.toLocaleString(), valueClass: "text-rose-400" },
			{ label: "BBLR", value: formatRatio(player.bedsBroken, player.bedsLost), valueClass: "text-amber-400" }
		]
	];
}

function toPlayerData(data: Record<string, unknown>): PlayerData {
	return {
		username: String(data.username),
		skinUrl: String(data.skinUrl),
		totalXp: Number(data.xp),
		online: Boolean(data.online),
		gameType: typeof data.gameType === "string" ? data.gameType : null,
		mode: typeof data.mode === "string" ? data.mode : null,
		lastLogin: typeof data.lastLogin === "number" ? data.lastLogin : null,
		firstLogin: typeof data.firstLogin === "number" ? data.firstLogin : null,
		guildName: typeof data.guildName === "string" ? data.guildName : null,
		guildTag: typeof data.guildTag === "string" ? data.guildTag : null,
		guildRank: typeof data.guildRank === "string" ? data.guildRank : null,
		hypixelRank: typeof data.hypixelRank === "string" ? data.hypixelRank : null,
		wins: Number(data.wins ?? 0),
		losses: Number(data.losses ?? 0),
		kills: Number(data.kills ?? 0),
		deaths: Number(data.deaths ?? 0),
		finalKills: Number(data.finalKills ?? 0),
		finalDeaths: Number(data.finalDeaths ?? 0),
		bedsBroken: Number(data.bedsBroken ?? 0),
		bedsLost: Number(data.bedsLost ?? 0),
		meleeKills: Number(data.meleeKills ?? 0),
		voidKills: Number(data.voidKills ?? 0),
		fallKills: Number(data.fallKills ?? 0),
		explosionKills: Number(data.explosionKills ?? 0),
		magicKills: Number(data.magicKills ?? 0),
		fireKills: Number(data.fireKills ?? 0),
		projectileKills: Number(data.projectileKills ?? 0)
	};
}

async function fetchPlayerData(username: string): Promise<PlayerData> {
	const response = await fetch(`/api/player/${encodeURIComponent(username)}`);
	const data = await response.json();

	if (!response.ok)
		throw new Error(data.error || "Couldn't find that player. Check the spelling and try again.");

	if (typeof data.xp !== "number" || !data.username)
		throw new Error("Hypixel returned unexpected data for that player.");

	return toPlayerData(data);
}

export default function HyprogressTracker({ initialUsername }: { initialUsername?: string }) {
	const [searchInput, setSearchInput] = useState(initialUsername ?? "");
	const [player, setPlayer] = useState<PlayerData | null>(null);
	const [friendInput, setFriendInput] = useState("");
	const [friend, setFriend] = useState<PlayerData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isFriendLoading, setIsFriendLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [friendError, setFriendError] = useState<string | null>(null);
	const [isCopied, setIsCopied] = useState(false);

	useEffect(() => {
		if (!initialUsername)
			return;

		const username = initialUsername;
		let isCancelled = false;

		async function loadPlayer() {
			setIsLoading(true);
			setPlayer(null);
			setError(null);

			try {
				const result = await fetchPlayerData(username);
				if (!isCancelled)
					setPlayer(result);
			}
			catch (error) {
				if (!isCancelled)
					setError(error instanceof Error ? error.message : "Something went wrong. Try again in a moment.");
			}
			finally {
				if (!isCancelled)
					setIsLoading(false);
			}
		}

		void loadPlayer();
		return () => { isCancelled = true; };
	}, [initialUsername]);

	async function handleSearch() {
		const username = searchInput.trim();

		if (!username || isLoading)
			return;

		setIsLoading(true);
		setPlayer(null);
		setError(null);

		try {
			const result = await fetchPlayerData(username);
			setPlayer(result);
			window.history.pushState({}, "", `/${encodeURIComponent(result.username)}`);
		}
		catch (error) {
			console.error("Player search error:", error);
			setError(error instanceof Error ? error.message : "Something went wrong. Try again in a moment.");
		}
		finally {
			setIsLoading(false);
		}
	}

	async function handleShare() {
		if (!player)
			return;

		try {
			await navigator.clipboard.writeText(`${window.location.origin}/${encodeURIComponent(player.username)}`);
			setIsCopied(true);
			window.setTimeout(() => setIsCopied(false), 2_000);
		}
		catch {
			setError("Couldn't copy the player link. Please copy it from the address bar.");
		}
	}

	async function handleFriendSearch() {
		const username = friendInput.trim();

		if (!username || isFriendLoading)
			return;

		setIsFriendLoading(true);
		setFriend(null);
		setFriendError(null);

		try {
			const response = await fetch(`/api/player/${encodeURIComponent(username)}`);
			const data = await response.json();

			if (!response.ok)
				throw new Error(data.error || "Couldn't find that player. Check the spelling and try again.");

			if (typeof data.xp !== "number" || !data.username)
				throw new Error("Hypixel returned unexpected data for that player.");

			setFriend(toPlayerData(data));
		}
		catch (error) {
			console.error("Friend search error:", error);
			setFriendError(error instanceof Error ? error.message : "Something went wrong. Try again in a moment.");
		}
		finally {
			setIsFriendLoading(false);
		}
	}

	const currentLevel = player ? calculateCurrentLevel(player.totalXp) : 0;
	const xpIntoLevel = player ? calculateXpIntoLevel(player.totalXp) : 0;
	const xpRemaining = player ? calculateXpRemaining(player.totalXp) : 0;
	const levelXp = player ? getLevelXp(currentLevel) : 0;
	const progressPercent = player ? Math.round((xpIntoLevel / levelXp) * 100) : 0;
	const sourceCounts = player ? calculateSourceCounts(xpRemaining) : [];
	const tier = getPrestigeTier(currentLevel);
	const statRows = player ? buildStatRows(player) : [];
	const killMethods = player ? [
		{ label: "Melee", description: "Direct close-range attacks, usually with a sword.", value: player.meleeKills, className: "text-rose-300" },
		{ label: "Void", description: "Enemies knocked into the void.", value: player.voidKills, className: "text-violet-300" },
		{ label: "Fall", description: "Enemies killed by fall damage.", value: player.fallKills, className: "text-amber-300" },
		{ label: "Explosion", description: "Kills caused by explosions, such as TNT or fireballs.", value: player.explosionKills, className: "text-orange-300" },
		{ label: "Magic", description: "Kills caused by special magic damage.", value: player.magicKills, className: "text-sky-300" },
		{ label: "Fire", description: "Kills caused by fire damage.", value: player.fireKills, className: "text-red-400" },
		{ label: "Projectile", description: "Kills caused by projectiles, such as arrows.", value: player.projectileKills, className: "text-cyan-300" }
	].filter((method) => method.value > 0).sort((a, b) => b.value - a.value) : [];
	const comparisonRows = player && friend ? [
		{ label: "Level", you: calculateCurrentLevel(player.totalXp), friend: calculateCurrentLevel(friend.totalXp) },
		{ label: "WLR", you: formatRatio(player.wins, player.losses), friend: formatRatio(friend.wins, friend.losses) },
		{ label: "FKDR", you: formatRatio(player.finalKills, player.finalDeaths), friend: formatRatio(friend.finalKills, friend.finalDeaths) },
		{ label: "KDR", you: formatRatio(player.kills, player.deaths), friend: formatRatio(friend.kills, friend.deaths) },
		{ label: "BBLR", you: formatRatio(player.bedsBroken, player.bedsLost), friend: formatRatio(friend.bedsBroken, friend.bedsLost) }
	] : [];

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
						<Image src="/logo.svg" alt="Hyprogress" width={20} height={20} className="rounded-sm" />
						<span className="text-[13px] font-semibold tracking-[0.08em]">HYPROGRESS</span>
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
								className="w-full rounded-lg border border-white/10 bg-white/3 py-3 pl-8 pr-4 font-mono text-[16px] text-stone-100 placeholder:text-stone-600 focus:border-emerald-400/60 focus:outline-none"
								placeholder="e.g. Technoblade"
								value={searchInput}
								onChange={(event) => setSearchInput(event.target.value)}
								onKeyDown={(event) => { if (event.key === "Enter") handleSearch(); }}
							/>
						</div>
						<button
							className="shrink-0 rounded-lg bg-emerald-400 px-5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
						<div className="mb-6 rounded-xl border border-white/10 bg-white/2 p-4">
							<div className="mb-3 flex items-center justify-between gap-3">
								<div>
									<h2 className="text-[13px] font-semibold tracking-[0.08em] text-stone-200">YOU VS A FRIEND</h2>
									<p className="mt-1 text-[11px] text-stone-500">Compare Bedwars progress with another player.</p>
								</div>
								{friend && <button className="text-[11px] text-stone-500 hover:text-stone-300 cursor-pointer" onClick={() => setFriend(null)}>Clear</button>}
							</div>
							<div className="flex items-stretch gap-2">
								<input
									className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#101014] px-3 py-2.5 font-mono text-sm text-stone-100 placeholder:text-stone-600 focus:border-emerald-400/60 focus:outline-none"
									placeholder="Friend's Minecraft name"
									value={friendInput}
									onChange={(event) => setFriendInput(event.target.value)}
									onKeyDown={(event) => { if (event.key === "Enter") handleFriendSearch(); }}
								/>
								<button className="shrink-0 rounded-lg border border-emerald-400/40 px-4 text-sm font-semibold text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed" onClick={handleFriendSearch} disabled={isFriendLoading}>
									{isFriendLoading ? "Loading" : "Compare"}
								</button>
							</div>
							{friendError && <p className="mt-3 text-[12px] text-rose-400">{friendError}</p>}
							{friend && (
								<div className="mt-4 overflow-hidden rounded-lg border border-white/10">
									<div className="grid grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)] items-center gap-3 border-b border-white/10 bg-white/3 px-5 py-2.5 text-xs font-semibold">
										<span className="truncate text-left text-emerald-300">{player.username}</span><span className="text-center text-stone-600">VS</span><span className="truncate text-right text-sky-300">{friend.username}</span>
									</div>
									{comparisonRows.map((row) => (
										<div key={row.label} className="grid grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)] items-center gap-3 border-b border-white/5 px-5 py-3 last:border-b-0 font-mono text-sm tabular-nums">
											<span className={`text-left ${row.you > row.friend ? "text-emerald-400" : row.you < row.friend ? "text-stone-500" : "text-stone-200"}`}>{row.you.toLocaleString()}</span>
											<span className="text-center text-[10px] tracking-wider text-stone-600">{row.label.toUpperCase()}</span>
											<span className={`text-right ${row.friend > row.you ? "text-sky-300" : row.friend < row.you ? "text-stone-500" : "text-stone-200"}`}>{row.friend.toLocaleString()}</span>
										</div>
									))}
								</div>
							)}
						</div>
						<div className="rounded-2xl bg-linear-to-brom-white/[0.06] to-white/0 p-px">
							<div className="rounded-[15px] bg-[#101014] px-6 py-7 sm:px-8">
								<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
									<div className="flex items-center gap-4">
										<Image
											src={player.skinUrl}
											alt={`${player.username}'s skin`}
											width={48}
											height={48}
											className="rounded-md border border-white/10"
										/>
										<span className={`font-mono text-5xl font-bold tabular-nums ${tier.textClass}`}>
											{currentLevel}
										</span>
										<div>
											<div className="mb-1 flex items-center gap-2">
												<span className={`h-1.5 w-1.5 rounded-full ${player.online ? "bg-emerald-400" : "bg-stone-600"}`} />
												<span className="text-[10px] tracking-[0.14em] text-stone-500">
													{player.online ? "ONLINE" : "OFFLINE"}
												</span>
											</div>
											<div className="flex items-center gap-1 flex-wrap">
												{player.hypixelRank && (
													<span className={`text-xs font-bold ${getHypixelRankColor(player.hypixelRank)}`}>
														{getRankPrefix(player.hypixelRank).trim()}
													</span>
												)}
												<p className={`font-['Fraunces'] text-xl ${getHypixelRankColor(player.hypixelRank)}`}>
													{player.username}
												</p>
											</div>
											<p className="mt-0.5 text-[11px] text-stone-500">
												{player.online && player.gameType
													? `Playing ${humanizeToken(player.gameType)}${player.mode ? ` · ${humanizeToken(player.mode)}` : ""}`
													: !player.online && player.lastLogin
														? `Last seen ${formatRelativeTime(player.lastLogin)}`
														: null}
											</p>
											{player.firstLogin && (
												<p className="mt-1 flex items-center gap-1.5 text-[10px] text-stone-600">
													<svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													<span>First seen {formatDate(player.firstLogin)}</span>
												</p>
											)}
											<p className="mt-1 text-[11px] text-stone-600">
												{player.guildName
													? `${player.guildTag ? `[${player.guildTag}] ` : ""}${player.guildName}`
													: "No guild"}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-4">
										<button
											className="rounded-md border border-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-stone-400 transition-colors hover:border-emerald-400/40 hover:text-emerald-300 cursor-pointer"
											onClick={handleShare}
										>
											{isCopied ? "LINK COPIED" : "SHARE"}
										</button>
										<span className="font-mono text-sm text-stone-500">
											{player.totalXp.toLocaleString()} XP total
										</span>
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

								<h2 className="mb-3 text-[13px] font-semibold tracking-[0.08em] text-stone-200">BEDWARS STATS</h2>
								<div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-white/10">
									{statRows.flat().map((tile, index) => (
										<div key={index} className="bg-[#101014] px-3 py-4 text-center">
											<p className="mb-1.5 whitespace-nowrap text-[8px] tracking-[0.08em] text-stone-500 sm:text-[10px] sm:tracking-widest">{tile.label.toUpperCase()}</p>
											<p className={`font-mono text-lg font-bold tabular-nums sm:text-xl ${tile.valueClass}`}>{tile.value}</p>
										</div>
									))}
								</div>

								<div className="mt-6 rounded-lg border border-white/10 bg-white/2 p-4">
										<h2 className="text-[13px] font-semibold tracking-[0.08em] text-stone-200">KILL STYLE</h2>
										<p className="mt-1 text-[10px] text-stone-600">How this player gets eliminations.</p>
										{killMethods.length > 0 ? (
											<div className="mt-3 space-y-2">

												{killMethods.slice(0, 4).map((method, index) => (
													<div key={method.label} className="flex items-center justify-between gap-3">
														<span className="cursor-help text-xs text-stone-400 decoration-dotted underline-offset-4 hover:text-stone-200" title={method.description}><span className="mr-2 font-mono text-stone-600">#{index + 1}</span>{method.label}</span>
														<span className={`font-mono text-sm font-bold tabular-nums ${method.className}`}>{method.value.toLocaleString()}</span>
													</div>
												))}
											</div>
										) : <p className="mt-3 text-sm text-stone-500">No kill-method data available.</p>}
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
