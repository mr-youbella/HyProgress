import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const playerSearchRateLimit = redisUrl && redisToken
	? new Ratelimit({
		redis: new Redis({ url: redisUrl, token: redisToken }),
		limiter: Ratelimit.slidingWindow(20, "60 s"),
		prefix: "hyprogress:player-search",
		analytics: false,
		timeout: 1_000
	})
	: null;

export async function limitPlayerSearch(ip: string) {
	if (!playerSearchRateLimit)
		return null;

	try {
		return await playerSearchRateLimit.limit(ip);
	}
	catch (error) {
		console.error("Player search rate limit failed:", error);
		return null;
	}
}
