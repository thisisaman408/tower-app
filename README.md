# Tower — Gemini-Vision Competitive Intelligence

> The autonomous market-intelligence analyst for founders. Drop competitors on a watchlist. Tower scans their pricing pages, careers, blog, and social daily. Gemini Vision reads the actual screenshots. A diff engine catches week-over-week change. A founder-grade Brief Writer auto-generates a 3-paragraph board memo. Slack fires on high-signal events.

## Demo

**[tower-demo.vercel.app](https://tower-demo.vercel.app)** · No API key required for demo mode.

### The 60-second killer moment
1. Open `/demo/extract`
2. Drop the `adversarial/injection-01.png` sample — watch Lobster Trap block it live
3. Drop `hubspot/pricing/2026-05-13.png` — watch Gemini Vision extract every pricing tier in real-time JSON
4. Navigate to `/watchlists/wl-demo-001` — see the weekly brief, diff viewer, and 3D knowledge graph

## Features

| Feature | Description |
|---|---|
| Gemini Vision Extraction | Drop a screenshot, get structured `Signal[]` via Gemini 2.0 Flash |
| Diff Engine | Week-over-week semantic diff using pgvector cosine similarity |
| Brief Writer | Weekly competitive memo via Gemini 2.0 Pro, Stratechery voice |
| Lobster Trap | Image prompt-injection defense on every Gemini Vision call |
| 3D Knowledge Graph | React Three Fiber + react-force-graph-3d, Neo4j-backed |
| High-Signal Alerts | Slack + email on `impact >= 80` |
| Public Share URLs | Read-only brief pages with Tower watermark |

## Tech Stack

- **Next.js 16** App Router + TypeScript 5
- **Tailwind CSS v4** with dark-mode OKLCH design tokens
- **Gemini 2.0 Flash** multimodal (extraction hero) + **Gemini 2.0 Flash** (briefs + KG)
- **Drizzle ORM** + **Neon Postgres** + **pgvector** for signal dedup
- **Neo4j AuraDB** for company knowledge graph
- **Veea Lobster Trap** for image prompt-injection defense
- **React Three Fiber** + **react-force-graph-3d** for 3D KG
- **Inngest** for daily scanner jobs
- **Vercel Blob** for screenshot storage
- **Resend** for email alerts

## Quick Start

```bash
git clone https://github.com/your-handle/tower
cd tower
bun install
cp .env.example .env.local
# Add GEMINI_API_KEY to .env.local (get from aistudio.google.com)
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

See [SYSTEM-DESIGN.md](../SYSTEM-DESIGN.md) for the full system design including data models, pipeline specs, UI wireframes, and demo script.

## Prize Targets

- **Gemini Award** — Track 4: Data & Intelligence. Three Gemini surfaces (Flash multimodal, Flash Pro for briefs and KG). Screenshot extraction is the hero.
- **Veea Award** — Lobster Trap image prompt-injection defense. Audit panel + adversarial demo corpus.

## License

MIT
