import { describe, expect, it } from 'vitest';
import { buildQrConfig, hex } from './qrConfig';
import { DEFAULT_SETTINGS } from './settings';

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

  it('uses H and embeds the image when a logo is set', () => {
    const s = { ...DEFAULT_SETTINGS, logo: { dataUrl: 'data:image/png;base64,AAA', size: 0.4, hideBackgroundDots: true } };
    const config = buildQrConfig(s);
    expect(config.qrOptions?.errorCorrectionLevel).toBe('H');
    expect(config.image).toBe('data:image/png;base64,AAA');
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