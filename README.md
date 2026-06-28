# Cursor Trail Effect

Interactive iridescent splash cursor with WebGL fluid simulation. Move your mouse across the screen, the cursor leaves a fluid like trail with cycling hues. An SVG text mask (Learn / Innovate / Lead) cuts through the effect.

Built with React 18, TypeScript, and raw WebGL. Ported from reactbits.dev's SplashCursor.

## Usage

```bash
npm install
npm start       # dev server at localhost:3000
npm run build   # production build
```

## Architecture

- `src/SplashCursor.tsx` - WebGL fluid simulation, iridescent hue cycling, pointer tracking
- `src/App.tsx` - SplashCursor + three line SVG text cutout overlay
- CRA 5, no router, no extra deps beyond react-scripts and three.js (used for math utilities)
