# Cursor Trail Effect

**Project page:** [[01_Projects/???]]

## Goal
Interactive cursor splash effect with iridescent fluid simulation (WebGL) and "Learn / Innovate / Lead" text cutout mask overlay.

## Stack
React 18, TypeScript, CRA 5, WebGL/WebGL2

## Files
- `src/SplashCursor.tsx` — WebGL fluid simulation splash cursor (ported from reactbits.dev, TS + iridescent hue cycling)
- `src/App.tsx` — Main component: SplashCursor + SVG text mask overlay
- `src/App.css` — Text styling (DM Mono, italic, centered)
- `src/index.tsx` — Entry point

## Commands
- `npm start` — dev server at localhost:3000
- `npm run build` — production build

## Changes
- 2026-06-27: Cloned from GitHub, converted JS→TS, replaced old canvas cursor with SplashCursor (iridescent WebGL fluid sim), consolidated to single SVG text mask
