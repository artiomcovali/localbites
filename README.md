# LocalBites

A mobile-friendly guide to affordable places to eat, drink coffee, and study near campus. Built with React, Vite, Tailwind CSS, React Router, and Supabase.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the URL printed by Vite. With empty environment variables, the app starts in **preview mode** with a cached snapshot of 17 real San Luis Obispo places from OpenStreetMap. You can use any email and password to try sign-in, reviews, and favorites; preview data stays in your browser's local storage. Preview authentication is only for local UI testing and does not check passwords.

## Connect Supabase

1. Create a Supabase project.
2. In the project **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql), then [`supabase/real_places.sql`](supabase/real_places.sql). The first file creates tables, RLS policies, a profile creation trigger, and the image storage bucket. The second imports 17 San Luis Obispo listings from OpenStreetMap extracts. If you ran an earlier version of LocalBites, it hides the old Berkeley and fictional seed rows without deleting their reviews or favorites. Supabase starts with no reviews, so ratings appear as **New** until users post reviews.
3. In **Authentication → Providers**, enable Email. Choose whether to require email confirmation. If confirmation is enabled, users must follow the email link before logging in.
4. In **Project Settings → API**, copy the project URL and anon/publishable key into `.env.local`:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
   ```

5. Restart `npm run dev`. Never put a service role key in the frontend.

The SQL script creates a public `place-images` storage bucket. The OpenStreetMap listings do not include photos, so the app shows clearly labeled illustrative category photos. To use your own images later, upload to `place-images/<your-user-id>/...` and set `places.image_url` to the image's public URL. There is no image upload or place editing UI in this MVP.

## Real place data

The 17 names, locations, cuisine types, and available hours in [`src/data/realPlaces.json`](src/data/realPlaces.json) came from OpenStreetMap extracts around Cal Poly and downtown San Luis Obispo on October 2, 2026. Each place links to its OpenStreetMap entry. Source records can be incomplete or outdated, so visitors should verify hours before making a trip. Photos are illustrative. Prices are left unknown and the budget filter is disabled until verified price information is added. LocalBites ratings are based only on LocalBites reviews; none are fabricated or imported from another review service.

To refresh the curated places, obtain small OSM XML extracts for the Cal Poly and downtown SLO areas from an appropriate OpenStreetMap data provider or Overpass, then run:

```bash
python3 scripts/refresh_places.py --osm-xml path/to/cal-poly.osm --osm-xml path/to/downtown-slo.osm
```

This regenerates the preview JSON and `supabase/real_places.sql`. Run the SQL in Supabase to update the database. The script uses stable IDs based on each OpenStreetMap element, so existing reviews and favorites remain linked after a refresh. It only imports the curated element IDs listed in the script; inspect the refreshed data before publishing. The website does not query public OSM servers on every visit.

Place data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under the ODbL. The attribution also appears in the site footer.

## Features

- Search and filter by category and verified tags; budget filtering activates when prices are available
- Place details with hours, address, directions, ratings, and newest reviews
- Email/password sign-up, login, and logout through Supabase
- One review per user per place, enforced by a database unique constraint
- Private favorites with add/remove controls
- Loading, empty, and error states

## Build

```bash
npm run build
npm run preview
```

For deployment with React Router, configure the host to serve `index.html` for unknown routes. Check current hours, prices, and business status before publishing it as a dependable local directory.
