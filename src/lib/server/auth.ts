import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? 'development-only-secret');
const alg = 'HS256';

export async function createSession() {
	const jwt = await new SignJWT({ user: 'owner' })
		.setProtectedHeader({ alg })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(secret);
	return jwt;
}

export async function verifySession(token: string) {
	try {
		const { payload } = await jwtVerify(token, secret);
		return payload;
	} catch (error) {
		return null;
	}
}
