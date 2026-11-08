import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const configuredUrl = process.env.SUPABASE_URL;
const configuredKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = configuredUrl && !configuredUrl.includes('localhost') ? configuredUrl : process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = configuredKey && !configuredKey.includes('dummy') ? configuredKey : process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error('Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.');
}

// The app talks to Supabase through its server-side JavaScript client; no ORM is used.
// Keep the service-role key server-only. The publishable-key fallback is useful for local
// development, but it still requires RLS policies once the schema is connected.
export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: false
	}
});
