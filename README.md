# Accountability

**A habit tracker where the missing ingredient — accountability — is the whole point.**

Most habit trackers are lonely. You start strong, then quietly fall off, because the only person keeping you honest is you. Accountability fixes that: you pair with **one person you trust** via a private invite code, and from then on you keep your promises *together* — you can see each other's progress, cheer, nudge, forgive a missed day, and rescue a streak.

Built with Next.js 15, React 19, TypeScript, and Tailwind. Warm, minimal, mobile-first, installable as an app.

**▶ Live app: <https://prathikkshaa.github.io/Accountability/app/>** — it's a fully client-side, offline PWA. Your data lives on your device (localStorage); there's no server.

---

## What it does

- **Onboarding** — a warm, momentum-driven flow: pick what you want to show up for, make it real, add your reason, and get a private invite code to bring your person in.
- **Today (home)** — your promises with one-tap, proof-optional check-ins; a "next up" hero; your partner's live progress woven in with reactions and nudges.
- **Proof, optionally** — a check-in can carry a mood, a note, and a photo. Your partner sees it — the witness *is* the accountability. No proof? They can ask for it.
- **Streaks & milestones** — per-goal streaks, a history heatmap, and a celebration at milestones (3, 7, 14, 21, 30, 50, 75, 100 days).
- **Shared streaks** — consecutive days you *both* showed up, front and center, and shareable as an image.
- **Partners** — pair or unpair anytime (with a 4-hour reconnect cooldown), nudge (rate-limited), and see each other's partner-visible goals.
- **Grace & rescue** — ask a partner to forgive a missed day, or have them rescue your streak.
- **Groups** — shared goals with collective-target or individual-challenge modes (up to 15 members).
- **You** — profile, stats, goal management, themes (Royal / Ink / Forest), light/dark/system mode, sound & reminder toggles.

## Tech

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** with a token-driven, themeable design system (warm-royal palette, humanist type)
- **API routes** back a small file-based JSON store (`data/db.json`) — a prototype backend; see [Data](#data--persistence)
- **PWA** — installable to a phone home screen (`public/manifest.webmanifest`)

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The onboarding is at `/`, the app at `/app`, and a dev-only partner-join preview at `/preview`.

The app is currently scoped to a seeded demo user ("Tara"), who already has partners, goals, a group, and history so every screen is populated. There's no login yet.

## Scripts

| script | what it does |
|---|---|
| `npm run dev` | start the dev server |
| `npm run build` | production build |
| `npm run start` | run the production build |
| `npm run lint` | lint |

## Install it on your phone

It's a **PWA** — it installs to your home screen and runs full-screen like a native app, fully offline.

**Android (Chrome):** open **<https://prathikkshaa.github.io/Accountability/app/>** → menu (⋮) → **Install app** / **Add to Home screen**. Chrome packages it as a **WebAPK** — a real installed app on your device.

**iOS (Safari):** open the URL → Share → **Add to Home Screen**.

**Want an actual downloadable `.apk` file?**
1. Go to **<https://www.pwabuilder.com>**.
2. Paste **`https://prathikkshaa.github.io/Accountability/app/`** and hit Start.
3. Choose **Android** → **Generate Package**.
4. Download the `.apk` (use the "signed test package" for sideloading), copy it to your phone, and open it to install. (You may need to allow "install from unknown sources".)

## Deploy

The repo auto-deploys to **GitHub Pages** on every push to `main` via `.github/workflows/deploy.yml` (static export, base path `/Accountability`). Because the app is fully client-side, any static host works too — drop the `out/` folder (from `npm run build`) onto Netlify, Vercel, Cloudflare Pages, etc.

## Data & persistence

`src/lib/store.ts` is an isomorphic storage engine: in the browser it persists to **localStorage** (so the installed app works offline, per-device), and on a Node server it falls back to a JSON file. It seeds demo data on first run and enforces the real business rules (today-only check-ins, invite validation, nudge rate limits, disconnect cooldown, group size caps, streak math including grace/rescue). To reset the app, clear the site's storage. Swap this for a shared database when you add multi-user sync.

## Project structure

```
src/
  app/
    page.tsx            # onboarding (/)
    app/                # the product (/app): today, partners, groups, you, goal/[id]
    api/                # route handlers (auth, goals, check-in, pairing, nudges, grace, rescue, groups)
    preview/            # dev-only partner-join preview
  components/
    app/                # the app UI kit (check-in sheet, cards, share card, theme, reminders…)
    onboarding/         # the onboarding flow
  lib/                  # store, types, api clients, theme, sound
```

## Status & roadmap

A working v1. Known limits: no auth (single seeded user), file-based storage, and reminders fire only while the app is open/installed-and-running (true background push needs a server + web-push). Natural next steps: real auth + database, background push, and file storage for photo proofs.
