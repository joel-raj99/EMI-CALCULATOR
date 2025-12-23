<!-- Copilot / AI assistant instructions for this repository -->

# Copilot Instructions — emi (Next.js)

Purpose: give AI coding agents the concise, actionable context they need to be productive in this repo.

- Project type: Next.js app using the App Router (source under `src/app`). Root layout: `src/app/layout.js`, main page: `src/app/page.js`.
- Important scripts (see package.json): `npm run dev` (dev server), `npm run build`, `npm start`, `npm run lint`.

Key conventions and patterns
- App router & components: files under `src/app` are Next.js App Router entries. Components are server components by default — add `"use client"` at the top of a file to make it a client component.
- Global styles & Tailwind: global stylesheet is imported in `src/app/layout.js` (see `globals.css`). PostCSS and Tailwind are in the toolchain (see `postcss.config.mjs` and `package.json` devDeps). Expect Tailwind utility classes in components (example: the `className` strings in `src/app/page.js`).
- Fonts: uses `next/font` (see `src/app/layout.js`) — prefer that API for font handling.
- Image/static assets: static files live in `public/` and are referenced with root paths (e.g. `/next.svg` in `src/app/page.js`). Use Next's `Image` component when present.
- Path aliases: `@/*` maps to `./src/*` via `jsconfig.json` — use `@/` imports to reference source files.
- ESLint: config extends Next's Core Web Vitals rules with custom global ignore overrides (`eslint.config.mjs`). Run `npm run lint` before pushing changes.

Build & run notes
- Start dev server: `npm run dev` (listens on :3000 by default).
- Production build: `npm run build` then `npm start`.
- Linting: `npm run lint` (ESLint is configured via `eslint.config.mjs`).
- The Next config enables the React compiler: `reactCompiler: true` in `next.config.mjs`.

What to look for when changing code
- When adding interactive UI, mark the file with `"use client"` and keep server-only logic (data fetching) in server components or route handlers.
- When editing CSS, prefer `src/app/globals.css` and Tailwind utilities; ensure PostCSS pipeline remains valid (`postcss.config.mjs`).
- If adding new top-level routes, create them under `src/app` as folders with `page.js` and (optional) `layout.js`.

Examples from the repo
- Root layout: `src/app/layout.js` imports `./globals.css` and defines top-level HTML structure.
- Page: `src/app/page.js` uses Tailwind classes and `next/image` to render assets from `public/`.
- Alias example: imports using `@/` will resolve to `src/` because of `jsconfig.json`.

Integration points & dependencies
- Vercel/Next deployment is assumed (standard Next setup). No server-side API routes are present by default — check `src/app` for any `route.js` or `api` folders.
- Key packages: `next`, `react`, `react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, and `eslint-config-next` (see `package.json`).

If you're unsure
- Run `npm run dev` locally and open http://localhost:3000 to verify UI changes.
- Run `npm run lint` to catch style and common issues before committing.

If anything in these notes is unclear or you want me to add examples for a particular change flow (adding a route, creating a client component, or wiring a new CSS utility), tell me which area and I'll expand this file.
