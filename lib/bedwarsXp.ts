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

export function calculateCurrentLevel(totalXp: number): number
{
	return Math.floor(totalXp / XP_PER_LEVEL);
}

export function calculateXpIntoLevel(totalXp: number): number
{
	return totalXp % XP_PER_LEVEL;
}

export function calculateXpRemaining(totalXp: number): number
{
	const xpIntoLevel = calculateXpIntoLevel(totalXp);
	if (xpIntoLevel === 0)
		return 0;

	return XP_PER_LEVEL - xpIntoLevel;
}

export function calculateSourceCounts(xpRemaining: number): XpSourceCount[]
{
	return XP_SOURCES.map((source) =>
	{
		return {
			...source,
			count: Math.ceil(xpRemaining / source.xpEach),
			efficiencyPercent: Math.round((source.xpEach / MAX_XP_EACH) * 100)
		};
	});
}
