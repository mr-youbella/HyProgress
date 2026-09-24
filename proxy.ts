import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/admin_auth";

function unauthorized(): NextResponse {
	return new NextResponse("Admin authentication required.", {
		status: 401,
		headers: { "WWW-Authenticate": "Basic realm=\"Hyprogress Admin\", charset=\"UTF-8\"" }
	});
}

function matchesSecret(value: string, expected: string): boolean {
	const valueBuffer = Buffer.from(value);
	const expectedBuffer = Buffer.from(expected);
	return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}

export async function proxy(request: NextRequest) {
	const username = process.env.ADMIN_USERNAME;
	const password = process.env.ADMIN_PASSWORD;
	const authorization = request.headers.get("authorization");

	if (!username || !password || !authorization?.startsWith("Basic "))
		return unauthorized();

	try {
		const credentials = atob(authorization.slice(6));
		const separator = credentials.indexOf(":");
		const suppliedUsername = separator >= 0 ? credentials.slice(0, separator) : "";
		const suppliedPassword = separator >= 0 ? credentials.slice(separator + 1) : "";

		if (!matchesSecret(suppliedUsername, username) || !matchesSecret(suppliedPassword, password))
			return unauthorized();
	}
	catch {
		return unauthorized();
	}

	const response = NextResponse.next();
	const sessionToken = await createAdminSessionToken();

	if (sessionToken) {
		response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60
		});
	}

	return response;
}

export const config = { matcher: ["/admin/:path*"] };
