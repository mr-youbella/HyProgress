import { Pool } from "pg";

const globalDatabase = globalThis as typeof globalThis & {
	pool?: Pool;
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
