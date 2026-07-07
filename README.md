# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Project notes (Local development)

This project includes a small mock Express server used for storing bookings and simple auth during development.

Quick start:

1. Install dependencies (frontend + server):

```bash
# from project root
npm install

# install server deps
cd server
npm install
cd ..
```

2. Start the mock server (default port 4000):

```bash
cd server
npm start
```

3. Start the frontend dev server:

```bash
npm run dev
```

Environment variables:

- `VITE_API_BASE` — set this if the mock server runs on a different origin (e.g. `http://localhost:4000`). The frontend reads `VITE_API_BASE` at build-time to determine the API base URL.
- `VITE_RAZORPAY_KEY_ID` — (optional) Razorpay public key used by the frontend to open the checkout.
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` — (optional) server-side Razorpay credentials used to create orders. If not provided, the server falls back to a mock gateway.
- `RAZORPAY_WEBHOOK_SECRET` — (optional) webhook secret used to verify incoming Razorpay webhook events.

Note: This project originally referenced `REACT_APP_API_BASE` in older templates. The Vite convention uses `VITE_` prefixes for variables exposed to the client; server-side secrets should not use `VITE_` and must be set in your runtime environment only.

Features added in this branch:

- Mock Express backend with endpoints: `/api/register`, `/api/login`, `/api/me`, `/api/bookings`, `/api/create-order`, `/api/confirm`.
- Client-side seat hold & release with robust localStorage persistence and best-effort server sync.
- Optimized `SeatSelection.jsx` (memoization, reduced polling, accessibility improvements).
- Ticket page: printable ticket, QR code generation, and client-side PDF download.

If you run into dev-server overlay errors about unresolved imports after installing deps, try restarting Vite with `--force`:

```bash
npm run dev -- --force
```

Questions or want me to add server-side WebSocket holds / Razorpay integration? Tell me which next and I will implement it.

