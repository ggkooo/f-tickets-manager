# Ticket Totem — Frontend

Frontend for a multi-institution queue management system: public ticket kiosks, an attendant console, an admin panel, and a TV display. Built with React, TypeScript, and Vite.

## Overview

The application supports multiple institutions and locations from a single codebase, each with its own branding, service catalog, and data isolation. It provides four screens:

- **Ticket kiosk** — public screen where visitors pick a service and print a ticket.
- **Attendant console** — queue management: call, recall, complete, or cancel tickets.
- **Admin panel** — user management, printer configuration, and attendance reports.
- **TV display** — shows the current and recent calls, with audio alerts and a media playlist.

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router
- Tailwind CSS
- jsPDF (report export)

## Project Structure

```text
src/
├── auth/          # Session handling and route protection
├── components/    # Shared, reusable UI components
├── constants/      # Cross-screen constants (e.g. service colors)
├── locations/      # Institution/location routing and resolution
├── screens/        # One folder per screen (components/ + hooks/ + index.tsx)
└── services/        # API clients
```

Each screen follows the same pattern: presentational components in `components/`, state and side effects in `hooks/`, and a thin `index.tsx` composing them.

## Getting Started

### Prerequisites

- Node.js 20+
- The backend API running (see the API repository)

### Installation

```bash
npm install
cp .env.example .env
```

Update `.env` with your API URL and key.

### Run Locally

```bash
npm run dev
```

The app is served at `http://localhost:5173`.

### Run on the Network / HTTPS

`npm run dev` is a development server — don't point real devices at it.
Production is a static build served over HTTPS by a
[Caddy](https://caddyserver.com) reverse proxy, which also forwards `/api/*`
to the backend so the whole app lives under one origin:

```bash
npm run build
```

Point `VITE_API_BASE_URL` in `.env` at that same HTTPS origin, under `/api`,
**before building** — Vite bakes `VITE_*` values into the build at build
time, so changing `.env` after the fact does nothing until you rebuild:

```env
VITE_API_BASE_URL=https://200.132.193.104:8443/api
```

Caddy then serves `dist/` directly — see [`../Caddyfile`](../Caddyfile) for
the reverse proxy / TLS setup, including why it listens on 8443 instead of
443 on this host, and how to trust its certificate on other devices so they
don't see a browser warning.

Whenever frontend code changes, `npm run build` again — Caddy serves
whatever is currently in `dist/`, not live code.

### TV Display: Enabling the Call Alert Sound

The TV screen (`/unilab/:location/tv`, `/cre/:location/tv`) plays a sound
whenever a new ticket is called. Chrome blocks audio with sound from
autoplaying until the page receives a real user gesture (click, tap, or
keypress) — the app tries to "unlock" playback on the first such gesture,
but a TV display that's just a monitor with no mouse, keyboard, or touch
never produces one, so the alert never plays.

The video panel doesn't have this problem because it autoplays muted, which
Chrome always allows.

The fix is a Chrome/Chromium launch flag, not app code — set it wherever
the TV's browser is opened. The Debian kiosks bring the browser up through
an X autostart script (`~/.config/openbox/autostart`, `~/.xinitrc`, or a
`~/.config/autostart/*.desktop` entry, depending on how that machine's X
session is set up) — add the flag to the line that launches the browser
there:

```bash
chromium --kiosk --autoplay-policy=no-user-gesture-required "https://200.132.193.104:8443/unilab/campus/tv" &
```

- `--autoplay-policy=no-user-gesture-required` lifts the gesture requirement
  for that browser instance, so `audio.play()` with sound works from the
  first ticket call onward.
- `--kiosk` is optional but recommended for a dedicated TV display (fullscreen,
  no browser chrome).
- The binary name varies by install — check what's actually on that machine
  with `which chromium chromium-browser google-chrome google-chrome-stable`
  and use whichever exists.
- Swap the URL for the correct institution/location path for that display.
- If the browser is already running when you add the flag, kill it and let
  autostart relaunch it (or reboot the kiosk) — a flag only takes effect
  when the process is started with it.

If a display *does* get real interaction (e.g. a totem doubling as a TV, or
someone testing on a desktop), the in-app unlock-on-first-gesture logic in
`useTicketAlertSound.ts` still works as a fallback without this flag.

### Build

```bash
npm run build
npm run preview
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## License

Proprietary.
