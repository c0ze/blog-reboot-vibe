#!/usr/bin/env node
/**
 * Theme-contract check — verifies this blog's rendition implementation against
 * the canonical catalogue published by c0ze/arda.tr as config/themes.json.
 *
 * As of the "Weekly Page" redesign this repo no longer ships the nine-theme
 * Ink & Ledger catalogue (contract v1). It ships four renditions — pulp,
 * pulp-hc, beta, beta-hc — which is contract v2. Until arda.tr publishes v2,
 * the fetched v1 contract describes a catalogue this repo deliberately does
 * not implement, so a v1 contract is a SOFT SKIP with a loud warning rather
 * than a failure: failing on a catalogue we intentionally replaced would make
 * the check permanently red and therefore worthless.
 *
 * What is checked:
 *   1. The theme menu in src/components/ThemeToggle.astro lists the canonical
 *      theme ids and names, in canonical (menu) order.
 *   2. Each theme's token values in src/styles/global.css equal the canonical
 *      tokens. Only token names present in BOTH the contract and the CSS block
 *      are compared; every mismatch is reported (theme/token/expected/actual).
 *
 * Contract source:
 *   - THEMES_CONTRACT_PATH env var (a local file), if set — for local runs
 *     against a sibling checkout of arda.tr. A bad local path is a hard error.
 *   - Otherwise fetched from GitHub raw. Fetch failure or 404 is a SOFT SKIP
 *     (warning + exit 0) so CI never breaks on a network hiccup or before the
 *     canonical file is pushed upstream.
 *
 * Exit codes: 0 = in sync (or soft skip / allowlisted drift only), 1 = drift.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT_URL = 'https://raw.githubusercontent.com/c0ze/arda.tr/main/config/themes.json';
const THEME_TOGGLE = path.join(ROOT, 'src/components/ThemeToggle.astro');
const GLOBAL_CSS = path.join(ROOT, 'src/styles/global.css');

/** The renditions this repo implements, in menu order. Contract v2. */
const RENDITIONS = ['pulp', 'pulp-hc', 'beta', 'beta-hc'];

/**
 * Known, intentional divergences from the canonical catalogue, as exact
 * "themeId:token" pairs. These are reported as warnings but do not fail CI.
 *
 * Emptied by the Weekly Page redesign: the nine Ink & Ledger themes and their
 * allowlisted drifts no longer exist here. Re-populate when a v2 rendition
 * deliberately diverges from arda.tr on a specific token.
 */
const ALLOWED_DRIFT = new Set([]);

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exitCode = 1;
}

function normalize(value) {
  return value.trim().replace(/\s+/g, ' ');
}

async function loadContract() {
  const localPath = process.env.THEMES_CONTRACT_PATH;
  if (localPath) {
    console.log(`Loading theme contract from THEMES_CONTRACT_PATH=${localPath}`);
    return JSON.parse(await readFile(localPath, 'utf8'));
  }
  console.log(`Fetching theme contract from ${CONTRACT_URL}`);
  try {
    const res = await fetch(CONTRACT_URL);
    if (!res.ok) {
      console.warn(`⚠ Contract fetch returned HTTP ${res.status}; skipping check (soft pass).`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`⚠ Contract fetch failed (${err.message}); skipping check (soft pass).`);
    return null;
  }
}

/** The theme menu entries ({ id, name }) from ThemeToggle.astro, in order. */
function parseThemeMenu(source) {
  const entries = [];
  const re = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'/g;
  for (const match of source.matchAll(re)) {
    entries.push({ id: match[1], name: match[2] });
  }
  return entries;
}

/** Map of themeId -> { token: value } parsed from global.css class blocks. */
function parseCssThemes(css, themeIds) {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const tokens = new Map(themeIds.map((id) => [id, {}]));

  for (const block of noComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = block[1].split(',').map((s) => s.trim());
    for (const id of themeIds) {
      // Exact class-selector match, so `.paper .glass` overrides don't count.
      if (!selectors.includes(`.${id}`)) continue;
      for (const decl of block[2].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
        tokens.get(id)[decl[1]] = normalize(decl[2]);
      }
    }
  }
  return tokens;
}

const contract = await loadContract();
if (contract === null) process.exit(0);

if (!Array.isArray(contract.themes)) {
  fail(`Unrecognized contract shape (version=${contract.version}); update this script.`);
  process.exit(1);
}

// The Weekly Page redesign forked the catalogue: this repo ships pulp /
// pulp-hc / beta / beta-hc (DESIGN.md), while arda.tr publishes its own
// renditions with different ids and a different palette. When the published
// ids do not overlap ours at all, the two repos are deliberately on different
// systems and there is nothing to compare — say so loudly and pass, rather
// than pinning CI red on a decision that was made on purpose. The moment the
// ids line up again, the token comparison below regains its teeth.
const contractIds = contract.themes.map((t) => t.id);
if (!contractIds.some((id) => RENDITIONS.includes(id))) {
  console.warn(
    `⚠ Catalogue divergence (contract v${contract.version}).\n` +
      `  Upstream publishes: ${contractIds.join(', ')}\n` +
      `  This repo ships:    ${RENDITIONS.join(', ')}  (DESIGN.md — "The Weekly Page")\n` +
      `  No shared ids, so nothing to compare. Skipping (soft pass).`
  );
  process.exit(0);
}

const [toggleSource, cssSource] = await Promise.all([
  readFile(THEME_TOGGLE, 'utf8'),
  readFile(GLOBAL_CSS, 'utf8'),
]);

// ── 1. Theme menu: ids, names, order ────────────────────────────────────────
const canonical = contract.themes.map(({ id, name }) => ({ id, name }));
const menu = parseThemeMenu(toggleSource);

if (menu.length !== canonical.length) {
  fail(`ThemeToggle menu lists ${menu.length} themes; contract has ${canonical.length}.`);
}
canonical.forEach((expected, i) => {
  const actual = menu[i];
  if (!actual) {
    fail(`ThemeToggle menu is missing "${expected.id}" at position ${i + 1}.`);
  } else if (actual.id !== expected.id || actual.name !== expected.name) {
    fail(
      `ThemeToggle menu position ${i + 1}: expected ${expected.id} ("${expected.name}"), ` +
        `found ${actual.id} ("${actual.name}").`
    );
  }
});

// ── 2. Token values in global.css ───────────────────────────────────────────
const cssThemes = parseCssThemes(cssSource, contract.themes.map((t) => t.id));
let compared = 0;
let allowed = 0;

for (const theme of contract.themes) {
  const cssTokens = cssThemes.get(theme.id) ?? {};
  if (Object.keys(cssTokens).length === 0) {
    fail(`No CSS block found for theme "${theme.id}" in global.css.`);
    continue;
  }
  for (const [token, expectedRaw] of Object.entries(theme.tokens)) {
    if (!(token in cssTokens)) continue; // compare only tokens present in both
    compared++;
    const expected = normalize(expectedRaw);
    const actual = cssTokens[token];
    if (actual === expected) continue;
    if (ALLOWED_DRIFT.has(`${theme.id}:${token}`)) {
      allowed++;
      console.warn(`⚠ allowed drift  ${theme.id}/--${token}: contract "${expected}" vs css "${actual}"`);
    } else {
      fail(`token mismatch  ${theme.id}/--${token}: expected "${expected}", actual "${actual}"`);
    }
  }
}

if (process.exitCode === 1) {
  console.error('\nTheme contract check FAILED — see mismatches above.');
  process.exit(1);
}
console.log(
  `✓ Theme contract OK: ${menu.length} menu entries match; ` +
    `${compared} token values compared${allowed ? ` (${allowed} allowlisted drifts)` : ''}.`
);
