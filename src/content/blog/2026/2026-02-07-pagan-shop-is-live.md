---
title: "Pagan Shop is live!"
date: "2026-02-07"
excerpt: "The world's first Black Metal distribution channel via SSH. No browser, no tracking, just a terminal and a PayPal link."
tags: ["dev", "go", "ssh", "blackmetal", "linux"]
keywords: "ssh shop, bubbletea, go, stripe vs gumroad, terminal ui"
description: "How I built a headless e-commerce store using Go and SSH, and why I ditched Stripe for raw PayPal links."
author: "Arda Karaduman"
image: "/images/pagan_shop.png"
draft: false
---

**Introducing the world's first black metal fix by SSH!**

Stop clicking buttons in a browser like a mundane mortal. Open your terminal.

```bash
ssh shop.pagan.tr
```

![Pagan Shop TUI](/images/pagan_shop.png)

If you see a QR code and a list of CDs, you have entered the **Pagan Shop**. It is a TUI (Terminal User Interface) storefront for my band, written in Go, running on a micro-instance in the cloud. It is stateless, tracker-free, and grim.

## The Inspiration: ThePrimeagen Coffee Shop

I wanted to recreate the feeling of a sketchy underground record store—or perhaps a dark, smoke-filled coffee shop where you trade cash for tapes under the table. The specific visual inspiration came from [ThePrimeagen's Coffee Shop](https://www.terminal.shop/) aesthetic: a lo-fi, retro-futuristic refuge where the only light comes from the green phosphor of a CRT monitor.

The modern web is bloated. It is full of cookie banners, pop-ups, and "Sign Up with Google" buttons. I wanted none of that. I wanted a space where the user interacts purely through the keyboard. The terminal is the ultimate filter: if you cannot use SSH, you are probably not the target audience for raw black metal demos anyway.

## The Architecture

The stack is simple, efficient, and runs on a Google Cloud `e2-micro` instance (because why pay for idle cycles?):

* **Language:** Go (Golang)
* **SSH Server:** [Charm's Wish](https://github.com/charmbracelet/wish)
* **TUI Framework:** [Bubble Tea](https://github.com/charmbracelet/bubbletea)
* **Deployment:** Docker on Container-Optimized OS

The shop is essentially a single binary that listens on the standard SSH port. (It launched on port 2222 because I was not confident opening 22 to the outside world; I have since built up my courage. Just `ssh shop.pagan.tr` — no `-p` flag.) When you connect, it spins up a tea program, renders the inventory (fetched from a Google Sheet), and waits for your command.

## The Payment Nightmare: A Trilogy of Failure

The code was the easy part. The "Compliance" was the horror story. Here is why the shop works the way it does.

### Attempt 1: Stripe (The Corporate Overlords)

My initial plan was a fully integrated Stripe checkout. I had it all:

* An SSH TUI that generated a Stripe Checkout Link.
* Webhooks listening on port 443 to auto-update inventory.
* Cloudflare proxied DNS for SSL.

**The Dealbreaker:** The Japanese *Act on Specified Commercial Transactions* (Tokushoho).
Stripe Japan demanded that I publicly display my **full home address and phone number** on a web page for the world to see. I am a cynical man, but I am not suicidal. I am not doxxing myself to sell a $5 CD.

### Attempt 2: Gumroad (The almost-savior)

I pivoted to Gumroad. They act as the "Merchant of Record," shielding my address.
**The Problem:** Gumroad has "simplified" their UI to the point of obscurity. Trying to set up a physical product with international shipping rates involved toggling hidden switches in the "Digital" tab and fighting a UI designed for selling eBooks, not physical media. It felt too "Web 2.0" for a terminal shop.

### Attempt 3: PayPal.me (The Old School Way)

I realized I was over-engineering a merch table. How did we do this in the 90s? We put cash in an envelope.
The digital equivalent is **PayPal.me**.

Now, the shop logic is beautifully stupid:

1. You select items in the terminal.
2. The server calculates the total (Price + Shipping).
3. It generates a QR code to `paypal.me/paganband/2500JPY`.
4. You scan, pay, and write your address in the "Note" field.

It relies on the honor system. It is manual. It is perfect.

## The Comparison

| Feature | Stripe | Gumroad | PayPal.me (Current) |
| --- | --- | --- | --- |
| **Code Complexity** | High (Webhooks, SDKs, Secrets) | Medium (API Calls) | **Low** (String concatenation) |
| **Privacy** | Zero (Must publish home address) | High (Merchant of Record) | **Medium** (Band name on receipt) |
| **Vibe** | Corporate | Tech Bro | **Distro / Mail Order** |
| **Fees** | ~3.6% | ~10% | ~3.6% + Flat Fee |

## Security: The Fortress of Solitude

We removed the "Mullet" configuration (Cloudflare Proxy in front, SSH in back) entirely. Since we ditched webhooks, we no longer need to listen on Port 443 or 80.

The security model is now laughably simple:

Cloudflare: A single A-record for shop set to DNS Only (Grey Cloud). No proxying, just IP resolution.

Firewall: The GCP firewall blocks everything except TCP port 22.

The Container: Runs in isolation. It doesn't know about the web. It doesn't serve HTML. It only speaks SSH.

## Final Comments

This project started as a complex e-commerce platform and ended as a glorified calculator that prints QR codes. And honestly? It is better this way.

It is a reminder that sometimes the best software solution is to delete code, not write more of it.

**Support the underground.**
`ssh shop.pagan.tr`
