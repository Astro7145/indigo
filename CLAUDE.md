# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js with Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

There are no tests configured yet.

## Architecture

This is a **Next.js 16 App Router** project using **React 19**, **TypeScript** (strict mode), and **Tailwind CSS v4**.

- `app/` — App Router root: `layout.tsx` sets global fonts and base layout; `page.tsx` is the home route
- `app/globals.css` — Tailwind entry point; defines `--background`/`--foreground` CSS variables mapped into Tailwind via `@theme inline`; also sets `--font-sans`/`--font-mono` from Geist font variables
- `src/` — empty, reserved for future application code
- `@/*` path alias resolves to the project root

**Styling:** Tailwind v4 is configured via PostCSS (`@tailwindcss/postcss`). CSS variables drive theming — `background`/`foreground` Tailwind utilities use `--color-background`/`--color-foreground`, which point to the root CSS variables. Dark mode uses `prefers-color-scheme`.

**Fonts:** Pretendard Variable (`--font-pretendard`) is loaded via `next/font/local` from `app/fonts/PretendardVariable.woff2` (copied from the `pretendard` npm package). Geist Mono (`--font-geist-mono`) is kept for monospace via `next/font/google`. Both are exposed as CSS variables on `<html>`.

**ESLint:** Uses `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`; `.next/`, `out/`, and `build/` are ignored.
