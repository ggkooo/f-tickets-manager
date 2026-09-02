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

### Run on the Network

The dev server binds to all network interfaces by default, so it can be reached from other devices on the same network:

```text
http://<host-machine-ip>:5173
```

For example, on this project's host machine (`200.132.193.104`):

```text
http://200.132.193.104:5173
```

Point `VITE_API_BASE_URL` in `.env` to the backend's network address as well:

```env
VITE_API_BASE_URL=http://200.132.193.104:8000/api
```

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
