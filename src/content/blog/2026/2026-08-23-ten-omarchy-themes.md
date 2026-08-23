---
title: "Ten Omarchy themes, and not one colour picked by hand"
date: "2026-08-23"
excerpt: "I built Omarchy themes for my studio, my game and my band — every palette read out of that project's own source rather than eyeballed. Then the wallpapers started animating, and then things started going wrong in ways worth writing down."
tags: ["dev", "linux", "omarchy", "hyprland", "design", "pagan"]
keywords: "omarchy themes, hyprland theme, quickshell plugin, wallpaper, colour palette, contrast ratio, wayland, linux ricing, commit game, pagan"
description: "Ten Omarchy themes generated from their own projects' source: palettes from CSS tokens and palette.gd, wallpapers and terminal art built by script, and an animated backdrop plugin that drifts, spins or sweeps depending on the family."
author: "Arda Karaduman"
image: "/images/og/2026-08-23-ten-omarchy-themes.png"
draft: false
---

Yesterday I [moved Hyprland in next to Plasma](/blog/2026-08-22-omarchy-lite-on-cachyos) and spent the day discovering which of Omarchy's opinions I actually wanted. The bar, the bindings, the menus: keepers. The tokyo-night theme it boots into: fine, but not mine.

So the obvious next thing. I run a software studio, I ship a game, and I have played in a black metal band since 1995. Three visual identities I already own, sitting right there. Why is my desktop wearing someone else's?

The rule I set was the only interesting part of this: **no colour gets picked by eye.** Every palette has to be read out of the thing it comes from.

## Palettes I Did Not Pick

This turned out to be easier than expected, because past me had already done the work.

[gand.tr](https://gand.tr) defines its whole look as CSS custom properties, three themes deep — a dark one, a warm "aged manuscript by firelight" default, and a light vellum. Those are literally `--background`, `--accent-primary`, `--accent-secondary`. Convert the hexes, done.

[pagan.tr](https://pagan.tr) does the same in HSL, and it defines exactly two themes, so the band gets exactly two themes. No decision to make.

**Commit!!!** was the best of the three. The game ships `game/theme/palette.gd`, a single file every UI colour flows through, with the WCAG ratios worked out *in the comments*. Commit Late Night is that file verbatim — not an interpretation of the game's look, the game's look. When I measured my generated wallpaper and got 5.95:1 for the dim foreground, the comment in `palette.gd` claimed 5.95:1. That was a good moment.

The naming came from the sources too. Gand and Pagan use their sites' own theme names. Commit uses **Commit Slots** — Late Night, Evening, Morning — because that is the mechanic the entire game runs on, four slots a day, and late-night commits produce more output at the cost of everything else. It would have been perverse to call them "dark" and "light".

| Family | Source | Themes |
|---|---|---|
| Gand | gand.tr | Dark · Earth · Light |
| Commit!!! | commit.gand.tr | Late Night · Evening · Morning |
| Pagan | pagan.tr | Dark · Light |
| Pagan Old | the pre-2019 sigil | Dark · Light |

## Everything Is Generated

A theme in Omarchy is more than sixteen colours. There are wallpapers, a logo for the About panel, a panel for the screensaver, a Plymouth boot logo, a neovim colorscheme, a VS Code mapping. I did not want to draw any of that twice, so all of it comes out of scripts that read the original artwork.

That immediately ran into the problem that logos are not made for terminals.

**Gand's mark** is fine gold linework on cream. Downscale it to a braille grid and it dithers into speckle. The fix was to lift only the solid serif *G* out by connected-component extraction, morphologically close the engraved texture out of it, and redraw the celestial ring around it as vectors.

**Commit's icon** is 256px pixel art — a commit node with an amber exclamation mark through it. Upscaling pixel art turns it to mush, so that got redrawn as vectors too.

**Pagan's 2019 sigil** was the interesting one: an inverted pentagram in a ring, hand-drawn in roughly 15px hairlines on a 3307px canvas. At terminal scale that is a 30× reduction, which puts every stroke at half a pixel and dithers the entire thing away to nothing. My first attempt produced a field of scattered dots. It needed the alpha dilated *before* transcoding, solving for the radius that lands a stroke at about two output pixels — and padding first, because dilating a mask cropped to its own bounding box clips the ring right off the edge.

Everything is deterministic. Re-run any generator and you get the committed file back byte for byte, which I check, because a generator that drifts is just a slower way of drawing by hand.

## The Contrast Lesson

Here is the one I would not have predicted, and it cost me two rounds of being wrong in public.

I set every mark to the same target alpha over its wallpaper. On the dark themes it looked great. On the light themes the logo was **invisible** — and I mean measurably: gand-light's sigil came out at 1.16:1 against its ground.

Same alpha. Completely different read. Lifting a near-black ground moves the luminance ratio a very long way; darkening a near-white one barely moves it at all. So the generators stopped taking an alpha and started taking a *target contrast ratio*, binary-searching the alpha that lands it.

I then made the same mistake one level up. Having matched the ratios, Pagan Dark was still hard to see, and I said so with numbers — 3.0:1, stable, fine. It was not fine. **A ratio is not a read.** Light puts a dark mark at 105 on a 200 ground, a wide absolute separation; dark was putting a mid-grey at 139 on 62, and the fog I had just added lifted that ground from 37, halving the gap. Dark now asks for 6.5:1 where light asks for 3.4:1, deliberately asymmetric, and the mark goes near-white.

Both times the person looking at the screen was right and my measurement was wrong. Both times the measurement was of the file, not of the screen.

## The Backdrop Has To Move

pagan.tr has a fog animation. Once you have seen the wallpaper sitting still under a website that drifts, the wallpaper looks broken.

Omarchy's background renderer is a Quickshell plugin, which means QML, which means animation is available. The tempting move is to clone it and add fog. I did that, looked at it, and backed it out — forking the background renderer means re-forking it after every Omarchy update, and a mistake in there is a black desktop. Instead the animation is its own plugin drawing its own surface on `WlrLayer.Bottom`: above the wallpaper, below your windows, masked to an empty input region so clicks fall straight through. The stock renderer stays untouched.

A theme opts in by shipping a `backdrop/` directory. Three kinds of motion, one per family, and each one comes from the source rather than from a menu of effects:

- **drift** — Pagan's fog, ported from the site's own `fog.css`, using the site's own plates. Movement and opacity run on deliberately unrelated periods, 15s and 13s against 10s and 21s. That beat is what makes it read as swirling instead of sliding.
- **spin** — Gand's orrery. The mark is an astronomical device, so three celestial rings turn around it at seven, five and nine minutes per revolution, the middle one against the other two.
- **sweep** — Commit's Pulse cursor. `pulse_screen.gd` describes the game's core interaction as "a cursor ping-pongs across a colored bar", so it ping-pongs, and the plate shares the wallpaper's geometry so it tracks the actual bar rather than floating near it.

It costs 0.0% CPU while the desktop is covered, because Hyprland stops sending frame callbacks to an occluded surface and the animation simply stops.

## Where It Fought Back

**The wallpaper kept eating the logo.** Three separate times I was told the logo was invisible, and three times I went looking for a rendering bug. The actual answer was in `omarchy-theme-set`: setting a theme picks the background *after* the currently linked one, and falls back to the first only when nothing matches. Every theme's wallpapers resolve to the same path, so while sibling themes shared basenames, switching dark→light always advanced one step — onto a wallpaper with no mark on it. Wallpaper filenames now carry the theme, nothing matches across themes, and a switch lands on the mark every time.

**My installer was shadowing its own hook.** I had it back up the theme-set hook before replacing it. `omarchy-hook` runs *every file* in `theme-set.d/`. Nine timestamped copies had been quietly executing after the live one on every theme change, each re-applying its own older routing. Harmless while they were identical; invisible right up until the routing changed, at which point a new theme family kept resolving to the wrong branding and the hook worked perfectly when I ran it by hand.

**QML claims properties you did not know it claimed.** A `NumberAnimation on x` takes the property over as a value source *even while stopped*, destroying any binding on it — which silently broke the centring of the spinning rings. And two animations cannot both drive one property; the second just wins.

**Escaped quotes inside a QML string collapse.** `jq -r ".profile // \"fog\""` became `jq -r .profile // fog`, which is not a filter, so it errored and fell back to the default on every single read. Everything looked like it worked. Pass jq a bare filter and stop trying to quote it.

## See It Move

Three and a half minutes, every theme for fifteen seconds, with each family's About panel and screensaver:

<div class="aspect-video my-8">
  <iframe
    class="w-full h-full rounded-lg shadow-lg"
    src="https://www.youtube.com/embed/2rXn40bUuC8"
    title="Ten Omarchy themes"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen
  ></iframe>
</div>

Recording it was its own small adventure. `omarchy screenrecord` wants `gpu-screen-recorder`, which is not installed here, so the capture is `grim` measured at 16.5fps on a 4K screen, piped frame by frame straight into ffmpeg — nothing buffered, because three thousand uncompressed 4K frames would have filled a tmpfs.

## What I Learned

> Measuring the file is not measuring the screen. I had a way to look at the actual desktop the entire time and talked myself out of using it, twice, because a number told me things were fine.

The palettes were the easy part, and the reason they were easy is that all three projects had already written their colours down somewhere a script could read. The taste was decided years ago; this was just plumbing it into a different renderer.

Everything is on GitHub — themes, wallpapers, terminal art, the backdrop plugin, and the generators that build all of it: [c0ze/omarchy-themes](https://github.com/c0ze/omarchy-themes). If you run Omarchy, `install.sh` takes a family name and leaves the rest alone.

And if you want the band that the fog came from, [Pagan has been at this since 1995](/blog/2026-02-07-pagan-shop-is-live) — I have [opinions about what AI can and cannot do to that genre](/blog/2026-02-01-why-ai-cant-make-black-metal), but it turns out it can absolutely be trusted to hold a pentagram the right way up. Or rather, the right way down, on the second attempt.
