# LocalBites

LocalBites helps students find restaurants, coffee shops, and study spots around Cal Poly and downtown San Luis Obispo. It brings nearby places into one searchable, mobile-friendly directory.

## What you can do

- Search places by name, cuisine, or tag, and filter by category, tags, or price when available.
- Open a place to see its address, listed hours, directions, tags, and student reviews.
- Create an account to write one review per place and save favorites.
- Return to your saved places from the Favorites page.

The current directory includes 17 real San Luis Obispo listings sourced from OpenStreetMap. Hours may change, so check them before visiting. Place photos are clearly marked as illustrative. Prices are shown only when verified data is available, and ratings come only from LocalBites reviews.

## Architecture

LocalBites is a React single-page app built with Vite. React Router connects the Discover, Place Details, Favorites, and authentication pages. Tailwind CSS handles the responsive layout, and shared components keep cards, filters, reviews, and navigation consistent.

The UI calls functions in `src/lib/api.js` for places, reviews, and favorites. `src/context/AuthContext.jsx` manages the signed-in user. This keeps page components focused on display and interaction while the data layer handles storage.

With no service credentials, the app runs in preview mode: `src/data/realPlaces.json` supplies the place directory, and browser local storage holds the preview user session, reviews, and favorites. When a hosted backend is configured, the same UI uses persistent authentication and data instead. The preview sign-in accepts any email and password and is intended only for local testing.

The place snapshot is generated from OpenStreetMap extracts by `scripts/refresh_places.py`. Stable place IDs keep reviews and favorites linked across data refreshes. The app does not request OpenStreetMap data on every page visit. Place data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) under the ODbL.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`. No credentials are needed to explore the preview.

## Build

```bash
npm run build
npm run preview
```
