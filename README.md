# Coze Blog (Astro)

Personal tech blog at **blog.arda.tr** - built with Astro for static HTML output, perfect SEO, and per-page social media previews.

The visual system is **"The Weekly Page"** — sixteen years of posts set as a
weekly manga page, with screentone pitch as material and panel-and-gutter as
structure. See [DESIGN.md](./DESIGN.md).

## Quick Start

```bash
# Install dependencies
npm install

# Development server (http://localhost:8080)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Build Output

The `npm run build` command generates static HTML in the `dist/` folder. Astro automatically:

- **Minifies HTML** - Whitespace removal, attribute optimization
- **Minifies CSS** - Via Tailwind's built-in purging + Vite's CSS minification
- **Minifies JS** - Via Vite/Rollup with tree-shaking
- **Optimizes assets** - Content-hashed filenames for caching

After the Astro build, the sitemap is merged and [Pagefind](https://pagefind.app)
indexes the post pages into `dist/pagefind/`, powering the `/search` page. The
index only exists after a build, so `/search` shows a quiet fallback note under
`npm run dev`.

## Deployment

### GitHub Pages

This repo already ships with [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).
Push to `main` or trigger the workflow manually and GitHub Pages will build and publish `dist/`.

If you need to recreate the workflow, the shape is:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run check

      - name: Build Astro site
        run: npm run build

      - name: Post to Mastodon
        if: github.event_name == 'push'
        env:
          MASTODON_ACCESS_TOKEN: ${{ secrets.MASTODON_ACCESS_TOKEN }}
          BEFORE_SHA: ${{ github.event.before }}
          AFTER_SHA: ${{ github.event.after }}
        run: npm run post-mastodon

      - name: Post to Blue Sky
        if: github.event_name == 'push'
        env:
          BLUESKY_PASSWORD: ${{ secrets.BLUESKY_PASSWORD }}
          BEFORE_SHA: ${{ github.event.before }}
          AFTER_SHA: ${{ github.event.after }}
        run: npm run post-bluesky

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

### Manual Deploy

```bash
npm run build
# Publish dist/ to GitHub Pages or another plain static host
```

## Creating New Posts

Create a new markdown file in the post's year folder, `src/content/blog/YYYY/`, with the format `YYYY-MM-DD-slug-name.md` (e.g. `src/content/blog/2026/2026-01-28-your-post.md`):

```markdown
---
title: "Your Post Title"
date: "2026-01-28"
excerpt: "Brief description for cards and social previews"
tags: ["dev", "ai"]
keywords: "seo, keywords, here"
description: "SEO meta description"
author: "Arda Karaduman"
image: "/images/your-og-image.png"  # Optional: custom social preview image
---

Your content here...
```

### Available Tags

Tags are free-form — reuse an existing tag when one fits (common ones include `dev`, `geek`, `music`, `metal`, `ai`, `hardware`, `retro`). Tags render as outlined chips and drive the `/blog?tag=` filter; on the front page their screentone plate is picked by frequency in `src/lib/display.ts`.

## Project Structure

```
src/
├── content/blog/     # Markdown blog posts (one folder per year)
├── components/       # Astro components
├── layouts/          # Page layouts
├── lib/              # Post, ledger and display helpers
├── pages/            # Route pages
└── styles/           # Rendition tokens, screentone and the panel system
public/
└── images/           # Static images
dist/                 # Build output (git-ignored)
```

## Performance Features

- **Zero JS** - The build emits no Astro JavaScript bundle at all
- **Inline scripts only** - Four `is:inline` scripts in total: the rendition boot, the rendition switch, the `/blog` tag filter, and the `/search` Pagefind loader (which lazy-loads the Pagefind UI on that page alone)
- **Static HTML** - Every page is pre-rendered at build time
- **Optimized fonts** - Zen Kaku Gothic New + Zen Old Mincho from Google Fonts, with preconnect
- **CSS purging** - Unused Tailwind classes removed automatically

## License

The code is [MIT-licensed](./LICENSE). Blog posts (`src/content/blog/`) are
licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — share and
adapt with attribution (a link back to the original post is enough). Images are
© Arda Karaduman unless noted otherwise in the post.
