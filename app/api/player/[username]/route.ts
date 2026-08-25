import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
	try {
		const { username } = await params;

		if (!username)
			return NextResponse.json({ error: "Username is required" }, { status: 400 });

		const apiKey = process.env.HYPIXEL_API_KEY;
		console.log(apiKey);
		if (!apiKey)
			return NextResponse.json({ error: "Hypixel API key is not configured" }, { status: 500 });

		const mojangResponse = await fetch(
			`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`,
			{ cache: "no-store" }
		);

		if (!mojangResponse.ok)
			return NextResponse.json({ error: "Player not found" }, { status: 404 });

		const mojangData = await mojangResponse.json();

		const hypixelResponse = await fetch(`https://api.hypixel.net/v2/player?uuid=${mojangData.id}`, {
			headers: { "API-Key": apiKey, },
			cache: "no-store",
		}
		);

		const hypixelData = await hypixelResponse.json();

		if (!hypixelData.success)
			return NextResponse.json({ error: hypixelData.cause || "Hypixel API error" }, { status: 502 });

		const bedwars = hypixelData.player?.stats?.Bedwars;

		if (!bedwars)
			return NextResponse.json({ error: "BedWars data not found" }, { status: 404 });

		return NextResponse.json({
			username: mojangData.name,
			xp: bedwars.Experience ?? 0,
		});

	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
