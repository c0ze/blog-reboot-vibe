---
title: "Introducing Gage: chess on X, no API"
date: "2026-07-22"
excerpt: "You can't play chess against a rival on X — turn by turn, in public — without the API Twitter priced out of reach. So I built Gage: a browser extension that hides a chessboard inside a reply thread. No backend, no accounts, no database — the thread itself is the game state. Here's the trick, the picture problem, and where the edges still are."
tags: ["dev", "games", "ai", "chess"]
keywords: "gage, chess on twitter, chess on x, play chess on x, browser extension, no twitter api, web intents, threaded replies, cloudflare workers, r2 cache, board games, checkers, reversi, chess.js, mv3 extension, claude code, codex review gate"
description: "Gage is a browser extension that lets you play turn-by-turn chess against a rival on X with no Twitter API: every move is a reply, the reply thread is the game state, and board images cache position-by-position on a Cloudflare Worker. How it works, how it was built, and where the limits are."
author: "Arda Karaduman"
image: "/images/og/2026-07-22-introducing-gage-chess-on-x-with-no-api.webp"
draft: false
---

It started, like a few of my projects do, with an idle question in a chat log: *is there a service where you can play chess against someone on X — turn by turn, right there in the replies?*

There isn't. And the more I looked at *why* not, the more interesting the "not" got.

The obvious way to build it is the way you can't anymore. You'd read the timeline through Twitter's API, watch for your opponent's move, post the reply for them to see, and keep the board in a database somewhere. But the API is gone — or rather it's been priced into a tier meant for companies, not for two people who want to push pawns at each other — and I wasn't going to pay rent to a platform just to play a board game *on* it. **No API.** That's the whole constraint, and it turned out to be a fun one to design against.

**A gage** is the old word for the thing this is named after: a glove thrown down, a pledge of combat. You challenge a rival; they pick it up or they don't. The name isn't chess-specific on purpose — the engine underneath is game-agnostic and checkers and reversi are next — but chess is what shipped first.

## Pick two

Without an API, every design for "play a game on someone else's social network" is stuck choosing two out of three things:

- **Reach** — it happens on X, in public, where your rival already is.
- **No sprawl** — it doesn't vomit forty bot-posts into everyone else's timeline.
- **No install** — nobody has to download anything.

A pure static site gets you no-install and no-sprawl but has zero reach — it can't touch X. A fleet of bots gets you reach and no-install but sprawls all over the timeline (and needs the very API you don't have). I tried to wish my way past this trilemma for a while. You can't. So I gave up "no install" and built the one thing that can quietly read and write the page a human is already looking at: **a browser extension.**

## The trick: the thread is the board

Here's the part I like. Gage has no server that knows about your game. No database of positions, no accounts, no match records. The **reply thread is the game state.**

A challenge is a single post:

```
♟ I challenge @rival to chess #gage #chess [e4]
```

A marker tag so the extension can find it, the game, the rival, and the opening move in brackets. Every move after that is a reply carrying the next move in the same little grammar. To reconstruct the board you don't query anything — you walk the reply chain from the root and replay the moves in order. The thread *is* the move list. X already stores it, orders it, and shows it to both players; I'm just reading the notation back out of it.

The extension wakes up when it sees a `#gage` tweet, rebuilds the position from the visible replies, and drops a small board in the corner of the page. When it's your turn it lets you make a move, which fills a reply box with the move's notation. The opponent's extension sees the new reply land, replays it, and flips the board back to them. It's the same move I used to [light up a static Zork in the browser](/blog/2026-06-18-zork-illuminated): the code can't *ask* X "did a move happen?", so it watches the page and reacts to the reply scrolling past. No polling, no backend, no accounts. Two people and a thread.

## The picture problem

A move tweet should *show* the board, not just read `[Nf3]`. Easy, I thought: render the position to an image on a little page, give it the right Open Graph tags, and let X's card unfurler grab it.

It cannot. X's crawler doesn't run JavaScript — it reads the HTML, sees the meta tags, and leaves. A static page can't draw a per-position board for it; there's nothing to unfurl but an empty template. Machines that won't wait for your code are a recurring villain in these projects.

So the board gets drawn where JavaScript *does* run — inside the extension, on the player's own machine. Right before a move posts, the extension paints the position onto a canvas, letterboxes it into the 1.91:1 shape X's card crop demands (a bare square board loses its top and bottom ranks to the center-crop — I learned that one the embarrassing way, in public), and uploads the PNG to a tiny Cloudflare Worker backed by R2 storage.

The nice bit is the cache key: it's the **position itself**, not the game or the move number. Chess has an enormous but finite set of reachable positions, and transpositions — the same board arrived at by different move orders — collapse to a single key and reuse a single image. The store is first-write-wins: whoever reaches a position first pays to render it, everyone after gets it for free. The Worker holds no game logic and no state; it's a dumb, position-addressed image bucket. The whole thing lives inside free tiers, which was the other quiet constraint — it should cost me nothing to run for two players or two thousand.

## Built by the workers, gated by a reviewer

Almost all of this got built the way [tincan](/blog/2026-07-03-introducing-tincan-two-cans-and-a-string-for-ai-agents) did: Claude subagents doing the labor task-by-task while I steered the decisions, with **Codex wired in as a mandatory review gate** — no chunk of game logic landed until a different vendor's model had tried to break it first.

That gate earned its keep. It caught a threefold-repetition draw the naive state model got wrong, an en-passant capture the board wasn't highlighting, terminal positions you could still click a move onto, and a fistful of races in the code that watches the thread for the opponent's reply. Same lesson I keep [being honest about](/blog/2026-02-03-effects-of-ai-on-productivity): where the models actually help is patience and coverage, not judgement. The architecture and the taste calls were mine; a second, adversarial pair of eyes from a *different* model was worth more than a faster first draft.

## Honest limits

It works — two people can play a full game of chess through X, and I have — but it's young, and I'd rather tell you where the edges are than pretend they aren't.

**You press Reply.** The extension fills the move into a reply box; it does not send it for you. That's deliberate. The moment it auto-posts to your account it becomes a bot, and a game where a bot plays *as you* is a different, worse thing. A gage is thrown by a person. So there's one human click per move, and I've made peace with it.

**It's an unpacked extension.** It isn't on the Chrome Web Store yet, so today it's load-it-yourself from the repo. Store review is its own saga, for another post.

**Mobile is unsolved.** Browser extensions don't exist on the X app or mobile Safari, which is exactly where a lot of this would naturally live. The landing site can *start* a challenge from a phone, but the play loop still wants a desktop browser. I don't have a clean answer yet.

**The flow is still a little clunky** — click the opponent's move, open the panel, make yours, press Reply. It's a duel by correspondence, not a blitz arena, and the pacing honestly suits that. But there are rough corners I'm still sanding down.

## Throw down

The pieces are all public. The extension, the landing site, and the Worker live in one repo, and the on-ramp is up now:

- **Site:** [gage.coze.org](https://gage.coze.org) — pick a game, name your rival, make an opening move, and it hands you a ready-to-post challenge.
- **Source:** [github.com/c0ze/gage.coze.org](https://github.com/c0ze/gage.coze.org)

Chess is only move one. Checkers and reversi are the same core with different rules bolted on, and the transport doesn't care what game rides it — a move is a move is a line in a thread.

Pick two of three. I picked reach and no-sprawl, paid for it with an install, and got a chessboard hiding inside a reply thread. Your move.
