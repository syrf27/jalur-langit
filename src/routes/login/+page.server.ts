import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSession } from '$lib/server/auth';
import crypto from 'crypto';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get('password');
		
		if (!password || typeof password !== 'string') {
			return fail(400, { error: 'Password required' });
		}
		
		// In a real app we'd use timingSafeEqual and bcrypt/argon2.
		// We are using a simple SHA256 hash check since there is no multi-user DB.
		const hash = crypto.createHash('sha256').update(password).digest('hex');
		
		if (hash !== process.env.APP_PASSWORD_HASH) {
			return fail(401, { error: 'Invalid password' });
		}
		
		const session = await createSession();
		
		cookies.set('session', session, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});
		
		throw redirect(303, '/');
	}
};
