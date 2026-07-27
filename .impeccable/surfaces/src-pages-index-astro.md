---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/layouts/BaseLayout.astro","src/styles/global.css"]
---

## Scope & mode

`blog.arda.tr` index, post, archive, search and 404. Visitor mode: **Read** —
comprehension and wayfinding first, then make the reading worth staying in.

## Audience, job, action

Peers arriving from GitHub, Mastodon, Bluesky, `arda.tr` or RSS to read one
specific thing. Success is finishing a post and coming back. No funnel.

## Direction contract

**THESIS.** Sixteen years of writing set as a weekly manga page, where material
is rendered by screentone pitch and structure by panel and gutter. Refuses the
blog-index arrangement: full-bleed hero, card grid, infinite scroll, tag cloud.

**OWN-WORLD.** Ink `#121212` on pulp `#EDEAE3`, with one rationed vermilion
`#D93A1E`. Every intermediate value is an SVG dot pattern at 10/30/50/70 —
never a flat grey, never an opacity. Zen Kaku Gothic New 900 for titles and
labels, Zen Old Mincho for prose: the actual manga convention of gothic
dialogue over mincho narration, and full CJK coverage for the eight non-English
posts. Radius 0, no shadow, no blur, no glass, zero JS.

**STORY.** A peer sees sixteen years of uneven output as one continuous
serial, finds the current entry immediately, and reads it at a 68ch measure.

**FIRST VIEWPORT.** Masthead (`Coze.` / *the ledger of side quests* / 86 entries
· since 2010), the four-pitch register strip, then THE RUN — 2026 month by
month as horizontal tiers, tier label set vertically in the gutter, panel width
proportional to reading time, the current entry marked in vermilion.

**FORM.** Weekly manga page; brief-pinned by the user, so no roll was run.
Staged as the serialised strip (comp C), approved 2026-07-25. Its signature
moment is the silence tier: 2019–2024 rendered as a tone band captioned SEVEN
YEARS / NO ENTRIES, which makes the gap a designed beat rather than an omission.

## Memorable moment

The silence tier. Every other blog hides its quiet years; this one prints them
at full width as a measured tone plate.

## Confirmed at comp approval (2026-07-25)

- Build comp C (serialised strip).
- Panel width proportional to reading time carries forward.
- Recent leads; the archive stays one deliberate click away and is never merged
  into the front page.

## Unresolved

- Whether Pulp HC / Beta HC can hit AAA without darkening Ink Grey (6.0:1 today).
- The cross-repo theme contract: arda.tr now publishes v2 with four renditions
  and different ids. This repo's `check-theme-contract.mjs` will hard-fail on
  drift once arda.tr merges.
