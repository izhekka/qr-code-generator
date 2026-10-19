import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { GUIDES } from './guides';

const swSource = readFileSync(join(process.cwd(), 'public', 'sw.js'), 'utf8');

describe('service worker precache sync', () => {
  it('precaches both app pages and the guides index', () => {
    for (const route of ['/', '/builder-static', '/guides']) {
      expect(swSource).toContain(`'${route}'`);
    }
  });

  it('precaches every published guide', () => {
    for (const guide of GUIDES) {
      expect(swSource).toContain(`'/guides/${guide.slug}'`);
    }
  });

  it('keeps API/auth routes outside the offline cache', () => {
    expect(swSource).toContain("'api/'");
  });
});