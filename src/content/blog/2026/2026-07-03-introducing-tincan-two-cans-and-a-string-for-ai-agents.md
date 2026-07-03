---
title: "Introducing tincan: two cans and a string for AI agents"
date: "2026-07-03"
excerpt: "I was copy-pasting messages between Claude and Codex like a noob, then upgraded to PR comments, which still needed me to kick every review. So I built tincan: a tiny Go CLI that lets coding agents from different vendors message each other through a filesystem spool, at near-zero token cost while idle. Built in one day — and the agents reviewed the code, wrote the docs, and drew the logo themselves, over tincan."
tags: ["ai", "dev", "go", "agents"]
keywords: "tincan, ai agents, agent to agent communication, claude code, codex, antigravity, multi-agent, message passing, filesystem spool, go cli, zero token idle, agent orchestration, skills"
description: "tincan is a local, cross-platform message-passing CLI for AI coding agents — Claude Code, Codex, Antigravity — over a filesystem spool. No daemon, no polling, near-zero tokens while idle. How it works, how it was built in a day, and what the agents did to each other's code along the way."
author: "Arda Karaduman"
image: "/images/og/2026-07-03-introducing-tincan-two-cans-and-a-string-for-ai-agents.webp"
draft: false
---

I run several coding agents. Claude Code does most of the heavy lifting, Codex is my reviewer of choice, and Antigravity earns its keep [when it isn't corrupting my files](/blog/2025-11-30-antigravity-blues). The problem: they can't talk to each other. For months my workflow for "have the other model look at this" was copy-paste. Like every noob.

Then I got fancy and upgraded to pull requests: one agent writes the code, another reviews it and leaves comments. Better — but every step still needed me as the messenger pigeon. "Go review this PR." "Handle the comments." I tried loops and scheduled jobs that poll GitHub every fifteen minutes, and they burned tokens doing absolutely nothing. Most of the polls found no comments. All of them paid full price for the privilege of checking.

If [Reliquary](/blog/2026-06-03-introducing-reliquary-one-memory-for-every-ai) was me giving my assistants one shared memory instead of four leaky buckets, this is the other half of the problem: they still couldn't *talk*. So I built **tincan** — two cans and a string, for AIs.

- **Repo:** [github.com/c0ze/tincan](https://github.com/c0ze/tincan)
- **Release:** [v0.1.0](https://github.com/c0ze/tincan/releases) — binaries for Linux, macOS, and Windows

## The trick: blocking is free

The insight that makes the whole thing work: when an agent runs a shell command that *blocks*, the model is suspended waiting for the tool result. It burns **zero tokens** while blocked. So you don't poll — you park.

A listener agent runs `tincan recv`, which blocks until a message file appears in its inbox. Idle costs nothing. When a message lands, the command returns instantly — fsnotify wakes it, not a timer — and the agent handles the task, replies, and parks again. The only real cost is one cheap turn every ~5 minutes to re-arm under the harness's command-duration cap, and one turn per actual message. Compare that to a reasoning-heavy GitHub poll every fifteen minutes that usually finds nothing.

My first instinct was Unix sockets — it even felt "natural". It was wrong in an instructive way. Sockets need both ends alive at once, keep no history, and are a mess on Windows. What I actually wanted was a **maildir-style spool**: sending atomically renames a JSON file into `<repo>/.tincan/inbox/<name>/`, receiving claims the oldest file by renaming it out. Queueing is free (files just wait), crashes lose nothing, and there is no daemon to babysit. The whole "server" is a directory.

## What it looks like

One agent (say Codex) parks as a listener. In Claude Code that's the `/listen` skill; Codex discovers the same skill file natively and you just type `listen`.

The orchestrator side is a one-liner:

```bash
tincan ask --to codex --from orch --body "review the diff on current branch"
```

`ask` mints an ephemeral reply channel, sends the request, and blocks — token-free — until the answer comes back. Or it runs in the background while the orchestrator keeps working, and fan-out falls out naturally: fire three `ask`s at three agents in parallel, each waits on its own channel, replies can't cross, and you integrate them as they land. Exit codes are the contract (`0` ok, `3` timeout, never confused), bodies carry instructions, and big outputs travel as files in the repo with the message holding just a pointer.

There's deliberately **no message store**. Messages are consumed on delivery; the agents' own chat transcripts are the record. I refuse to run a database so that two processes on the same laptop can pass notes.

## Built in a day, by the workers it connects

Here's where it gets fun. I designed this with Claude in the morning; Claude subagents built it task-by-task with TDD and two-stage reviews. A reviewer caught a genuinely nasty macOS kqueue race before lunch. By early afternoon the tool worked, so I did the obvious thing: started Codex and Antigravity as listeners *and pointed tincan at itself*.

Codex reviewed the Go internals — over tincan — and found a path-traversal hole (`--to ../../escape` walked right out of the spool) that three rounds of same-model review had missed. Different vendor, different blind spots; this is exactly why I wanted cross-model workflows in the first place. Antigravity reviewed the docs as the freshest possible user — an agent that had just onboarded cold — and its best finding was one only a fresh agent could make: the listen loop must be an *agent-level* loop, not a shell `while true`, because a shell loop can't hand the task back to the model's reasoning context.

Then each agent documented its own runtime (the one thing the other two could only guess at), fixing my wrong guesses about their approval flags from lived experience. And because no project is real without a logo, I ran a design contest over the wire: Codex with GPT-Image against Antigravity with Nano Banana Pro, same brief, deliverables dropped in the repo, replies with artifact pointers. Codex won — its banner is this post's OG image, drawn by one of the agents the tool connects. Both entries are [in the repo](https://github.com/c0ze/tincan/tree/main/assets); the loser was informed via `tincan send`.

Somewhere along the way the per-agent integration problem dissolved: Claude's `SKILL.md` format turned out to be a lingua franca. Codex reads it from the workspace natively, Antigravity picks it up via an `.agents/skills` symlink. One skill file, three vendors, no adapters.

## The hard part was Windows

I'll be honest about where the confidence ran out. Everything above passed race-detector stress tests on my Mac all day. Then I set up CI for the release, and the first-ever Windows run failed in a way that dismantled a core assumption: **claim-by-rename is not atomic-exclusive on Windows.** Renames there are handle-based — two racing receivers can *both* "successfully" rename the same file, and the loser is left holding a path to nothing. Then round two: kqueue on the CI runners threw errors my errno-tolerance was too narrow for. Round three: Windows sharing violations from in-flight handles.

Three CI rounds, three platform-specific filesystem behaviors, none reachable from my laptop. The fix that survived is more principled than what I started with — ownership is decided by who successfully *consumes* the claim file, watcher trouble degrades to polling instead of dying, and "pure Go, works everywhere" is now a tested claim on three OSes instead of a reasoned one. If you take one thing from this section: your concurrency model is only as portable as your CI matrix.

## Honest limits

Idle isn't literally zero — each re-arm is a turn, just a trivial one. There's no gc yet, so a timed-out request leaves a stray reply-channel directory until Phase 2. And the trust model is blunt: an auto-approving listener executes whatever lands in its inbox, which is fine when everything writing to that directory is you, on your machine — think before widening that boundary. Single machine only, by design; the moment I want networking I'll have re-invented a message queue with extra steps, and I'd rather not.

It's young. But it already changed how I work: today the fifteen-minute GitHub polls are gone, and "get a second opinion from a different vendor's model" is a one-line command that costs nothing while it waits.

Two cans. One string. No daemon.

👉 **[github.com/c0ze/tincan](https://github.com/c0ze/tincan)**
