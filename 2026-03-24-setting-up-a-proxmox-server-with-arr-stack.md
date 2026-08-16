---
title: "Setting up a Proxmox server with Arr stack"
date: "2026-03-24"
excerpt: "How I turned a retired HP EliteDesk into a Proxmox media server with Arr apps, Plex, Navidrome, XFS storage, and Tailscale."
tags: ["dev", "linux", "proxmox", "plex", "tailscale"]
keywords: "proxmox arr stack, plex lxc, navidrome docker, tailscale media server, qbittorrent hardlinks, xfs media storage"
description: "A practical build log of rebuilding my media stack on Proxmox with separate LXCs for Arr and Plex, Docker for Navidrome, XFS storage, and Tailscale."
author: "Arda Karaduman"
image: "/images/proxmox-arr-og.jpg"
draft: false
---

I have been slowly moving my media life away from improvised Windows boxes, mysterious NAS folders, and one-off service installs that make sense only on the day you create them.

![Setting up a Proxmox server with Arr stack](/images/proxmox-arr-og.jpg)

This week, that turned into a full rebuild.

I took an old HP EliteDesk 800 G4, installed [Proxmox VE 9](https://www.proxmox.com/en/proxmox-virtual-environment/overview) on it, split storage across two [XFS](https://xfs.org/) disks, moved the Arr stack into its own LXC, gave [Plex](https://www.plex.tv/) a separate container with hardware transcoding, and put [Navidrome](https://www.navidrome.org/) into a [Docker](https://www.docker.com/)-focused LXC for music.

The result is not "finished" in the romantic sense. No self-hosted stack ever is. But it has crossed the line from pile-of-tools into a coherent system.

And, more importantly, it now behaves like a system with rules.

## The Goal

The box is called `ripper`, which tells you almost everything about the intended job description.

I wanted one machine to handle:

- media acquisition
- media storage
- Blu-ray ripping
- common file storage

The immediate motivation was simple: the Synology NAS was running out of space, and the "just throw another thing on the NAS" phase had clearly ended.

I also wanted to separate responsibilities more cleanly:

- one place to acquire media
- one place to store it
- one place to serve it
- one place to keep the ugly automation machinery away from the user-facing services

This is part of the same broader self-hosting impulse behind [How I used AI to enhance my home network](/blog/2025-12-18-how-i-used-ai-to-enhance-my-home-network) and [How I used AI to enhance my media consumption](/blog/2025-12-18-how-i-used-ai-to-enhance-my-media-consumption): own the stack, understand the stack, and stop depending on opaque defaults where I do not need to.

## The Host

The hardware is not glamorous:

- HP EliteDesk 800 G4
- Intel i7-8700
- 238.5 GB NVMe for the system
- one roughly 12.7 TB disk
- one roughly 7.3 TB disk

The nice thing about old office desktops is that they are not sexy, but they are usually quiet, cheap, and good enough.

I installed Proxmox VE 9 on Debian `trixie` with a plain LVM layout, not ZFS.

This was a deliberate choice. I did update the host-side ZFS packages because I may want that option later, but I did **not** want to start this project by solving every storage problem I might hypothetically have in six months. For this machine, the workload is mostly large media files, not databases or VM farms. I wanted something boring enough to trust.

That is a recurring theme of this whole build: elegance is nice, but boring is better.

## The Storage Rule That Actually Matters

The most important design decision in this setup was not "Proxmox versus Docker" or "LXC versus VM."

It was this:

> Hardlinks do not work across filesystems, and Arr workflows become stupid if you ignore that.

The two data disks ended up as:

- `MULE` for the main Sonarr/Radarr world
- `DEPOT` for specialty libraries, rips, shared storage, backups, and overflow

Both were rebuilt as XFS.

The layout became:

- `MULE`
  - downloads for TV and movies
  - final TV and movie libraries
- `DEPOT`
  - downloads for music, comics, and other specialty libraries
  - final specialty-library destinations
  - Blu-ray rip workspace
  - shared docs / ISOs / software
  - backups and archive

This matters because [Sonarr](https://sonarr.tv/), [Radarr](https://radarr.video/), [Lidarr](https://lidarr.audio/), and friends get much more efficient when they can hardlink completed downloads into the library instead of copying them. If your download path and library path live on different mounts, that stops working. Then you either double-store everything or start manually cleaning up after the automation that was supposed to save you work in the first place.

That sounds obvious when stated plainly. It becomes much less obvious once you are inside [qBittorrent](https://www.qbittorrent.org/), Arr root folders, category save paths, incomplete download paths, bind mounts, and container path translations.

The final path model inside the media stack LXC was:

- `/data/downloads` and `/data/media` backed by `MULE`
- `/data/depot-downloads` and `/data/depot-media` backed by `DEPOT`
- `/data/rips` and `/data/shared` also backed by `DEPOT`

That one decision cleaned up a lot of future pain.

## The Container Split

I did **not** want one giant all-in-one container doing everything.

The final split looks like this:

### `media-stack` LXC

This container handles the ugly but necessary acquisition layer:

- qBittorrent
- Sonarr
- Radarr
- [Prowlarr](https://prowlarr.com/)
- Lidarr
- [Whisparr](https://github.com/Whisparr/Whisparr)
- [Mylar3](https://mylarcomics.com/)
- [Tailscale](https://tailscale.com/)

This is the machine that talks to indexers, download clients, and the outside world.

### `plex` LXC

Plex got its own container. I wanted it isolated from the automation mess, and I wanted hardware acceleration to be a first-class concern rather than an afterthought.

The Intel iGPU passthrough worked, `vainfo` succeeded against `/dev/dri/renderD128`, and Plex hardware transcoding is available. That alone justified not stuffing it into the same container as everything else.

### Docker-focused LXC

This one currently runs Navidrome.

I could have put Navidrome elsewhere, but separating music playback from the Arr stack made sense. It also fits nicely with the increasingly self-hosted local-music obsession that previously led me to [Scraping Lyrics and Syncing Them with Whisper AI](/blog/2026-01-18-scraping-lyrics-and-syncing-them-via-whisper).

Navidrome reads music from `DEPOT`, and that immediately gave me:

- a clean browser-based music server
- desktop playback via [Feishin](https://github.com/jeffvli/feishin)
- Android playback via [Symfonium](https://symfonium.app/)
- [Last.fm](https://www.last.fm/) scrobbling

In other words: a local music stack that feels less like "files on disk" and more like an actual service.

## What Broke

Quite a lot, naturally.

Not catastrophic breakage. More the usual self-hosting taxonomy of insults:

- hidden filesystem assumptions
- packaging weirdness
- metadata lies
- path mismatches
- a few services behaving as though they had never heard of other services

### The BitLocker Ambush

Two old Windows media disks turned out to be BitLocker-protected after the move away from the previous Windows install.

That is the kind of surprise that immediately ruins the fantasy of a smooth migration.

Linux correctly saw them as BitLocker volumes, not mountable NTFS. I went through the usual recovery effort: image analysis, recovery-string hunting, checking whether any usable key material or `.bek` file survived, seeing whether old auto-unlock state could be recovered.

It could not.

At some point, the rational move is to stop pretending a dead disk is one more clever idea away from being alive. Both drives were wiped and repurposed as XFS.

Painful, but clean.

### The qBittorrent / Hardlink Trap

One of the more subtle problems showed up with Lidarr.

The `lidarr` qBittorrent category was configured correctly to use the `DEPOT` download path, but qBittorrent's **global incomplete path** still lived on `MULE`.

That meant new music downloads could begin life on the wrong filesystem while incomplete, then later confuse the import flow. Once hardlinks are off, this becomes a quiet disk-usage tax. Once hardlinks are on, crossing filesystems becomes impossible.

This was a useful reminder that there are two separate questions:

1. where does the torrent eventually belong?
2. where is it physically sitting during download?

Those are not always the same answer.

### Lidarr and the FLAC + CUE Problem

Single-image FLAC releases with `.cue` sheets turned out to be another irritation.

In principle this is a respectable archival format.

In practice it is a great way to discover which parts of your media stack were designed around normal, per-track files created by sane people.

The working solution was to split the image into per-track FLACs first, then import those. Once the tracks were in normal shape, both Lidarr and Navidrome behaved properly.

### Mylar3 on Debian `trixie`

This was the most annoying packaging bug.

The container is on Python `3.13`. Upstream Mylar3 still imports `imghdr`, which Python removed. So the service broke not because the app was conceptually wrong, but because time continued to pass and Python made a reasonable decision.

The fix was to vendor a pre-removal `imghdr.py` into `/opt/Mylar3/imghdr.py`, using the Python `3.10` stdlib version rather than the `3.12` one.

This is not elegant.

It is, however, the kind of ugly little compatibility shim that gets a service back on its feet in the real world.

## Networking, Privacy, and Tailscale Again

Tailscale showed up here for the same reason it keeps showing up in half my infrastructure: it solves the problem I actually have, not the problem I am pretending to have.

On the media automation side, Tailscale lives **inside** the `media-stack` LXC and routes the container's outbound traffic through a [Mullvad](https://mullvad.net/) exit node while preserving LAN access. That matters because host-level Tailscale would not automatically capture traffic from a bridged LXC.

So the operational effect is:

- local access stays local
- outside traffic from the container exits through Mullvad
- qBittorrent, Prowlarr, Sonarr, Radarr, and other outbound requests all follow that route

Later, when I wanted remote access to Navidrome from the phone, Tailscale won again.

I considered using the [Synology](https://www.synology.com/) reverse proxy and its existing certificate setup, but for personal music streaming that felt like unnecessary public exposure. Since Tailscale was already in the environment, the cleaner answer was simply to use it on the Docker side too and give the client one stable path in.

This is one of the few times where the secure option is also the less annoying option.

## The Playback Side

The user-facing result is now much nicer than the path getting there.

Plex is serving the main media libraries with hardware acceleration.

Navidrome is serving the music library from `DEPOT`, and that part has become surprisingly satisfying. Desktop playback through Feishin works. Android playback through Symfonium works. Last.fm scrobbling works. [ListenBrainz](https://listenbrainz.org/) recommendations are next.

That last part matters more than it sounds.

Self-hosted music stacks often get stuck in the "technically correct but spiritually joyless" phase where yes, the files are there, yes, the metadata mostly works, yes, the web UI exists, but none of it feels good enough to replace the convenience of commercial tools.

This one is crossing that line.

The combination of:

- Lidarr for acquisition
- Navidrome for serving
- Feishin / Symfonium for playback
- external scrobbling and metadata enrichment

is starting to feel like an actual ecosystem instead of a folder with ambition.

## Backup Reality

One operational detail worth calling out: bind mounts make this setup practical, but they also kill snapshot convenience.

The `media-stack` container uses bind mounts for downloads, media, rips, and shared storage. That means Proxmox snapshots are off the table for that container as configured.

So the backup strategy became more honest:

- do not pretend media data is part of container rollback
- back up the container rootfs and config before risky changes
- leave the actual large media stores outside the rollback path

That is less magical than snapshot-everything workflows, but it matches reality better.

And "matches reality better" is one of the few design principles that never ages badly.

## Final State

At the end of the operation, the system looks like this:

- Proxmox host installed and updated
- storage rebuilt on XFS
- clear split between `MULE` and `DEPOT`
- dedicated media automation LXC
- dedicated Plex LXC
- dedicated Docker LXC for Navidrome
- Plex hardware acceleration working
- qBittorrent and Arr apps running
- Tailscale integrated where it actually matters
- Navidrome serving the music library cleanly
- desktop and Android music clients working

There is still cleanup left:

- finish some Prowlarr wiring
- keep validating the download/import/hardlink boundaries
- tighten backup and service-management habits
- define the Blu-ray rip workflow properly

But the important part is done.

The machine now has a shape.

It is no longer "a box with some media software on it." It is an acquisition and storage node with rules, boundaries, and a clear split between automation, playback, and public-facing use.

That may not sound glamorous. It is, however, exactly what I wanted.

And that is usually the point where a self-hosted system becomes worth keeping.
