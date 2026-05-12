# Bybanen Tracker

A schematic, tube-map-style live tracker for **Bybanen**, the light rail in Bergen, Norway. Trams are placed on a stylised SVG map and updated every 30 seconds from the Entur public transport API.

Live version: <https://tanketom.github.io/bybanen/>

## Features

- Live positions for **Linje 1** (Byparken ↔ Bergen Lufthavn) and **Linje 2** (Kaigaten ↔ Fyllingsdalen), polled from Entur every 30 s.
- Smooth animation of tram dots between polls so movement looks continuous.
- Per-stop click panel showing the next departures.
- Hover tooltips with line, destination, delay and next-stop info.
- Active tram counts per line and a live clock.
- Connection status indicator and a "service gap" notice for the nightly window when Bybanen does not run.
- Offline fallback: the last successful poll is cached in `localStorage` so the map still renders without network.
- Light / dark theme toggle (preference persisted in `localStorage`).
- Delayed trams highlighted in a distinct colour.

## How it works

- `index.html` boots the app and contains the SVG canvas, clock, status dot, legend and departure panel shells.
- `js/script.js` (the only runtime script) does everything:
  - Defines the schematic coordinates and stop metadata for both lines.
  - Issues GraphQL queries to `https://api.entur.io/journey-planner/v3/graphql` for `estimatedCalls` on each terminal stop, filtered by `SKY:Line:1` / `SKY:Line:2`.
  - Reconstructs each tram's progress along the line from its remaining estimated calls and interpolates a position between two stops based on elapsed travel time.
  - Animates the SVG dots, updates counts and status, and exposes click/hover interactions.
- `css/styles.css` styles the schematic, themes and overlays.
- `json/timetable.json` holds stop coordinates and inter-stop travel times used by `dragdrop.html`.

### Tunables (top of `js/script.js`)

| Constant | Purpose |
|---|---|
| `ENTUR_API` | GraphQL endpoint. |
| `CLIENT_NAME` | Sent as the `ET-Client-Name` header — required by Entur. |
| `POLL_INTERVAL` | How often (ms) live data is refreshed. Default 30 000. |
| `CACHE_KEY` | `localStorage` key for the offline snapshot. |
| `THEME_KEY` | `localStorage` key for the theme preference. |
| `TERMINALS`, `LINE_IDS`, `STOP_IDS` | Entur NSR stop place IDs and SKY line IDs used by the queries. |

## Layout editor (`dragdrop.html`)

A separate utility page for authoring stop coordinates. It renders a large grid, lets you drag stops loaded from `json/timetable.json` onto it, and emits JSON you can paste back into the timetable file. Driven by `js/dragdrop.js`. This page is a build-time tool and is not used by the live tracker.

## Running locally

The app is fully static — no build step, no dependencies. Because it makes a `fetch` call to a third-party API, serve it over HTTP rather than opening the file directly:

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Data source and credits

Real-time data is provided by [Entur](https://developer.entur.org/) via the public Journey Planner v3 GraphQL API. Use is subject to Entur's terms; in particular, set a unique `ET-Client-Name` if you fork this.
