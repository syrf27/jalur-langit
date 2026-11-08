import 'dotenv/config';
import { verifySession } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

const publicRoutes = ['/login'];

export const handle = async ({ event, resolve }: { event: any; resolve: any }) => {
	const sessionToken = event.cookies.get('session');
	
	let isAuthenticated = false;
	
	if (sessionToken) {
		const payload = await verifySession(sessionToken);
		if (payload) {
			isAuthenticated = true;
		}
	}
	
	const isPublicRoute = publicRoutes.some((route) => event.url.pathname === route);
	
	if (!isAuthenticated && !isPublicRoute) {
		throw redirect(303, '/login');
	}
	
	if (isAuthenticated && isPublicRoute) {
		throw redirect(303, '/');
	}
	
	event.locals.isAuthenticated = isAuthenticated;
	
	const response = await resolve(event);
	return response;
};
