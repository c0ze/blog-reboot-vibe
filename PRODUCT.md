# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: peers and collaborators.** Engineers and makers who arrive from
GitHub (`c0ze`), Mastodon, Bluesky, `arda.tr`, or an RSS reader. They are here
to read something specific, not to browse a brand.

**Secondary: Arda himself.** The blog is the working log — the place a project
gets written down while it is still warm.

Not a recruiter surface (that is `resume.arda.tr`) and not a lead-generation
surface. No conversion funnel belongs here.

## Product Purpose

A personal blog, published since 2010, holding 86 posts. It is where the work
on `arda.tr` gets explained: how a thing was built, why it was abandoned, what
the interesting part was.

Success: a peer reads to the end of a post and comes back for the next one.

## Positioning

Sixteen years of one person's writing, with a visible seven-year silence in the
middle (2019–2024) and a heavy recent burst — 52 of 86 posts are from 2025–2026.

The archive is not uniform and should not pretend to be: 2010–2011 is a Turkish
and Japanese personal scrapbook (music links, diary entries, one post titled
"(No Title)"); 2013–2018 is sparse infrastructure notes; 2025–2026 is dense
"Introducing X" ship-logs and essays on AI, agents, MCP, Gleam, ReScript and
generative black metal.

## Operating Context

- Astro 5 static site on GitHub Pages, `blog.arda.tr`.
- Sibling to `arda.tr` (index), `resume.arda.tr` (dossier), `ai.arda.tr`.
- Every push to `main` auto-announces new posts to **Mastodon and Bluesky**
  via `post-mastodon` / `post-bluesky` in the deploy job.
- Inbound is social, RSS and referral. Search is Pagefind, built at deploy time.

## Capabilities and Constraints

- **Astro 5.16 static**, `@astrojs/tailwind` + `@astrojs/sitemap` only.
  Tailwind 3.4 with `@tailwindcss/typography`. No MDX integration, and the
  content glob is `**/*.md` — posts cannot embed components today.
- **Zero JS by default is a stated repo invariant.** No hydration except the
  theme toggle; interactive JS must be small inline `is:inline` scripts.
  `/search` is the single exception, lazily loading Pagefind. A redesign that
  needs a JS framework is the wrong redesign.
- **Post bodies contain raw HTML** — 66 markdown images plus 15 `<img>`,
  11 `<iframe>` (youtube-nocookie, SoundCloud), 2 `<video>`. These must keep
  rendering inside the prose column.
- **Excerpt length is a hard product constraint.** A too-long `excerpt` once
  broke a deploy against Mastodon's 500-character limit.
- **Build is a three-step chain**: `astro build && tsx scripts/merge-sitemap.ts
  && pagefind --site dist`. `merge-sitemap` exits 1 without `dist/sitemap-0.xml`;
  Pagefind needs `data-pagefind-body` to survive on post pages.
- **Frontmatter schema** (`src/content.config.ts`): `title`, `date` required;
  `excerpt`, `author`, `description`, `keywords`, `image`, `lang`, `draft`
  optional. `image` does double duty as OG image and card art. No `heroImage`,
  no `series`, no `updated`.
- **49 tags, long-tail** — `dev` 42, `legacy` 23, `ai` 22, `geek` 13, `music` 9,
  and 32 tags used exactly once. `legacy` marks the pre-2019 archive.
- **No tag pages and no pagination.** `/blog` renders all 86 posts at once and
  filters client-side via `?tag=`.
- **Only automated gates are `astro check` and the theme-contract script.**
  There is no lint, no test suite, and no `verify` script.
- Node 24.14.0 pinned via `.mise.toml`.
- **Everything about the current visual system is in scope for replacement**,
  including the shared nine-theme Ink & Ledger catalogue (confirmed 2026-07-25).

## Brand Commitments

- Wordmark **"Coze."**; the strapline *the ledger of side quests*; the footer
  line *"Coze — printed in the side-quest room since 2010."*
- The disclosure **"Human-driven. AI is utilized solely for editorial
  refinement."** must survive any redesign.
- Voice is dry, first-person, unhyped — "first post baby", "Grep Thyself".
- Licence split: code MIT, **posts CC BY 4.0**.
- The Cloudflare Web Analytics beacon ships `is:inline` and must stay verbatim.

## Evidence on Hand

Real and usable: 86 dated posts with real titles, tags and reading times; a
genuine 2010 start date; real embedded media; a real RSS feed with enclosures;
Mastodon and Bluesky presences.

**Absent — must never be fabricated:** view counts, subscriber numbers,
comments, reactions, "popular post" rankings, or any engagement metric. The
site collects none of these.

## Product Principles

1. **The post is the product.** Every design decision serves reading a single
   piece of prose to the end.
2. **Zero JS by default.** Interactivity is a cost, not a feature.
3. **Recent work leads; the archive stays reachable.** The front page is
   current; sixteen years of history is one deliberate click away, not buried
   and not shoved forward (confirmed 2026-07-25).
4. **The archive is uneven and that is honest.** Do not retro-fit 2010 diary
   entries into the register of 2026 ship-logs.
5. **Claim only what is real.** There are no engagement numbers to show.

## Accessibility & Inclusion

- WCAG-conscious contrast in every theme, with at least one AAA-targeted
  high-contrast light mode and one AAA-targeted high-contrast dark mode.
- `prefers-reduced-motion` fully respected.
- Posts carry `lang` where they are not English (5 `tr`, 3 `ja`); `<html lang>`
  follows it. `og:locale` is currently hardcoded `en_US` — a known defect.
- Semantic sectioning, keyboard-reachable navigation, visible focus states.
