# Movies Web

A React + Vite movie booking website with a small Express mock backend for auth, bookings, seat holds, and optional Razorpay payment flow.

## Features

- Movie browsing, details, seat selection, and booking flow
- Auth pages for signup, login, forgot password, and profile
- Mock server for bookings and simple user storage during development
- Ticket generation with QR code and PDF download
- Seat reservation sync with localStorage and server refresh

## Prerequisites

- Node.js 18 or newer
- npm

## Install

Install frontend dependencies from the project root:

```bash
npm install
```

Install server dependencies:

```bash
cd server
npm install
cd ..
```

## Run

Start both the mock server and the Vite client:

```bash
npm run dev
```

If you want to run only the frontend and the server is already running on port 4000:

```bash
npm run dev:client
```

Start only the mock server:

```bash
npm run start:server
```

Start the server directly from the server folder:

```bash
cd server
npm start
```

## Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Server Commands

Inside the server folder, you can also run:

```bash
cd server
npm run rehash-users
```

This is used to rehash stored user passwords when needed.

## Environment Variables

Client-side variables must use the `VITE_` prefix.

- `VITE_API_BASE` - API base URL for the frontend, for example `http://localhost:4000`
- `VITE_RAZORPAY_KEY_ID` - optional Razorpay public key for checkout
- `VITE_EMAILJS_SERVICE_ID` - EmailJS service id for forgot-password emails
- `VITE_EMAILJS_TEMPLATE_ID` - EmailJS template id for forgot-password emails
- `VITE_EMAILJS_PUBLIC_KEY` - EmailJS public key for forgot-password emails

Server-side variables:

- `RAZORPAY_KEY_ID` - optional Razorpay key id for order creation
- `RAZORPAY_KEY_SECRET` - optional Razorpay secret used to verify payment signatures
- `RAZORPAY_WEBHOOK_SECRET` - optional webhook secret for Razorpay event verification
- `PORT` - optional server port, defaults to `4000`

## API Endpoints

The mock server exposes these endpoints:

- `GET /api/health`
- `GET /api/bookings`
- `POST /api/register`
- `POST /api/login`
- `POST /api/create-order`
- `POST /api/confirm`
- `POST /api/webhook`

## Notes

- The root `npm run dev` command automatically starts the mock server if port 4000 is free.
- If Vite shows unresolved import errors after a fresh install, restart with force:

```bash
npm run dev -- --force
```

