import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
	try {
		const { username } = await params;

		if (!username)
			return NextResponse.json({ error: "Username is required" }, { status: 400 });

		const apiKey = process.env.HYPIXEL_API_KEY;

		if (!apiKey)
			return NextResponse.json({ error: "Hypixel API key is not configured" }, { status: 500 });

		const mojangResponse = await fetch(
			`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`,
			{ cache: "no-store" }
		);

		if (!mojangResponse.ok)
			return NextResponse.json({ error: "Player not found" }, { status: 404 });

		const mojangData = await mojangResponse.json();

		const [playerResponse, statusResponse, guildResponse] = await Promise.all([
			fetch(`https://api.hypixel.net/v2/player?uuid=${mojangData.id}`, {
				headers: { "API-Key": apiKey },
				cache: "no-store"
			}),
			fetch(`https://api.hypixel.net/v2/status?uuid=${mojangData.id}`, {
				headers: { "API-Key": apiKey },
				cache: "no-store"
			}),
			fetch(`https://api.hypixel.net/v2/guild?player=${mojangData.id}`, {
				headers: { "API-Key": apiKey },
				cache: "no-store"
			})
		]);

		const hypixelData = await playerResponse.json();

		if (!hypixelData.success)
			return NextResponse.json({ error: hypixelData.cause || "Hypixel API error" }, { status: 502 });

		const bedwars = hypixelData.player?.stats?.Bedwars;

		if (!bedwars)
			return NextResponse.json({ error: "BedWars data not found" }, { status: 404 });

		const statusData = await statusResponse.json();
		const isOnline = statusData.success ? Boolean(statusData.session?.online) : false;

		const guildData = await guildResponse.json();
		const guild = guildData.success ? guildData.guild : null;
		const guildMember = guild?.members?.find(
			(member: { uuid: string }) => member.uuid === mojangData.id
		);

		return NextResponse.json({
			username: mojangData.name,
			skinUrl: `https://statsify.net/api/skin/head?uuid=${mojangData.id}&size=32`,
			xp: bedwars.Experience ?? 0,
			online: isOnline,
			gameType: isOnline ? statusData.session?.gameType ?? null : null,
			mode: isOnline ? statusData.session?.mode ?? null : null,
			lastLogin: hypixelData.player?.lastLogin ?? null,
			guildName: guild?.name ?? null,
			guildTag: guild?.tag ?? null,
			guildRank: guildMember?.rank ?? null,
			wins: bedwars.wins_bedwars ?? 0,
			losses: bedwars.losses_bedwars ?? 0,
			kills: bedwars.kills_bedwars ?? 0,
			deaths: bedwars.deaths_bedwars ?? 0,
			finalKills: bedwars.final_kills_bedwars ?? 0,
			finalDeaths: bedwars.final_deaths_bedwars ?? 0,
			bedsBroken: bedwars.beds_broken_bedwars ?? 0,
			bedsLost: bedwars.beds_lost_bedwars ?? 0
		});
	}
	catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
