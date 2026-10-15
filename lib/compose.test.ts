import { describe, expect, it } from 'vitest';
import { backgroundLayer, composeSvg } from './compose';
import { DEFAULT_SETTINGS } from './settings';
import { getSticker } from './stickers';

const QR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000"><rect width="1000" height="1000" fill="#fff"/></svg>';

describe('composeSvg', () => {
  it('embeds the QR svg at full size when no sticker is chosen', () => {
    const out = composeSvg({ qrSvg: QR_SVG, settings: DEFAULT_SETTINGS });
    expect(out.startsWith('<svg')).toBe(true);
    expect(out).toContain('viewBox="0 0 1000 1000"');
    expect(out).toContain('fill="#fff"'); // inner content preserved
  });

  it('strips a library-style xml declaration before embedding the qr svg', () => {
    const withDecl = '<?xml version="1.0" standalone="no"?>\r\n' + QR_SVG;
    const out = composeSvg({ qrSvg: withDecl, settings: DEFAULT_SETTINGS });
    expect(out.startsWith('<?xml')).toBe(false);
    expect(out.slice(1, 200)).not.toContain('<?xml');
  });

  it('draws the sticker frame and positions the QR inside its box', () => {
    const s = { ...DEFAULT_SETTINGS, stickerId: 'square' };
    const out = composeSvg({ qrSvg: QR_SVG, settings: s });
    expect(out).toContain('stroke-width="20"');
    expect(out).toContain('x="120"'); // square sticker qrRect.x
    expect(out).toContain('SCAN ME');
  });

  it('fills the canvas background unless transparent', () => {
    const out = composeSvg({ qrSvg: QR_SVG, settings: DEFAULT_SETTINGS });
    expect(out).toContain(`fill="${DEFAULT_SETTINGS.pattern.bgColor}"`);
    const s = { ...DEFAULT_SETTINGS, pattern: { ...DEFAULT_SETTINGS.pattern, transparentBg: true } };
    expect(composeSvg({ qrSvg: QR_SVG, settings: s })).not.toContain('<rect width="1000" height="1000" fill="#ffffff"/>');
  });

  it('fills the sticker interior, not a square, when a sticker is set', () => {
    const s = { ...DEFAULT_SETTINGS, stickerId: 'bag' };
    const out = composeSvg({ qrSvg: QR_SVG, settings: s });
    expect(out).toContain(getSticker('bag')!.interior);
    expect(out).toContain(`fill="${s.pattern.bgColor}"`);
    // the background layer paints only the interior; no full-canvas rect
    expect(backgroundLayer(s)).not.toContain('<rect');
    expect(backgroundLayer(s)).toContain('M141 272');
  });

  it('draws the background gradient inside the sticker interior with a sticker', () => {
    const s = { ...DEFAULT_SETTINGS, stickerId: 'circle', pattern: { ...DEFAULT_SETTINGS.pattern, bgGradient: true } };
    const out = composeSvg({ qrSvg: QR_SVG, settings: s });
    expect(out).toContain(getSticker('circle')!.interior);
    expect(out).toContain('fill="url(#bggrad)"');
    expect(out).toContain('stop-color="' + s.pattern.bgFrom + '"');
  });

  it('uses one defs gradient for the background when enabled', () => {
    const s = { ...DEFAULT_SETTINGS, pattern: { ...DEFAULT_SETTINGS.pattern, bgGradient: true } };
    const out = composeSvg({ qrSvg: QR_SVG, settings: s });
    expect(out).toContain('stop-color="' + DEFAULT_SETTINGS.pattern.bgFrom + '"');
    expect(out).toContain('stop-color="' + DEFAULT_SETTINGS.pattern.bgTo + '"');
  });

  it('colors the sticker frame and label from the sticker settings', () => {
    const s = { ...DEFAULT_SETTINGS, stickerId: 'square', sticker: { color: '#aa0000', textColor: '#00aa55' } };
    const out = composeSvg({ qrSvg: QR_SVG, settings: s });
    expect(out).toContain('stroke="#aa0000"');
    expect(out).toContain('fill="#00aa55"');
  });

  it('declares xmlns:xlink so library logo images stay valid XML', () => {
    // The library writes <image href=... xlink:href=...> for logos; without the
    // xmlns:xlink declaration on the wrapper, Chrome rejects the composed SVG
    // as not well-formed and rasterization fails with a logo set.
    const withLogo =
      '<svg width="1000" height="1000"><image href="x" xlink:href="x" width="100" height="100"/></svg>';
    const out = composeSvg({ qrSvg: withLogo, settings: DEFAULT_SETTINGS });
    expect(out).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"');
  });
});