import { describe, expect, it } from 'vitest';
import { buildQrConfig, hex, maxPayloadLength, moduleCount } from './qrConfig';
import { DEFAULT_SETTINGS } from './settings';
import type { Settings } from './types';

describe('hex', () => {
  it('passes valid colors through', () => {
    expect(hex('#aabbcc')).toBe('#aabbcc');
  });
  it('falls back to black for junk', () => {
    expect(hex('zzz')).toBe('#000000');
  });
});

describe('buildQrConfig', () => {
  it('encodes the payload', () => {
    const s = { ...DEFAULT_SETTINGS, content: { ...DEFAULT_SETTINGS.content, link: 'example.com' } };
    expect(buildQrConfig(s).data).toBe('https://example.com');
  });

  it('defaults to error correction M without a logo', () => {
    expect(buildQrConfig(DEFAULT_SETTINGS).qrOptions?.errorCorrectionLevel).toBe('M');
  });

  it('uses error correction H when a logo is set', () => {
    const s = { ...DEFAULT_SETTINGS, logo: { dataUrl: 'data:image/png;base64,AAA', size: 0.4 } };
    const config = buildQrConfig(s);
    expect(config.qrOptions?.errorCorrectionLevel).toBe('H');
  });

  it('leaves the logo to the composition — the library draws no image', () => {
    // the library's image sizing is quantized to odd module counts, which
    // collapses neighboring logo-size stops (20% ≡ 30%, 40% ≡ 50%)
    const withLogo = { ...DEFAULT_SETTINGS, logo: { dataUrl: 'data:image/png;base64,AAA', size: 0.4 } };
    expect(buildQrConfig(withLogo).image).toBeUndefined();
    expect(buildQrConfig(withLogo).imageOptions).toBeUndefined();
  });

  it('emits solid and gradient dot colors', () => {
    const solid = buildQrConfig(DEFAULT_SETTINGS);
    expect(solid.dotsOptions?.type).toBe('square');
    expect(solid.dotsOptions?.gradient).toBeUndefined();
    const gradient = buildQrConfig({ ...DEFAULT_SETTINGS, pattern: { ...DEFAULT_SETTINGS.pattern, gradient: true } });
    expect(gradient.dotsOptions?.gradient).toMatchObject({ type: 'linear' });
  });

  it('renders the QR itself on an always-transparent background', () => {
    // background painting belongs to the composition (canvas rect or sticker
    // interior); the QR's own square background would spill past frame art.
    const transparent = { ...DEFAULT_SETTINGS, pattern: { ...DEFAULT_SETTINGS.pattern, transparentBg: true } };
    expect(buildQrConfig(DEFAULT_SETTINGS).backgroundOptions?.color).toBe('rgba(0,0,0,0)');
    expect(buildQrConfig(transparent).backgroundOptions?.color).toBe('rgba(0,0,0,0)');
  });
});

const settings = (over: (s: Settings) => Settings): Settings =>
  over(structuredClone(DEFAULT_SETTINGS));

const baseContent = { link: '', text: '', email: { to: '', subject: '', body: '' }, phone: '' };

describe('maxPayloadLength', () => {
  it('follows the effective EC level', () => {
    expect(maxPayloadLength(DEFAULT_SETTINGS)).toBe(2331);
    const withLogo = { ...DEFAULT_SETTINGS, logo: { dataUrl: 'data:image/png;base64,AAA', size: 0.4 } };
    expect(maxPayloadLength(withLogo)).toBe(1273);
  });
});

describe('moduleCount renders standard Model 2 matrices', () => {
  /** Standard Model 2: side = 21 + 4·(v−1) for integer version 1..40. */
  const assertModel2Geometry = (count: number) => {
    expect((count - 21) % 4).toBe(0);
    const version = (count - 21) / 4 + 1;
    expect(version).toBeGreaterThanOrEqual(1);
    expect(version).toBeLessThanOrEqual(40);
  };

  it('keeps every content type × EC level inside Model 2 geometry', () => {
    const states: Settings[] = [
      'link', 'text', 'email', 'call',
    ].map(type => settings(s => ({
      ...s,
      content: {
        ...baseContent,
        type: type as Settings['content']['type'],
        ...(type === 'link' ? { link: 'https://example.com' } : {}),
        ...(type === 'text' ? { text: 'Hello QR' } : {}),
        ...(type === 'email' ? { email: { to: 'user@example.com', subject: 'Hi', body: 'Body' } } : {}),
        ...(type === 'call' ? { phone: '+1 555 0100' } : {}),
      },
    })));
    states.push(settings(s => ({
      ...s,
      logo: { dataUrl: 'data:image/png;base64,AAA', size: 0.4 },
    })));
    for (const state of states) assertModel2Geometry(moduleCount(state));
  });

  it('resolves payloads at the Model 2 version-40 byte ceiling and rejects past it', () => {
    // 'x' forces byte mode; 2331 chars is the version-40 capacity at EC M.
    expect(moduleCount(settings(s => ({
      ...s, content: { ...baseContent, type: 'text', text: 'x'.repeat(2331) },
    })))).toBe(177);
    expect(() => moduleCount(settings(s => ({
      ...s, content: { ...baseContent, type: 'text', text: 'x'.repeat(2332) },
    })))).toThrow();

    // A logo forces EC H, whose version-40 capacity is 1273 bytes.
    const withLogo = (text: string) => settings(s => ({
      ...s, logo: { dataUrl: 'data:image/png;base64,AAA', size: 0.4 },
      content: { ...baseContent, type: 'text', text },
    }));
    expect(moduleCount(withLogo('x'.repeat(1273)))).toBe(177);
    expect(() => moduleCount(withLogo('x'.repeat(1274)))).toThrow();
  });
});