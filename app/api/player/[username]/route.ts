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
			{ next: { revalidate: 300 } }
		);

		if (!mojangResponse.ok)
			return NextResponse.json({ error: "Player not found" }, { status: 404 });

		const mojangData = await mojangResponse.json();

		const [playerResponse, statusResponse, guildResponse] = await Promise.all([
			fetch(`https://api.hypixel.net/v2/player?uuid=${mojangData.id}`, {
				headers: { "API-Key": apiKey },
				next: { revalidate: 30 }
			}),
			fetch(`https://api.hypixel.net/v2/status?uuid=${mojangData.id}`, {
				headers: { "API-Key": apiKey },
				next: { revalidate: 30 }
			}),
			fetch(`https://api.hypixel.net/v2/guild?player=${mojangData.id}`, {
				headers: { "API-Key": apiKey },
				next: { revalidate: 30 }
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

		const player = hypixelData.player;
		let hypixelRank = null;
		
		if (player) {
			if (player.rank)
				hypixelRank = player.rank;
			else if (player.monthlyPackageRank && player.monthlyPackageRank !== "NONE")
				hypixelRank = player.monthlyPackageRank;
			else if (player.newPackageRank && player.newPackageRank !== "NONE" && player.newPackageRank !== "DEFAULT")
				hypixelRank = player.newPackageRank;
			else if (player.packageRank && player.packageRank !== "NONE" && player.packageRank !== "DEFAULT")
				hypixelRank = player.packageRank;
		}

		return NextResponse.json({
			username: mojangData.name,
			skinUrl: `https://statsify.net/api/skin/head?uuid=${mojangData.id}&size=32`,
			xp: bedwars.Experience ?? 0,
			online: isOnline,
			gameType: isOnline ? statusData.session?.gameType ?? null : null,
			mode: isOnline ? statusData.session?.mode ?? null : null,
			lastLogin: player?.lastLogin ?? null,
			firstLogin: player?.firstLogin ?? null,
			guildName: guild?.name ?? null,
			guildTag: guild?.tag ?? null,
			guildRank: guildMember?.rank ?? null,
			hypixelRank: hypixelRank,
			wins: bedwars.wins_bedwars ?? 0,
			losses: bedwars.losses_bedwars ?? 0,
			kills: bedwars.kills_bedwars ?? 0,
			deaths: bedwars.deaths_bedwars ?? 0,
			finalKills: bedwars.final_kills_bedwars ?? 0,
			finalDeaths: bedwars.final_deaths_bedwars ?? 0,
			bedsBroken: bedwars.beds_broken_bedwars ?? 0,
			bedsLost: bedwars.beds_lost_bedwars ?? 0,
			meleeKills: bedwars.entity_attack_kills_bedwars ?? 0,
			voidKills: bedwars.void_kills_bedwars ?? 0,
			fallKills: bedwars.fall_kills_bedwars ?? 0,
			explosionKills: bedwars.entity_explosion_kills_bedwars ?? 0,
			magicKills: bedwars.magic_kills_bedwars ?? 0,
			fireKills: bedwars.fire_tick_kills_bedwars ?? 0,
			projectileKills: bedwars.projectile_kills_bedwars ?? 0
		});
	}
	catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
