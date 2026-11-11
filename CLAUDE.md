# CLAUDE.md

Guidance for Claude Code when working in this folder. Keep this file current: update it whenever the project's purpose, structure, tooling, or conventions change.

## Project overview

A learning project. The owner is new to AI and Claude Code. Explain steps in plain language, avoid unexplained jargon, and suggest small, achievable next steps. Started 2026-11-11.

### The app: BeerBoot (beer pub crawl routes)

The app is called **BeerBoot** (renamed from "Pub Crawl" on 2026-11-11). "Pub crawl" is still used for the activity itself, e.g. "Pub crawls in São Paulo". The storage key `pubcrawl.saved.v1` keeps its old name on purpose: renaming it would make existing saved routes disappear.

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
2. **Done:** create, edit and delete your own routes by searching for bars. Routes are saved in the browser (localStorage). There's a home page listing all routes.
3. "Doing this crawl now" mode with check-ins and ratings, saved on the device.
4. Accounts, sharing and comments with Supabase; publish online with Vercel.

## Decisions

- **Website first, not a native phone app.** Easier to build and test; can become an app later.
- **Bars and routes are separate data.** A bar has its own location and ratings; a route is an ordered list of bar ids. One bar can be on many routes. Later: a "visit" record links a person, a route and a bar.
- **No build tools for now.** Plain HTML, CSS and JavaScript so the owner can read every file. Revisit (e.g. React/Next.js) when accounts are added in step 4.
- **Maps:** Leaflet 1.9.4 (from cdnjs) with OpenStreetMap tiles. Free, no API key. OpenStreetMap credit must stay visible on the map.
- **Walking paths** come from routing.openstreetmap.de (foot profile, free, no key). The built-in route's path is pre-computed in `data/path.js`. In the creator, the path is fetched each time the stops change, then saved with the route. If the service fails, a straight-line estimate (×1.25, 4.5 km/h) is used: shown dashed with "≈".
- **Bar search** uses Photon (photon.komoot.io, free, no key, OpenStreetMap data). Search is limited to the area visible on the map, and to bars, pubs, beer gardens, breweries and restaurants (many botecos are tagged as restaurants). This means Mapbox isn't needed yet.
- **Bar ids:** built-in bars use readable ids (`bar-astor`); searched bars use `osm-<type><id>` (e.g. `osm-N2622533015`).
- **Saved routes** live in localStorage under `pubcrawl.saved.v1` as `{ bars: {id: bar}, routes: [route] }`. Each saved route stores its path. Deleting a route also removes bars no other saved route uses. This storage is per browser; Supabase replaces it in step 4.
- **Warnings:** a walk over 20 min between bars is flagged as a "long walk"; more than 8 stops shows a gentle reminder.
- **Bar locations** for the built-in route come from OpenStreetMap (Nominatim). Bar notes are kept short and generic. Opening hours aren't stored; the page tells users to check them.
- **Text:** all interface text is in `TEXT` in `js/common.js` (pt and en). Built-in route titles are `{ en, pt }`; user routes have a single string. `pick()` handles both.
- User-entered or searched text goes into the page with `textContent` or `escapeHtml()`, never as raw HTML.

## Structure

- `index.html` + `js/home.js`: home page with featured routes and "My routes". Delete asks for confirmation inside the card, not with `confirm()`.
- `route.html` + `js/route.js`: shows one route, `route.html#<route id>`. Saved routes get an Edit link.
- `create.html` + `js/create.js`: route creator. `create.html#<route id>` edits a saved route.
- Links put the route id after `#` (artifacts only pass that part through). `idFromAddress()` still accepts old `?id=` / `?edit=` links.
- `vendor/leaflet-1.9.4.min.css`: a local copy of Leaflet's stylesheet (artifacts can't load stylesheets from CDNs). Leaflet's JS still comes from cdnjs.
- `demo/`: used only by the artifact version. `config.js` turns on demo mode; `bars.js` is 114 bars in Vila Madalena/Pinheiros from OpenStreetMap; `tiles/` holds map images at zoom 14–16 for that area.
- `tools/build_artifact.py`: builds the artifact version into `dist/artifact/`. `dist/` is ignored by git.
- `js/common.js`: shared code used by every page: text, language switch, formatting, saving/loading routes, map setup, walking directions
- `styles.css`: look and feel. Colours are CSS variables on `:root`, with a dark-mode version.
- `data/routes.js`: `window.BARS` (bars by id) and `window.ROUTES` (built-in routes listing bar ids)
- `data/path.js`: walking path points and per-leg distance/time for the Vila Madalena route
- `.claude/launch.json`: preview config for Claude's browser pane (attaches to a server on port 8000)

## Artifact (demo version)

- Published at https://claude.ai/artifact/8PhHyennfvs42wYhSHmRmn (private to the owner). First published 2026-11-11.
- Artifacts block everything from other websites except scripts from a few CDNs: no map tiles, no fetch, no external stylesheets. `confirm()`/`alert()` don't work either. So the artifact runs in **demo mode** (`DEMO` in `js/common.js`):
  - map images come from `demo/tiles`, and the map is limited to that area (zoom 14–18);
  - search looks through `demo/bars.js` (ignores accents and capitals, closest first);
  - walking paths for new routes are straight-line estimates (dashed, "≈"). The built-in route keeps its real path;
  - routes are saved per browser (localStorage).
- **To update the artifact:** run `python3 tools/build_artifact.py`, then publish `dist/artifact/index.html` with every other file in `dist/artifact/` passed as `files` (published path = path inside `dist/artifact/`). Republishing the same file path keeps the URL.
- The build removes `<!doctype>`, `<html>`, `<head>`, `<body>`, charset and viewport from `index.html` only (the viewer adds them). Opened locally, that page shows broken accents, which is expected.
- Colours follow the artifact viewer's theme through `data-theme` on `<html>`, as well as the device's dark mode. All colours are CSS variables.

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

- Mapbox connector/API: only if the free Photon search turns out not to be good enough
- GitHub plugin: once git is set up, to back up the code online
- Supabase plugin (official): for accounts and the database (step 4)
- Vercel plugin: to publish the site (step 4)
- frontend-design plugin: when polishing the look
