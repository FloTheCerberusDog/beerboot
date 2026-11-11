# CLAUDE.md

Guidance for Claude Code when working in this folder. Keep this file current: update it whenever the project's purpose, structure, tooling, or conventions change.

## Project overview

A learning project. The owner is new to AI and Claude Code. Explain steps in plain language, avoid unexplained jargon, and suggest small, achievable next steps. Started 2026-11-11.

### The app: BeerBoot (beer pub crawl routes)

The app is called **BeerBoot** (renamed from "Pub Crawl" on 2026-11-11). "Pub crawl" / "crawl" is still used for the activity itself. The storage key `pubcrawl.saved.v1` keeps its old name on purpose: renaming it would make existing saved routes disappear.

A website (mobile-first, works on a phone browser, installable on the home screen) for beer pub crawls: a route of several bars you walk between in one day, having one drink at each. First city: São Paulo, Brazil. The owner wants it to look **professionally made and premium**; keep that bar for every change.

### Build plan

1. **Done:** one hard-coded route (Vila Madalena, 5 bars) on a map, with the walking path and PT/EN.
2. **Done:** create, edit and delete your own routes by searching for bars. Home page listing routes.
3. **Done (2026-11-11):** "Modern boteco" redesign, plus crawl mode (check in, bottle-cap ratings, next stop, water reminders, Get home), share by link, Best order, Near me, installable app (manifest and service worker).
4. **Next ideas:** more featured routes (e.g. Augusta/Centro, a Pinheiros craft-beer trail; research real bars first), 18+ confirmation, then accounts, sharing and comments with Supabase.

## Design system ("Modern boteco")

- Colours: bottle green `--green`, lager gold `--gold`, tile white `--bg`/`--tile`, near-black green `--ink`. Night theme: deep green-black with glowing gold. All colours are CSS variables in `styles.css`; never hard-code a colour in a component.
- Theme: follows the device, or the person's choice via the sun/moon button (stored in `beerboot.theme`, applied as `data-theme` on `<html>` by a tiny inline script in each page's `<head>`, so there's no flash). Theme changes fire a `beerboot:theme` event; maps restyle themselves on it.
- Type: Bricolage Grotesque (headings, `.display`) and Figtree (text), from Google Fonts.
- Logo: a boot-shaped beer glass (`logoSvg()` in `js/common.js`, app icon in `icons/icon.svg`).
- Markers and ratings: bottle caps (`capSvg(label, state)`, states `""`, `"done"`, `"off"`); colours come from CSS classes, so they follow the theme.
- Icons: drawn line icons in `ICONS` (`js/common.js`), injected once as an SVG sprite; use `icon("name")` in JS or `<svg class="icon"><use href="#i-name"/></svg>` in HTML. No emoji in the interface.
- Layout: map pages show a map with a panel overlapping it on phones, and the map left / panel right (460px) from 900px wide.

## Decisions

- **Website first, not a native phone app.** It can be installed on the home screen (PWA).
- **Bars and routes are separate data.** A bar has its own location; a route is an ordered list of bar ids. Ratings are per bar (`beerboot.ratings.v1`), so the same bar keeps its rating across crawls.
- **No build tools for now.** Plain HTML, CSS and JavaScript so the owner can read every file.
- **Maps:** MapLibre GL 5.24.0 (JS from unpkg, CSS copied to `vendor/`) with OpenFreeMap vector tiles (free, no key): style `positron` by day and `dark` by night, recoloured in `tintMap()`. Map credits must stay available (folded into the "i" button). `createMap()` in `js/common.js` wraps everything: `setPath`, `setStops`, `setDots`, `setActive`, `showMe`, `fit`, `flyTo`. Add our own layers only after the map's `style.load` (tracked by `styleReady`), not `isStyleLoaded()`, which turns true too late.
- **Walking paths** come from routing.openstreetmap.de (foot profile, free, no key). The built-in route's path is pre-computed in `data/path.js`; saved routes store theirs. If the service fails, a straight-line estimate (×1.25, 4.5 km/h) is used, shown dashed with "≈".
- **Best order** uses the same service's `trip` endpoint (first bar fixed), falling back to "nearest bar next".
- **Bar search** uses Photon (photon.komoot.io, free, no key), limited to the visible map area and to bars, pubs, beer gardens, breweries and restaurants (many botecos are tagged as restaurants).
- **Sharing:** `route.html#s=<base64url JSON>` carries the crawl's name and bars inside the link (no accounts needed). Opening it shows "Shared crawl" with Save; starting the crawl saves a copy first. Featured routes share as `route.html#<id>`.
- **Crawl mode** progress is per route in `beerboot.crawls.v1`: `{ index, arrived, startedAt, finished, finishedAt }`. Closing and reopening resumes.
- **Get home** links: Uber `https://m.uber.com/ul/?action=setPickup&pickup=my_location`, 99 `https://99app.com/`.
- **Service worker** (`sw.js`): network first, saved copy only when offline; never caches maps, search or routing. Bump `CACHE` in `sw.js` if the list of files changes a lot. It doesn't run in the Claude browser pane (that browser refuses service workers), only on the real site.
- **Bar ids:** built-in bars use readable ids (`bar-astor`); searched bars use `osm-<type><id>`.
- **Warnings:** a walk over 20 min between bars is a "long walk"; more than 8 stops shows a gentle reminder.
- **Text:** all interface text is in `TEXT` in `js/common.js` (pt and en). Built-in route titles are `{ en, pt }`; user routes have a single string. `pick()` handles both.
- User-entered, searched or shared text goes into the page with `textContent` or `escapeHtml()`, never as raw HTML.
- Pages with an id after `#` (route, crawl, create) reload when only the `#` part changes.

## Structure

- `index.html` + `js/home.js`: home page: hero, featured crawls with mini maps, "My crawls" (resume, edit, delete with an in-card confirmation).
- `route.html` + `js/route.js`: one crawl, `route.html#<id>` or a shared `route.html#s=...`. Start crawl, Share, Edit (own crawls), Save (shared).
- `create.html` + `js/create.js`: creator. `create.html#<id>` edits; `create.html#near` starts at your location.
- `crawl.html` + `js/crawl.js`: crawl mode, `crawl.html#<id>`.
- `js/common.js`: shared code: text, header/theme, icons, logo, caps, saving, ratings, crawl progress, share links, map, walking directions, best order, toast.
- `js/pwa.js`, `sw.js`, `manifest.webmanifest`, `icons/`: install on phone and offline support.
- `styles.css`: the whole design system.
- `data/routes.js` (built-in bars and routes), `data/path.js` (the built-in route's walking path).
- `vendor/maplibre-gl-5.24.0.css`: local copy of the map library's stylesheet.
- `demo/` + `tools/build_artifact.py`: the artifact demo (see below). `dist/` is ignored by git.
- `.claude/launch.json`: preview config for Claude's browser pane (attaches to a server on port 8000).

## Artifact (demo version)

- Published at https://claude.ai/artifact/8PhHyennfvs42wYhSHmRmn (private to the owner). Version 3 (2026-11-11) has the "Modern boteco" redesign. The website is the main version; the artifact is a demo.
- Artifacts block everything from other websites except scripts from a few CDNs and Google Fonts. So the artifact runs in **demo mode** (`DEMO` in `js/common.js`): bundled raster map images from `demo/tiles` (zoom 14–16, Vila Madalena/Pinheiros), search over `demo/bars.js` (114 bars), estimated walking times, Best order by "nearest bar next", no service worker.
- **To update it:** `python3 tools/build_artifact.py`, then publish `dist/artifact/index.html` with every other file in `dist/artifact/` as `files`. The build strips the document tags from `index.html` only (opened locally, that page shows broken accents, which is expected).

## Running it

From this folder:

```bash
ruby -run -e httpd . -p 8000
```

Then open http://localhost:8000. Ruby comes with macOS.

## Environment notes

- Apple's Command Line Tools are installed (2026-11-11): `git` 2.50 and `python3` 3.9 work. `jq`, `curl` and `ruby` are also available. Node.js is not installed.
- macOS privacy settings block servers started by the Claude app's preview from reading `~/Documents`. Workaround: Claude starts the Ruby server from its own shell, and the preview attaches to it.
- `qlmanage -t -s 512 -o <dir> file.svg` turns an SVG into a PNG (used for the app icons); `sips -z` resizes.

## Website (GitHub Pages)

- **Live site:** https://flothecerberusdog.github.io/beerboot/
- **Code:** https://github.com/FloTheCerberusDog/beerboot. **Public**, so anyone can read every file in this folder, CLAUDE.md included. Never put secrets or personal details in the repo.
- GitHub Pages serves the `main` branch root ("legacy" build). `.nojekyll` makes it serve files as they are. **Pushing to `main` updates the site**, usually within a minute or two.
- If a Pages build shows `startup_failure` (it happened on 2026-11-11 with no reason given), request a new build: `~/.local/bin/gh api -X POST repos/FloTheCerberusDog/beerboot/pages/builds`, or push again. The reason is only visible to the signed-in owner on the repo's Actions page.
- The site uses free public services (OpenFreeMap, Photon, routing.openstreetmap.de) that have fair-use limits. That's fine for a hobby app; if it gets busy, switch to a paid or own provider.

## Git

- Branch `main`, remote `origin` = https://github.com/FloTheCerberusDog/beerboot.git.
- Commit author email is GitHub's private noreply address (set for this repo only), so the owner's personal email never appears publicly.
- Save a version (commit) after each working step, with a short plain-language message, and push when the owner wants the site updated.
- GitHub's command-line tool is installed at `~/.local/bin/gh` (v2.103.3, not on PATH), signed in as FloTheCerberusDog with the token in the macOS keychain. Commands that use the token (`gh`, `git push`) must run outside Claude's sandbox, because the sandbox can't read the keychain. The token can't change workflow files (no `workflow` scope).

## Connectors and plugins to add later

- Supabase plugin (official): for accounts and the database (step 4)
- frontend-design plugin: optional, for further polish
- GitHub plugin: optional; the `gh` tool already covers GitHub
