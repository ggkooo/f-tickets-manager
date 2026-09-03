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
