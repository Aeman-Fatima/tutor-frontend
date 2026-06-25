# AI Tutor — Angular Frontend

The student-facing interface for the AI tutoring system. Students select a math problem, type their attempt, and receive adaptive feedback from the tutor. Built with Angular 18, Angular Material, and Tailwind CSS.

All API calls are proxied to the Node.js backend running on `localhost:3000`.

---

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- The Node.js backend running on port 3000 (see `tutor-backend/README.md`)

---

## Installation

```bash
cd tutor-frontend
npm install
```

---

## Running

```bash
npm start
```

This runs `ng serve` with the proxy config and opens the app at `http://localhost:4200`.

All `/api/*` requests are automatically forwarded to `http://localhost:3000` via `proxy.conf.json` so you do not need to configure CORS manually.

Production build:

```bash
npm run build
```

Output goes to `dist/`.

---

## Dependencies

| Package | Version |
|---|---|
| Angular | 18 |
| Angular Material | 18 |
| Tailwind CSS | 4 |
| TypeScript | ~5.4 |
| RxJS | ~7.8 |

---

## Project Structure

```
tutor-frontend/
  src/
    app/
      components/       # UI components
      services/         # API service layer
      app.routes.ts     # Route definitions
      app.config.ts     # App configuration
  proxy.conf.json       # Proxies /api to localhost:3000
```

---

## Running the Full Project

Start services in this order:

1. Set up and start the Python pipeline environment (see `tutor/README.md`)
2. Start the backend: `npm run dev` from `tutor-backend/`
3. Start the frontend: `npm start` from `tutor-frontend/`
4. Open `http://localhost:4200` in your browser
