import { describe, expect, it } from 'vitest';
import { network } from '../src/data';
import { matchScore, normalize, search } from '../src/domain/search';

describe('normalize', () => {
  it('drops accents, case and punctuation', () => {
    expect(normalize('  Covisán · Bomba TERPEL ')).toBe('covisan bomba terpel');
  });
});

describe('matchScore', () => {
  it('ranks whole prefix over word prefix over substring', () => {
    const prefix = matchScore('bomba', 'Bomba Los Maracos');
    const word = matchScore('maracos', 'Bomba Los Maracos');
    const sub = matchScore('aracos', 'Bomba Los Maracos');
    expect(prefix).toBeGreaterThan(word);
    expect(word).toBeGreaterThan(sub);
    expect(sub).toBeGreaterThan(0);
  });

  it('requires every token to match', () => {
    expect(matchScore('bomba sikuani', 'Bomba Los Maracos')).toBe(0);
    expect(matchScore('', 'anything')).toBe(0);
  });
});

describe('search', () => {
  it('finds routes by accent-free name and by code', () => {
    expect(search(network, 'covisan')[0]).toMatchObject({ kind: 'route', route: { id: 'covisan' } });
    expect(search(network, 'GRA')[0]).toMatchObject({ kind: 'route', route: { id: 'grama-postobon' } });
  });

  it('finds stops by name and by description', () => {
    const names = search(network, 'terpel').map((r) => (r.kind === 'stop' ? r.stop.id : r.route.id));
    expect(names).toEqual(expect.arrayContaining(['bomba-terpel-covisan', 'bomba-terpel-playa-rica']));
    const byDescription = search(network, 'medicina legal');
    expect(byDescription[0]).toMatchObject({ kind: 'stop', stop: { id: 'semaforo-de-la-morgue' } });
  });

  it('returns nothing for blank or unmatched queries and honours the limit', () => {
    expect(search(network, '   ')).toEqual([]);
    expect(search(network, 'zzzz')).toEqual([]);
    expect(search(network, 'a', 3)).toHaveLength(3);
  });
});
