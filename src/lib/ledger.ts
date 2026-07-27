import type { CollectionEntry } from 'astro:content';
import { getPublishedPosts } from '@/lib/posts';
import { ledgerNo, monthKey, monthLabel, readingTimeMinutes } from '@/lib/display';

type Post = CollectionEntry<'blog'>;

/** A post plus everything the printed page needs to set it. */
export interface Entry {
  post: Post;
  slug: string;
  no: string;
  minutes: number;
  date: Date;
}

/** One month of the run: a horizontal tier of panels. */
export interface Tier {
  key: string;
  label: string;
  entries: Entry[];
}

/** A run of years with nothing in it. The silence is the signature moment. */
export interface Gap {
  from: number;
  to: number;
  years: number;
}

export interface YearBar {
  year: number;
  count: number;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface Ledger {
  entries: Entry[];
  total: number;
  firstYear: number;
  lastYear: number;
  latest: Date;
  /** Newest-first months, every month that has entries. */
  tiers: Tier[];
  /** Every year between the first and the last, zeros included. */
  years: YearBar[];
  /** Empty-year runs, longest first. `gaps[0]` is the silence. */
  gaps: Gap[];
  tags: TagCount[];
  tagsUsedOnce: number;
}

function slugOf(post: Post): string {
  return post.id.split('/').pop() ?? post.id;
}

/**
 * The whole ledger, derived once at build time: numbering, month tiers, the
 * year spine, the silence, and the tag frequencies. Every page prints from
 * this so no count is ever hard-coded.
 */
export async function getLedger(): Promise<Ledger> {
  const posts = await getPublishedPosts();
  const total = posts.length;

  const entries: Entry[] = posts.map((post, index) => ({
    post,
    slug: slugOf(post),
    no: ledgerNo(index, total),
    minutes: readingTimeMinutes(post.body),
    date: post.data.date,
  }));

  // Month tiers, newest first.
  const tierMap = new Map<string, Tier>();
  for (const entry of entries) {
    const key = monthKey(entry.date);
    let tier = tierMap.get(key);
    if (!tier) {
      tier = { key, label: monthLabel(entry.date), entries: [] };
      tierMap.set(key, tier);
    }
    tier.entries.push(entry);
  }
  const tiers = [...tierMap.values()];

  // The year spine: every year in range, empty ones included.
  const counts = new Map<number, number>();
  for (const entry of entries) {
    const year = entry.date.getUTCFullYear();
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  const present = [...counts.keys()].sort((a, b) => a - b);
  const firstYear = present[0] ?? new Date().getUTCFullYear();
  const lastYear = present[present.length - 1] ?? firstYear;
  const years: YearBar[] = [];
  for (let year = firstYear; year <= lastYear; year++) {
    years.push({ year, count: counts.get(year) ?? 0 });
  }

  // Empty-year runs. The longest is the silence.
  const gaps: Gap[] = [];
  let start: number | null = null;
  for (const bar of years) {
    if (bar.count === 0) {
      if (start === null) start = bar.year;
    } else if (start !== null) {
      gaps.push({ from: start, to: bar.year - 1, years: bar.year - start });
      start = null;
    }
  }
  if (start !== null) gaps.push({ from: start, to: lastYear, years: lastYear - start + 1 });
  gaps.sort((a, b) => b.years - a.years || b.from - a.from);

  // Tag frequencies.
  const tagMap = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.post.data.tags) tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
  }
  const tags: TagCount[] = [...tagMap.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  return {
    entries,
    total,
    firstYear,
    lastYear,
    latest: entries[0]?.date ?? new Date(),
    tiers,
    years,
    gaps,
    tags,
    tagsUsedOnce: tags.filter((t) => t.count === 1).length,
  };
}

/** Spelled-out small numbers, so the silence caption reads as a caption. */
const WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'eleven', 'twelve',
];

export function spell(n: number): string {
  return WORDS[n] ?? String(n);
}
