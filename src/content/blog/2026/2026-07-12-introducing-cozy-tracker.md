---
title: "Introducing cozy-tracker: adaptive game music from a deaf composer"
date: "2026-07-12"
excerpt: "I wanted game music that reacts to gameplay without shipping a 30 MB stem rig. So Claude and I built cozy-tracker in a day: an LLM that composes Impulse Tracker modules from JSON, lints its own harmony, and ships adaptive scores your game drives with two calls. The composer can't hear a single note it writes."
tags: ["music", "ai", "dev"]
keywords: "cozy-tracker, tracker music, Impulse Tracker, IT module, adaptive game music, LLM music generation, libopenmpt, chiptune, demoscene, Claude, AKWF, Drozerix, Saga Musix, godot, game audio, vertical layering, horizontal resequencing"
description: "cozy-tracker is an AI-assisted music pipeline that composes Impulse Tracker modules, verifies them with a harmony linter, and ships adaptive scores games control in real time. Built in a day with Claude; every sample public domain."
author: "Arda Karaduman"
image: "/images/og/2026-07-12-introducing-cozy-tracker.webp"
draft: false
---

I make music with AI two ways already. [Suno covers my old demo tapes](/blog/2025-11-14-suno-stuff) and powers [The Seventh Shadow](/blog/2025-12-10-introducing-the-seventh-shadow), and the output is glorious — but it's a rendered WAV. A frozen block of audio. You can't reach into it, can't mute the drums, can't ask it to calm down when the player leaves combat. And as I wrote in [Why AI Can't Make Black Metal](/blog/2026-02-01-why-ai-cant-make-black-metal), generative audio thrives exactly where music is rigid and structured.

You know what else is rigid and structured? A tracker module.

So yesterday I pointed Claude at a different target: not audio, *notation*. The result is **cozy-tracker** — an LLM that composes Impulse Tracker modules, checks its own work, and ships music your game can actually drive.

- **Live:** [tracker.coze.org](https://tracker.coze.org) — jukebox on the landing page, a full browser tracker at [/player](https://tracker.coze.org/player/)
- **Repo:** [github.com/c0ze/cozy-tracker](https://github.com/c0ze/cozy-tracker)

## Why trackers, of all things

Game music has a problem audio files can't solve: the game *changes* and the music doesn't. The industry answer is stem mixing — export five WAV layers, crossfade between them, ship 30 MB per track and an audio middleware license. It works, but it's heavy, and the transitions are still just fades between fixed mixes.

Trackers solved this in 1987 and nobody told the middleware vendors. A module isn't audio — it's *sheet music plus the instruments*: patterns of notes, an order list, samples, all in one file measured in kilobytes. Which means:

- **Every instrument is a channel.** Intensity control is just muting layers — sample-accurate, free, no crossfades. Exploration keeps the pad and bass; combat unmutes the drums and lead.
- **The order list is a map.** Named sections with musical jump points. "Go to the boss theme at the next bar" is one seek call, not an audio splice.
- **It's data.** Diffable, versionable, seedable, generatable.

That last point is the whole project. An LLM can't hear, but it doesn't need to — a module is text-shaped all the way down. Claude writes songs as JSON (notes, volumes, effects, sample definitions), a compiler emits a standard `.it` file, and [libopenmpt](https://lib.openmpt.org/) plays it bit-identically in the browser, in Godot, anywhere. My composer is deaf. It ships anyway.

## The deaf composer needs a linter

How does a composer that can't hear avoid writing garbage? The honest answer from day one: it didn't. The first tracks were *busy* — too many things happening at once. And Claude kept making a mistake only a deaf composer would make: it placed a note, moved on, and forgot the note was still ringing. Tracker samples sustain until you explicitly end them. Three patterns later something else lands a semitone away from that forgotten drone and the whole section curdles.

I told it exactly that: *a note does not only exist where it begins.* And because Claude's failure modes are systematic, the fix could be too — it wrote itself a **harmony linter**. The tool simulates every note's actual lifetime (looped samples ring forever, drum hits decay) and flags forgotten sustains, register clashes between simultaneously-ringing notes, and overcrowding. Its own early songs scored between 73 and 158 warnings. The first track composed under the new rules — a laid-back groove called *Night Bus* — scored zero.

The rules themselves came from the masters. Claude ran pattern-level dissections of public-domain modules by **Drozerix** — a tracker artist who released his whole catalogue freely — and pulled out concrete recipes: swap, don't stack (a lead may only *replace* the chords, never pile on top); write the death of every sustained note at composition time; one octave band per role with a buffer octave between. The studies live [in the repo](https://github.com/c0ze/cozy-tracker/blob/main/docs/corpus-studies.md) and read like a little composition textbook extracted from hex dumps.

## The part I actually wanted: adaptive scores

Every song can declare its layers and sections, and the compiler emits a manifest next to the module. A tiny runtime — web today, Godot wrapper in the repo — gives your game exactly two calls:

```js
const music = await CozyAdaptive.create('level1.it', 'level1.cozy.json');
music.setIntensity(0.7);                          // layers drop in and out, live
music.transitionTo('combat', { via: 'bridge' });  // jump at the next musical boundary
```

And the bit I'm proudest of: **bridging between songs**. Combat music and exploration music are different songs — different key, different tempo. Claude composed a bridge that walks one into the other (an E pedal resolving into A minor while the clock ramps 150 → 112 BPM), and a merge tool welds both songs plus the bridge into a *single* module that carries its own tempo stamps. One file, one call, and the score crosses between songs musically instead of fading. There's a live demo of exactly this on [the landing page](https://tracker.coze.org) — press ⚔️, then 🌙.

## How it's different from every tracker out there

It isn't trying to be a tracker, really. OpenMPT, Schism, and the excellent web-based editors are *instruments* — you sit at the keyboard and play them. cozy-tracker is a **compiler and a runtime**: you describe the mood, it emits verified notation, and the deliverable isn't a song file — it's a score object with an API. The browser tracker it ships (pattern view, per-channel solo/mute, piano-key editing with audition) exists so I can inspect and nudge what the machine wrote, not to compete with 30 years of editor polish. If I want deep manual edits, the `.it` opens in Schism like any other module. Both worlds keep working; the LLM just moved in between them.

## Standing on public-domain shoulders

None of this works without people who gave their work away properly. Credit where it's due:

- **[Drozerix](https://modarchive.org/index.php?request=view_profile&query=84702)** — 77 public-domain modules with an explicit "use my music in whatever" grant. The corpus that taught the composer its manners.
- **[AKWF — Adventure Kid Waveforms](https://github.com/KristofferKarlAxelEkstrand/AKWF-FREE)** by Kristoffer Ekstrand — ~4,000 public-domain single-cycle waveforms. The melodic backbone of every track.
- **[Saga Musix's free sample packs](https://sagamusix.de/en/samples/)** — the drums, free for any use, credits appreciated. Here they are.
- **[libopenmpt](https://lib.openmpt.org/)** (BSD) / **[chiptune3](https://github.com/DrSnuggles/chiptune)** (MIT) for playback, **[itwriter](https://github.com/chr15m/itwriter)** by chr15m (MIT) for the IT writing core, **[godot-openmpt](https://github.com/Dudejoe870/godot-openmpt)** (MIT) under the Godot runtime, and **[The Mod Archive](https://modarchive.org/)** for keeping the culture alive and downloadable.

Every sample that ships traces to a public-domain or free-use source in a provenance ledger, because a "PD" module with ripped samples is a landmine, and I'd rather my game music be boring and clean than cool and subpoenaed.

## Honest limits

The songs are competent, not transcendent — chip music by a diligent student of Drozerix, improving as the linter and the corpus studies compound. The writer only does sample-mode IT so far (no instrument envelopes yet). The Godot wrapper is API-verified against the extension's source but hasn't been battle-tested in a real project. And the bridge generation is design-time — the dream of a runtime agent scoring transitions live is still a dream. Also, everything above — research, tooling, five songs, the site, the runtimes — happened in one day with Claude, which should tell you something about both how far this stack has come and how much polish is surely still missing.

But my games are about to have soundtracks that answer to the game loop, in files smaller than a screenshot, from a composer that works nights and never hears a note.

👉 **[tracker.coze.org](https://tracker.coze.org)** · **[github.com/c0ze/cozy-tracker](https://github.com/c0ze/cozy-tracker)**
