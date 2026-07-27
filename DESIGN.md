---
name: blog.arda.tr
description: Sixteen years of posts set as a weekly manga page — tone pitch as material, panels as structure, ink as the only colour.
---

# Design System: blog.arda.tr

Implemented on `redesign/weekly-page`. Every token below is the value that is
actually in `src/styles/global.css`; every measurement was taken from the built
site rather than intended.

## Overview

**Creative North Star: "The Weekly Page"**

The weekly manga anthology is a printing problem solved with astonishing
economy: one ink, cheap pulp paper, and a whole world rendered by nothing but
line weight and screentone pitch. No gradients, no colour, no photography — and
it carries decades of serialised storytelling anyway. That constraint is the
right one for a blog that ships on a zero-JS budget and has to make 84 posts of
plain prose feel like a place.

Material is rendered by **tone**, not by fill: a 10% dot is skin, 30% is
shadow, 70% is weather, and solid black is reserved for the decisive beat.
Structure is rendered by **panel and gutter**: the gutter paces the read, a
bleed past the trim marks emphasis, and the page turn is the cliffhanger.

**One deliberate departure from the source.** Manga reads right-to-left; this
blog does not. The prose is English, the audience is international, and reading
order is not a place to be clever — clarity wins conflicts. The panel grammar,
the tone pitches, the gutters and the bleeds are all borrowed; the reading
order is not. Panels flow left-to-right, top-to-bottom, everywhere.

**Confirmed anti-references:** the incumbent Ink & Ledger look this replaces —
frosted glass, the dot-grid hero field, the 36-second tag marquee, hover
scale-ups, the `text-6xl → md:text-8xl` wordmark; and, separately, every
"comic" cliché — speech-bubble decorations around non-dialogue, halftone used
as wallpaper, and cartoon display faces.

**Key Characteristics:**

- Black ink on pulp; tone pitch is the only halftone and the only "grey"
- Panels and gutters carry structure; nothing floats and nothing blurs
- Solid black fill is rationed — one per viewport-height region
- Gothic for headings and dialogue, mincho for prose: the actual manga convention
- Zero JS; every device above is CSS or inline SVG

## Colors

One ink, one pulp, one rationed spot. Everything else is a tone pitch.

Each rendition declares only the Tailwind colour contract as raw HSL triplets;
the named tokens are derived from it once, so a colour has exactly one source
of truth per rendition:

```css
--ink: hsl(var(--foreground));       --pulp:      hsl(var(--background));
--ink-grey: hsl(var(--muted-foreground));  --pulp-deep: hsl(var(--secondary));
--trim: hsl(var(--border));          --spot:      hsl(var(--accent));
--spot-ink: hsl(var(--accent-ink));  --rev-fg:    hsl(var(--background));
```

### Renditions

Four, in menu order. Class on `<html>`; `pulp` is bound to `:root`.

| id | name | kind | page | ink | metadata | trim |
|----|------|------|------|-----|----------|------|
| `pulp` | Pulp | light, native | `#EDEAE3` `42 22% 91%` | `#121212` `0 0% 7%` | `#565248` `43 9% 31%` | `#B8B2A4` `42 12% 68%` |
| `pulp-hc` | Pulp HC | AAA light | `#F1EEE7` `42 26% 93%` | `#0A0A0A` `0 0% 4%` | `#3A362D` `42 13% 20%` | `#6E6759` `40 11% 39%` |
| `beta` | Beta | dark, the reversed page | `#0B0B0C` `240 4% 5%` | `#F2F1EC` `50 19% 94%` | `#9A978F` `44 5% 58%` | `#3A3B3E` `225 3% 24%` |
| `beta-hc` | Beta HC | AAA dark | `#050506` `240 9% 2%` | `#FFFFFF` `0 0% 100%` | `#C9C6BE` `44 9% 77%` | `#83858B` `225 3% 53%` |

Band (`--pulp-deep`, the under-type value): `#DEDACF` / `#E0DCD1` / `#17181A` /
`#1B1C1F`.

### Spot Vermilion

`#D93A1E` (`9 76% 48%`) in every rendition, for **marks only** — the
current-entry square, the 2px active border, the focus ring. Measured against
the page it is 3.9–4.4:1: enough for a non-text graphic, not enough for a
0.7rem label. So the spot has a second pull for the rare piece of spot-coloured
*type*, `--spot-ink`, which is the same vermilion at the density each plate
needs:

| rendition | `--spot-ink` | contrast on page |
|-----------|--------------|------------------|
| `pulp` | `#BB260C` `9 88% 39%` | 5.15:1 (AA) |
| `pulp-hc` | `#8A1E09` `12 92% 29%` | 7.72:1 (AAA) |
| `beta` | `#F2603C` `12 87% 59%` | 6.03:1 (AA) |
| `beta-hc` | `#FF8B70` `13 100% 72%` | 9.13:1 (AAA) |

This is a **change from the seed**, which used `#D93A1E` for the "Current" word
and the active tag name. Vermilion fails AA as small text on both a pulp and a
beta ground; the hue is unchanged and the ration is unchanged.

### Measured contrast

| | ink/page | metadata/page | metadata/band | trim/page |
|---|---|---|---|---|
| Pulp | 15.59 | 6.48 | 5.57 | 1.78 |
| Pulp HC | 17.25 | **10.49** | **8.79** | 4.88 |
| Beta | 17.44 | 6.62 | 5.96 | 1.77 |
| Beta HC | 20.37 | **12.06** | **10.20** | 5.54 |

Both HC renditions clear AAA for body **and** metadata, which resolves the open
question from the surface contract: yes, they can — by darkening/lightening
metadata rather than inheriting it. Trim at 1.78 in the two native renditions
is DESIGN's own Trim / Trim Reversed value and applies only to decorative panel
hairlines; the HC renditions raise it past 3:1 for anyone who needs it.

### Named Rules

**The One Ink Rule.** The palette is ink, pulp and a tone scale. Spot Vermilion
is the single exception and is rationed to two appearances per screen.

**The Tone-Not-Fill Rule.** Every intermediate value is a screentone pitch —
never a flat grey and never an opacity. Grey is a printing effect here, not a
colour.

**The Rationed Black Rule.** Solid black fill marks the decisive beat: the
current tier, the archive gate, the 404. **One per viewport-height region.**
Below `768px` the current tier's label drops its fill and keeps only its heavy
rule, because a stacked tier runs several screens tall and a fill that long is
no longer rationed.

**The Under-Type Band Rule.** Tone pitch is for areas carrying no type. Any
band that sits under text uses **Pulp Deep** / **Beta Deep** — a named palette
value, never a pitch and never an opacity.

**The Bleed Is Tone Rule.** The bleeding element uses the 70 pitch, not solid
black.

## Screentone

Real `repeating-radial-gradient` pitches, not images and not opacity. An 8px
square lattice with a dot at every corner and at the centre — a 45° lattice of
pitch 5.66px. Coverage = πr²/32.

```css
.tone-10 { --tone-r: 1.01px; }
.tone-30 { --tone-r: 1.75px; }
.tone-50 { --tone-r: 2.26px; }
.tone-70 { --tone-r: 1.75px; --tone-ink: var(--pulp); --tone-bg: var(--ink); }
```

Two gradient layers at `background-position: 0 0, 4px 4px`, `background-size:
8px 8px`. The 70 plate is the inverted pull — solid ink with 30-pitch pulp dots
knocked out, which is how a 70 actually prints. Because the plate reads
`--tone-ink` / `--tone-bg` from custom properties, one definition serves all
four renditions and inverts correctly on Beta.

The masthead's register strip is an inline `<svg>` with four `<pattern>`
elements at the same radii, filled with `currentColor` so it re-inks per
rendition.

## Typography

**Display / Label:** Zen Kaku Gothic New (500/700/900)
**Body / Narration:** Zen Old Mincho (400/700)

Loaded from Google Fonts as one stylesheet:
`Zen+Kaku+Gothic+New:wght@500;700;900&family=Zen+Old+Mincho:wght@400;700`.

Dialogue and titling are gothic, narration is mincho — the actual manga
convention. Both faces carry full CJK, verified on the Japanese posts: the
`SUDONE をつくった` title sets in real Zen Kaku Gothic New 900 and its prose in
real Zen Old Mincho, with `palt` on.

### Hierarchy

| class | face | size | notes |
|-------|------|------|-------|
| `.t-display` | gothic 900 | `clamp(2.25rem, 6vw, 4rem)` / 1.0 | post titles |
| `.wordmark` | gothic 900 | `clamp(2.1rem, 4.2vw, 3.1rem)` / 0.9 | masthead |
| `.t-1` | gothic 900 | `clamp(1.9rem, 3.6vw, 2.9rem)` | |
| `.t-2` | gothic 900 | `clamp(1.35rem, 2.1vw, 1.75rem)` | |
| `.t-3` | gothic 900 | `clamp(1.05rem, 1.5vw, 1.25rem)` | lead strip cells |
| `.t-4` | gothic 700 | `0.9375rem` | strip cells |
| `prose h2` | gothic 700 | `1.5rem` / 1.15 | in-post |
| `.reading` | mincho 400 | `1.0625rem` / 1.75 | post prose |
| `.narration` | mincho 400 | `0.95rem` / 1.62 | ledes, quotes |
| `.label` | gothic 500 | `0.7rem`, `0.08em`, uppercase | dates, tags, numbers |
| `.num` | gothic 700 | `0.7rem`, tabular | entry numbers |

### Named Rules

**The Gothic-Mincho Rule.** Titles, labels and anything that would be dialogue
are gothic. Anything that would be narration — prose, excerpts, quotes — is
mincho.

**The Measure Rule.** Post prose never exceeds `68ch`. Measured: in Zen Old
Mincho at `1.0625rem`, `1ch` is `10.45px`, so `68ch` computes to **711px**,
about 81 rendered characters per line. Media, code blocks and tables are not
prose and take the panel width instead.

### Two changes from the seed

1. **Code is set in the platform's monospace stack**, not in either brand face.
   Posts carry box-drawing diagrams and column-aligned program output, and a
   proportional face destroys both. No third *webfont* is loaded — the stack is
   `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` — but
   this is an admitted exception to "nothing on the site uses a third family",
   taken because the post is the product.

2. **Neither Zen face contains `ğ`, `ş` or `İ`.** The seed claimed both faces
   would fix the Turkish/Japanese rendering defect; they fix Japanese
   completely and Turkish almost completely. Five Turkish posts substitute
   those three glyphs from the platform. The font stacks therefore name a
   Latin-capable fallback **before** the CJK ones, so Latin gaps resolve to
   Times/Helvetica and CJK gaps still resolve to Hiragino:

   ```css
   --gothic: "Zen Kaku Gothic New", "Helvetica Neue", Arial,
             "Hiragino Kaku Gothic ProN", "Noto Sans JP", system-ui, sans-serif;
   --mincho: "Zen Old Mincho", "Times New Roman", Times,
             "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif;
   ```

### Language and casing

`text-transform: uppercase` follows the element's language, and a Turkish post
sets `<html lang="tr">`, which prints `ARCHİVE` and `MİN`. The site chrome —
masthead, colophon, the post's meta strip, related and prev/next labels — is
therefore marked `lang="en"`. `og:locale` now follows the post language too.

## Layout

The page is a **panel grid**, not a card stack. `--gut` is `0.75rem`
(`0.5rem` below 768px) and is the only whitespace device; every panel carries a
`1px` Trim border. `.trim` is the sheet: `max-width: 1480px`, padded by
`2 × --gut`, with printer's crop marks drawn in the four corners.

**The index** is comp C, the serialised strip, built from the collection at
build time — no count is hard-coded:

- Month tiers for the current year, newest first, with the **tier label set
  vertically in the gutter** (`writing-mode: vertical-rl; text-orientation:
  mixed` — Latin rotates, CJK stays upright).
- **Panel width is reading time**: each strip cell's `flex-grow` is its minute
  count, over `flex-basis: 0`.
- Full tiers are printed until the run carries 24 entries; the remaining months
  of the year **compress** into labelled tone measures.
- **The silence tier** — the signature moment. The longest empty-year run in
  the collection, printed at full width as a 30-pitch plate captioned
  *SEVEN YEARS / NO ENTRIES*. The caption counts **elapsed** time between the
  last entry before the gap and the first entry after it (7), not empty
  calendar years (2019–2024, which is 6).
- Below the fold: the tag index (pitch is frequency, printed count carries what
  four pitches cannot), then the archive gate with the year spine and one solid
  fill.

**The post page** is the exception that proves the grammar: one `.readpanel`,
`max-width: 50rem`, holding a single mincho column. Panel devices return only
for the ruled lede box, blockquote pull quotes, and the related / prev-next
footer. The page's one bleed is the 70-pitch rule under the title, which runs
out through the panel's right trim.

**The ledger** (`/blog`, `/archive`, related) is a ruled table band, not a card:
`№ | date | title | minutes` with tags under, hairline-separated, alternating
Pulp Deep bands, and a full ink inversion on hover.

Responsive: panels restack to a single column below `768px`, preserving
left-to-right, top-to-bottom order. Between `768px` and `1200px` the strip
cell's `min-width` rises from `9.75rem` to `12rem` so a tier wraps rather than
shaving every panel to a column of single words; strip-cell narration is
clipped to six lines with `line-clamp` at every width. Gutters narrow; borders
never thicken.

## Elevation & Depth

**This system has no shadows and no blur.** Depth is a printing illusion here:
tone pitch, panel overlap, and the ink bleed.

**The Flat Ink Rule.** `box-shadow`, `backdrop-filter`, `filter: blur()` and
opacity-based layering are not used anywhere, in any state. Verified against
the built pages: every element resolves to `box-shadow: none`, `filter: none`,
`backdrop-filter: none`. Tailwind's `boxShadow` scale is reduced to `none` and
its `borderRadius` scale to `0px`, so a `rounded-lg` or `shadow-*` class inside
a post body resolves flat; inline `border-radius` inside raw post HTML is
overridden on media in `.reading`.

## Shapes

**Radius is `0`,** including `--radius`, every Tailwind radius step and the
Pagefind UI. Borders are `1px` Trim hairlines, doubling to `2px` for the active
or current panel.

## Do's and Don'ts

### Do:

- **Do** render every intermediate value as a screentone pitch at 10/30/50/70.
- **Do** keep panel borders at `1px` Trim, doubling only for the active panel.
- **Do** set prose in Zen Old Mincho at a hard 68ch measure.
- **Do** keep the whole system zero-JS. The built site emits **no Astro
  JavaScript bundle at all**; the only scripts are four `is:inline` ones — the
  rendition boot, the rendition switch, the `/blog` tag filter, and the
  `/search` Pagefind loader — plus the Cloudflare beacon.
- **Do** preserve raw HTML inside post bodies (images, 11 iframes, 2 videos)
  rendering correctly inside the prose panel: media takes the panel width,
  `pre` and `table` scroll inside their own `overflow-x: auto`.
- **Do** keep four renditions with the two HC modes at AAA.

### Don't:

- **Don't** force right-to-left **reading order**. Vertical tier labels via
  `writing-mode` are correct typography and are encouraged.
- **Don't** expect four pitches to encode a long-tail distribution — floor the
  plate and print the number (`tonePlate()` in `src/lib/display.ts`).
- **Don't** use speech bubbles, cartoon display faces, or halftone-as-wallpaper.
- **Don't** let Spot Vermilion appear more than twice on a screen. This is why
  Pagefind's result highlights are a Pulp Deep band with an ink underline
  rather than a vermilion one — a result page carries twenty of them.
- **Don't** reintroduce glass, blur, the dot-grid field, the tag marquee, or
  hover scale transforms.
- **Don't** exceed one bleeding element per page or one solid-black fill per
  viewport-height region.
- **Don't** add a third type family beyond the documented monospace exception,
  or set prose in the gothic face.

## Known divergence: the cross-repo theme contract

`arda.tr` now publishes contract **v2** with four renditions of its own —
`stock`, `stock-hc`, `microfiche`, `microfiche-hc` — a different palette with a
banded colour scale. This repo ships the Weekly Page renditions instead, per
this document. `scripts/check-theme-contract.mjs` detects that the two id sets
no longer intersect, prints the divergence, and soft-passes; it regains its
teeth automatically if the ids ever line up again.
