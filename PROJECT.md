# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Personal tech blog at **blog.arda.tr** covering AI/LLM tooling, Go/DevOps, home networking, and generative AI music. Built with Astro for static HTML output.

## Architecture

- **Framework**: Astro 5 (Static Site Generator)
- **Styling**: TailwindCSS with CSS variables
- **Content**: Markdown files via Astro Content Collections
- **Theming**: Four renditions — Pulp / Pulp HC / Beta / Beta HC (see Theming below)
- **Deployment**: GitHub Pages

## Project Structure

```
.
├── src/
│   ├── content/
│   │   └── blog/               # Markdown posts in year folders (YYYY/YYYY-MM-DD-slug.md)
│   ├── components/
│   │   ├── Header.astro        # Masthead: wordmark, nav, rendition switch, register strip
│   │   ├── Footer.astro        # Colophon
│   │   ├── StripCell.astro     # One panel of the serialised strip (width = reading time)
│   │   ├── LedgerRow.astro     # Ruled ledger band used on /blog, /archive and related
│   │   ├── TagChip.astro       # Outlined tag chip
│   │   └── ThemeToggle.astro   # Rendition switch (4 renditions)
│   ├── layouts/
│   │   └── BaseLayout.astro    # Base HTML layout with SEO + theme boot script
│   ├── lib/
│   │   ├── posts.ts            # getPublishedPosts()/getSlug() helpers (pages + RSS)
│   │   ├── ledger.ts           # getLedger(): numbering, month tiers, year spine, the silence, tag counts
│   │   └── display.ts          # Date, reading-time, tone-plate and label helpers
│   ├── pages/
│   │   ├── index.astro         # Home page
│   │   ├── blog/
│   │   │   ├── index.astro     # Blog listing with tag filter
│   │   │   └── [slug].astro    # Individual blog post (+ related posts)
│   │   ├── archive.astro       # Posts grouped by year
│   │   ├── search.astro        # Pagefind search (only page that loads JS beyond inline scripts)
│   │   ├── rss.xml.js          # RSS feed
│   │   └── 404.astro           # Not found page
│   ├── content.config.ts       # Content collection schema
│   └── styles/
│       └── global.css          # Rendition tokens, screentone, panel/tier/ledger CSS, Tailwind
├── public/
│   └── images/                 # Static images, OG images
├── astro.config.mjs            # Astro configuration
└── tailwind.config.mjs         # Tailwind with CSS variables
```

## Commands

```bash
npm test         # Browser-control regression tests (Node, no extra dependencies)
npm run dev      # Development server (port 8080)
npm run build    # Production build to dist/ (merges sitemap, then indexes search with Pagefind)
npm run preview  # Preview production build
```

The Pagefind search index (`dist/pagefind/`) only exists after a build, so
`/search` shows a quiet fallback message under `npm run dev`. Only blog post
pages are indexed (`data-pagefind-body` on the post article).

## Blog Posts

### File Naming
Posts live in year subdirectories of `src/content/blog/` with format: `YYYY/YYYY-MM-DD-slug-name.md` (e.g. `src/content/blog/2026/2026-01-28-my-post.md`)

### Frontmatter Fields
```markdown
---
title: "Post Title"           # Required
date: "YYYY-MM-DD"            # Required
excerpt: "Brief description"  # For cards and social previews
tags: ["ai", "dev"]           # For filtering
keywords: "seo, keywords"     # SEO keywords
description: "SEO desc"       # Meta description
author: "Author Name"         # Post author
image: "/images/og.png"       # Optional: custom OG image
lang: "en"                    # Optional: post language (default "en")
draft: true                   # Optional: hide from production builds (default false)
---
```

### Content Collection
Posts are loaded via Astro Content Collections defined in `src/content.config.ts`. Schema validates frontmatter at build time.

## Theming

Four **renditions** defined in `src/styles/global.css` as per-rendition HSL CSS
variable blocks — the "Weekly Page" system, see [DESIGN.md](./DESIGN.md). The
rendition lists live in `src/layouts/BaseLayout.astro` (boot script) and
`src/components/ThemeToggle.astro` (`renditions` array). Catalogue, in menu
order:

| ID | Name | Kind |
|----|------|------|
| `pulp` | Pulp | Light, the native rendition (bound to `:root`) |
| `pulp-hc` | Pulp HC | High-contrast light (AAA) |
| `beta` | Beta | Dark — the reversed page |
| `beta-hc` | Beta HC | High-contrast dark (AAA) |

The rendition is stored in localStorage under `theme` and applied as a class on
`<html>`. The boot script in `BaseLayout.astro` migrates every legacy Ink &
Ledger id (`alucard`/`paper`/`blade`/`dracula-pro`/`carbon`/`buffy`/`lincoln`/
`morbius`/`van-helsing`, plus the older `dark`/`light`/`dracula`) onto the
nearest plate, and falls back to the visitor's system color-scheme/contrast
preference when nothing is stored. Theme controls continue to work when browser
storage is blocked; preferences simply cannot persist in that case.

`scripts/check-theme-contract.mjs` (run by `.github/workflows/theme-contract.yml`)
compares this repo against the catalogue published by `c0ze/arda.tr`
(`config/themes.json`). arda.tr now publishes its own four renditions with
different ids, so the two catalogues have deliberately diverged; the script
reports the divergence and soft-passes until the ids line up again. Run it
locally with `THEMES_CONTRACT_PATH=../arda.tr/config/themes.json node scripts/check-theme-contract.mjs`.


## SEO & Social Sharing

- **Per-page meta tags** - Title, description, keywords set in BaseLayout
- **Open Graph** - og:title, og:description, og:image, og:url
- **Twitter Cards** - summary_large_image format
- **Custom OG images** - Add `image` field to frontmatter for per-post images
- **JSON-LD** - BlogPosting schema on blog posts
- **Canonical URLs** - Automatically generated

## Path Aliases

Configured in `astro.config.mjs` and `tsconfig.json`:
```typescript
import Component from '@/components/Component.astro'
```

## Key Differences from React Version

1. **Static HTML** - Every page is pre-rendered, no client-side routing
2. **No hydration** - Components render to HTML only; the build emits no Astro JS bundle, only `is:inline` scripts
3. **Content Collections** - Type-safe markdown with Zod schema validation
4. **Per-page OG images** - Social previews work correctly now
5. **Faster builds** - ~3 seconds for all pages

## Code Style

- Use `.astro` files for components and pages
- Keep interactive JS minimal (inline scripts with `is:inline`)
- Use the Weekly Page classes (`.panel`, `.tierlab`, `.ledger__row`, `.label`, `.tone-*`) and the named tokens (`--ink`, `--pulp`, `--trim`, `--spot`); see DESIGN.md
- Follow existing component patterns


<!-- ============================================================
UNRECONCILED — 4 lines that existed only in AGENTS.md when CLAUDE.md and
AGENTS.md were consolidated (2026-08-08). Fold anything useful into the
sections above, then delete this block.
============================================================ -->

# AGENTS.md
npm run build    # Production build to dist/
│   │   │   └── [slug].astro    # Individual blog post
This file provides guidance to Codex when working with this repository.
