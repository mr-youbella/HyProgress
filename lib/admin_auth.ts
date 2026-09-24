import { jwtVerify, SignJWT } from "jose";

export const ADMIN_SESSION_COOKIE = "hyprogress_admin_session";
function getSessionSecret(): string | null {
	return process.env.ADMIN_SESSION_SECRET || null;
}

function getSecretKey(secret: string): Uint8Array {
	return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(): Promise<string | null> {
	const secret = getSessionSecret();
	if (!secret)
		return null;

	return new SignJWT({ scope: "admin-preview" }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setIssuedAt().setExpirationTime("1h").sign(getSecretKey(secret));
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
	const secret = getSessionSecret();
	if (!secret || !token)
		return false;

	try {
		const { payload } = await jwtVerify(token, getSecretKey(secret), {
			algorithms: ["HS256"]
		});
		return payload.scope === "admin-preview";
	}
	catch {
		return false;
	}
}
