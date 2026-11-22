import type { Network } from './network';
import type { Route, Stop } from './types';

export type SearchResult = { kind: 'route'; route: Route; score: number } | { kind: 'stop'; stop: Stop; score: number };

/** Lowercases and strips accents so "covisan" matches "Covisán". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Scores how well every query token matches a text.
 * Whole-text prefix > word prefix > substring; every token must match somewhere.
 */
export function matchScore(query: string, text: string): number {
  const tokens = normalize(query).split(' ').filter(Boolean);
  if (tokens.length === 0) return 0;
  const haystack = normalize(text);
  const words = haystack.split(' ');
  let score = 0;
  for (const token of tokens) {
    if (haystack.startsWith(token)) score += 3;
    else if (words.some((w) => w.startsWith(token))) score += 2;
    else if (haystack.includes(token)) score += 1;
    else return 0;
  }
  return score / tokens.length;
}

/** Finds routes (by name or code) and stops (by name, then description). */
export function search(network: Network, query: string, limit = 8): SearchResult[] {
  if (!normalize(query)) return [];
  const results: SearchResult[] = [];
  for (const route of network.routes) {
    const score = Math.max(matchScore(query, route.name), matchScore(query, route.code));
    if (score > 0) results.push({ kind: 'route', route, score: score + 0.5 });
  }
  for (const stop of network.stops) {
    const byName = matchScore(query, stop.name);
    const byDescription = matchScore(query, stop.description) * 0.5;
    const score = Math.max(byName, byDescription);
    if (score > 0) results.push({ kind: 'stop', stop, score });
  }
  const label = (r: SearchResult) => (r.kind === 'route' ? r.route.name : r.stop.name);
  results.sort((a, b) => b.score - a.score || label(a).localeCompare(label(b), 'es'));
  return results.slice(0, limit);
}
