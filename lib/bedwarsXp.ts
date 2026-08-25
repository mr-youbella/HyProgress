export const XP_PER_LEVEL = 5000;

export type XpSource = {
	id: string;
	label: string;
	xpEach: number;
};

export type XpSourceCount = XpSource & { count: number; efficiencyPercent: number };

export const XP_SOURCES: XpSource[] = [
	{ id: "soloWin", label: "Solo / Doubles win", xpEach: 100 },
	{ id: "threeFourWin", label: "3v3 / 4v4 win", xpEach: 50 },
	{ id: "dreamsWin", label: "4v4 / Dreams win", xpEach: 25 },
	{ id: "minutePlayed", label: "Minute played", xpEach: 15 },
	{ id: "bedDestroyed", label: "Bed destroyed", xpEach: 15 },
	{ id: "finalKill", label: "Final kill", xpEach: 10 },
	{ id: "firstKill", label: "First kill", xpEach: 5 },
	{ id: "emerald", label: "Emerald collected", xpEach: 3 },
	{ id: "diamond", label: "Diamond collected", xpEach: 2 }
];

const MAX_XP_EACH = Math.max(...XP_SOURCES.map((source) => source.xpEach));

export function getLevelStartXp(level: number): number {
	if (level <= 0) return 0;
	if (level === 1) return 500;
	if (level === 2) return 1500;
	if (level === 3) return 3500;
	if (level === 4) return 7000;

	return 7000 + (level - 4) * XP_PER_LEVEL;
}

export function getLevelXp(level: number): number {
	if (level === 0) return 500;
	if (level === 1) return 1000;
	if (level === 2) return 2000;
	if (level === 3) return 3500;

	return XP_PER_LEVEL;
}

export function calculateCurrentLevel(totalXp: number): number {
	if (totalXp < 500) return 0;
	if (totalXp < 1500) return 1;
	if (totalXp < 3500) return 2;
	if (totalXp < 7000) return 3;

	return 4 + Math.floor((totalXp - 7000) / XP_PER_LEVEL);
}

export function calculateXpIntoLevel(totalXp: number): number {
	const level = calculateCurrentLevel(totalXp);
	const levelStartXp = getLevelStartXp(level);

	return totalXp - levelStartXp;
}

export function calculateXpRemaining(totalXp: number): number {
	const level = calculateCurrentLevel(totalXp);
	const xpIntoLevel = calculateXpIntoLevel(totalXp);
	const xpNeeded = getLevelXp(level);

	return Math.max(0, xpNeeded - xpIntoLevel);
}

export function calculateProgressPercent(totalXp: number): number {
	const level = calculateCurrentLevel(totalXp);
	const xpIntoLevel = calculateXpIntoLevel(totalXp);
	const xpNeeded = getLevelXp(level);

	if (xpNeeded <= 0) return 0;

	return Math.round((xpIntoLevel / xpNeeded) * 100);
}

export function calculateSourceCounts(xpRemaining: number): XpSourceCount[] {
	return XP_SOURCES.map((source) => ({
		...source,
		count: xpRemaining > 0
			? Math.ceil(xpRemaining / source.xpEach)
			: 0,
		efficiencyPercent: Math.round((source.xpEach / MAX_XP_EACH) * 100)
	}));
}
