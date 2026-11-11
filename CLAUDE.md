# CLAUDE.md

Guidance for Claude Code when working in this folder. Keep this file current: update it whenever the project's purpose, structure, tooling, or conventions change.

## Project overview

A learning project. The owner is new to AI and Claude Code. Explain steps in plain language, avoid unexplained jargon, and suggest small, achievable next steps. Started 2026-11-11.

### The app: beer pub crawl routes

A website (mobile-first, works on a phone browser) for beer pub crawls: a route of several bars in a city that you walk between in one day, having one drink at each. First city: São Paulo, Brazil.

Planned features:
- See a crawl route on a map, with walking time and distance between bars
- "Doing this crawl now" mode: check in at each bar, rate it on the spot, see what's next
- Rate bars
- Create your own route by searching for bars (no typing addresses)
- Share routes, follow other people's routes, and comment on them
- Portuguese and English
- Drinking basics: 18+ confirmation, "get home" button (Uber / 99), water reminders

### Build plan

1. **Done:** one hard-coded route (Vila Madalena, 5 bars) on a map, with the walking path and PT/EN.
2. Create your own route by searching for bars (add the Mapbox connector/API here).
3. "Doing this crawl now" mode with check-ins and ratings, saved on the device.
4. Accounts, sharing and comments with Supabase; publish online with Vercel.

## Decisions

- **Website first, not a native phone app.** Easier to build and test; can become an app later.
- **Bars and routes are separate data.** A bar has its own location and ratings; a route is an ordered list of bar ids. One bar can be on many routes. Later: a "visit" record links a person, a route and a bar.
- **No build tools for now.** Plain HTML, CSS and JavaScript so the owner can read every file. Revisit (e.g. React/Next.js) when accounts are added in step 4.
- **Maps:** Leaflet 1.9.4 (from cdnjs) with OpenStreetMap tiles. Free, no API key. OpenStreetMap credit must stay visible on the map.
- **Walking paths** are pre-computed and stored in `data/path.js` (from routing.openstreetmap.de, foot profile), so the page doesn't depend on a routing server at runtime.
- **Bar locations** come from OpenStreetMap (Nominatim). Bar notes are kept short and generic. Opening hours aren't stored; the page tells users to check them.

## Structure

- `index.html`: the page layout
- `styles.css`: look and feel. Colours are CSS variables on `:root`, with a dark-mode version.
- `app.js`: draws the map, the stop list and the walking legs; handles the PT/EN switch (remembered in localStorage)
- `data/routes.js`: `window.BARS` (bars by id) and `window.ROUTES` (routes listing bar ids)
- `data/path.js`: walking path points and per-leg distance/time for the Vila Madalena route
- `.claude/launch.json`: preview config for Claude's browser pane (attaches to a server on port 8000)

## Running it

The page needs to be served by a local web server (opening the file directly may not load everything). From this folder:

```bash
ruby -run -e httpd . -p 8000
```

Then open http://localhost:8000. Ruby comes with macOS.

## Environment notes

- Apple's Command Line Tools are installed (2026-11-11): `git` 2.50 and `python3` 3.9 work. `jq`, `curl` and `ruby` are also available. Node.js is not installed (not needed yet).
- macOS privacy settings block servers started by the Claude app's preview from reading `~/Documents`. Workaround: Claude starts the Ruby server from its own shell, and the preview attaches to it.

## Git

- A git repository on branch `main`, with no remote yet. GitHub comes later.
- The author name and email are set for this repo only (not globally).
- Save a version (commit) after each working step, with a short plain-language message.

## Connectors and plugins to add later

- Mapbox connector: when building "create your own route" (step 2)
- GitHub plugin: once git is set up, to back up the code online
- Supabase plugin (official): for accounts and the database (step 4)
- Vercel plugin: to publish the site (step 4)
- frontend-design plugin: when polishing the look
