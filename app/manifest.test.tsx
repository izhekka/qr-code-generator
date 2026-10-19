import { describe, expect, it } from 'vitest';

import manifest from './manifest';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/lib/seo';

describe('web app manifest', () => {
  const m = manifest();
  it('is installable: fullscreen, named, identity-pinned, palette-themed', () => {
    expect(m.display).toBe('fullscreen');
    expect(m.name).toBe(SITE_TITLE);
    expect(m.short_name).toBe('QR');
    expect(m.description).toBe(SITE_DESCRIPTION);
    expect(m.start_url).toBe('/');
    expect(m.id).toBe('/');
    expect(m.background_color).toBe('#f1f2f6');
    expect(m.theme_color).toBe('#23234f');
  });

  it('provides 192 and 512 icons plus a maskable variant', () => {
    const icons = m.icons ?? [];
    expect(icons).toContainEqual(
      expect.objectContaining({ sizes: '192x192', purpose: 'any' }),
    );
    expect(icons).toContainEqual(
      expect.objectContaining({ sizes: '512x512', purpose: 'any' }),
    );
    expect(icons).toContainEqual(
      expect.objectContaining({ sizes: '512x512', purpose: 'maskable' }),
    );
  });
});