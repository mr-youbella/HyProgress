import { Pool } from "pg";

const globalDatabase = globalThis as typeof globalThis & {
	pool?: Pool;
};

export type AdminSearchStats = {
	totalSearches: number;
	uniquePlayers: number;
	searchesLast24Hours: number;
	recentSearches: Array<{ playerName: string; searchedAt: Date }>;
	topPlayers: Array<{ playerName: string; searchCount: number; lastSearchedAt: Date }>;
};

const certificateAuthority = process.env.SUPABASE_CA_CERT?.replace(/\\n/g, "\n");

function getPool(): Pool | null {
	const connectionString = process.env.DATABASE_URL;

	if (!connectionString)
		return null;

	if (!globalDatabase.pool) {
		globalDatabase.pool = new Pool({
			connectionString,
			max: 5,
			connectionTimeoutMillis: 1_500,
			query_timeout: 1_500,
			idleTimeoutMillis: 10_000,
			ssl: {
				ca: certificateAuthority,
				rejectUnauthorized: true
			}
		});
	}

	return globalDatabase.pool;
}

export async function recordPlayerSearch(username: string): Promise<void> {
	const pool = getPool();
	if (!pool)
		return;

	try {
		await pool.query(
			"INSERT INTO player_searches (player_name) VALUES ($1)",
			[username]
		);
	}
	catch (error) {
		console.error("Player search logging failed:", error);
	}
}

export async function getAdminSearchStats(): Promise<AdminSearchStats | null> {
	const pool = getPool();
	if (!pool)
		return null;

	try {
		const [summary, recent, top] = await Promise.all([
			pool.query<{ total: string; players: string; today: string }>(
				`SELECT COUNT(*) AS total, COUNT(DISTINCT LOWER(player_name)) AS players,
					COUNT(*) FILTER (WHERE searched_at >= NOW() - INTERVAL '24 hours') AS today
				 FROM player_searches`
			),
			pool.query<{ player_name: string; searched_at: Date }>("SELECT player_name, searched_at FROM player_searches ORDER BY searched_at DESC LIMIT 30"),
			pool.query<{ player_name: string; search_count: string; last_searched_at: Date }>("SELECT player_name, COUNT(*) AS search_count, MAX(searched_at) AS last_searched_at FROM player_searches GROUP BY player_name ORDER BY search_count DESC, last_searched_at DESC LIMIT 30")
		]);

		const row = summary.rows[0];
		return {
			totalSearches: Number(row?.total ?? 0),
			uniquePlayers: Number(row?.players ?? 0),
			searchesLast24Hours: Number(row?.today ?? 0),
			recentSearches: recent.rows.map((item) => ({ playerName: item.player_name, searchedAt: item.searched_at })),
			topPlayers: top.rows.map((item) => ({ playerName: item.player_name, searchCount: Number(item.search_count), lastSearchedAt: item.last_searched_at }))
		};
	}
	catch (error) {
		console.error("Admin search stats read failed:", error);
		return null;
	}
}
