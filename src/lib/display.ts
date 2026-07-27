/** Link target for a tag: the blog listing deep-linked to that tag's filter. */
export function tagHref(tag: string): string {
  return `/blog?tag=${encodeURIComponent(tag)}`;
}

/** Estimated reading time in whole minutes (~220 wpm, min 1). */
export function readingTimeMinutes(body: string | undefined): number {
  const words = (body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Ledger number for a post: its 1-based position in chronological order,
 * formatted like "№042". `index` is the position in a newest-first list. */
export function ledgerNo(index: number, total: number): string {
  return `№${String(total - index).padStart(3, '0')}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateShort(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "Jul 2026" — the tier label. */
export function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** "2026-07" — the tier key. */
export function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

/** "22" — the day, zero-padded, for the strip cell's date stamp. */
export function dayStamp(date: Date): string {
  return date.toISOString().slice(8, 10);
}

/**
 * The screentone plate for a count.
 *
 * Four pitches cannot encode a long-tail distribution — `dev` 42, `legacy` 23
 * and `ai` 22 all land on the 70 plate — so the plate is floored and the
 * printed count carries the difference. DESIGN.md, "Don't expect four pitches
 * to encode a long-tail distribution".
 */
export function tonePlate(count: number, max: number): 'tone-10' | 'tone-30' | 'tone-50' | 'tone-70' {
  if (max <= 0) return 'tone-10';
  const share = count / max;
  if (share >= 0.5) return 'tone-70';
  if (share >= 0.25) return 'tone-50';
  if (share >= 0.1) return 'tone-30';
  return 'tone-10';
}
