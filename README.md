# Jalur Langit

Personal Islamic habit tracker built with SvelteKit and Supabase.

## Local development

Install dependencies and start the app:

```sh
npm install
npm run dev -- --open
```

The app uses `@supabase/supabase-js` directly from server code; there is no ORM. Keep
`SUPABASE_SERVICE_ROLE_KEY` server-only. For local-only testing, the configured
`PUBLIC_SUPABASE_PUBLISHABLE_KEY` can be used as a fallback, but the database schema
must exist and RLS policies should be added before production use.

Apply the schema from `supabase/migrations/00000000000000_init.sql`, then run
`supabase/seed.sql` in the Supabase SQL editor. The current hosted project does not
yet contain the tables, so the SQL migration must be applied once before database
features can read or write data.

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@1.3.0 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:typography" sveltekit-adapter="adapter:vercel" --no-install .
```

## Adding features

Add features to your project with `sv add`:

```sh
npx sv add
```

For example, to add Tailwind CSS:

```sh
npx sv add tailwindcss
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.
