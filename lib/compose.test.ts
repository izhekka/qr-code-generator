import { describe, expect, it } from 'vitest';
import { backgroundLayer, composeSvg } from './compose';
import { DEFAULT_SETTINGS } from './settings';
import { getSticker } from './stickers';
import { moduleCount } from './qrConfig';

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

describe('composeSvg logo compositing', () => {
  const logo = { ...DEFAULT_SETTINGS, logo: { dataUrl: 'data:image/png;base64,AAA', size: 0.3 } };

  it('draws the logo as an exact centered image over a cleared square', () => {
    // 30% of the QR's dot area (88% of the box): image side 264, centered at
    // 368 — linear in the slider, not the library's odd-module-quantized
    // size; the cleared hole snaps outward to whole modules (21 modules:
    // boundaries at 60 + k·26/0.88… → 353.33..646.67)
    const out = composeSvg({ qrSvg: QR_SVG, settings: logo });
    expect(out).toContain('id="logo-clear"');
    expect(out).toContain('<rect x="353.33" y="353.33" width="293.34" height="293.34" fill="#000"/>'); // mask hole
    expect(out).toContain('<mask id="logo-clear"');
    expect(out).toContain('href="data:image/png;base64,AAA" xlink:href="data:image/png;base64,AAA"');
    expect(out).toContain('x="368" y="368" width="264" height="264"');
    expect(out).toContain('<g mask="url(#logo-clear)">');
  });

  it('positions the logo box inside the sticker qrRect', () => {
    const s = { ...logo, stickerId: 'square' };
    const out = composeSvg({ qrSvg: QR_SVG, settings: s });
    // square sticker: qrRect {x:120, y:80, w:760} → side 201, centered at 400/360
    expect(out).toContain('x="400" y="360" width="201" height="201"');
  });

  it('emits no mask or image without a logo', () => {
    const out = composeSvg({ qrSvg: QR_SVG, settings: DEFAULT_SETTINGS });
    expect(out).not.toContain('logo-clear');
    expect(out).not.toContain('<image');
  });

  it('scales the logo box linearly with the slider stop', () => {
    const sizes = [0.1, 0.2, 0.3, 0.4, 0.5].map((stop) => {
      const out = composeSvg({ qrSvg: QR_SVG, settings: { ...logo, logo: { ...logo.logo, size: stop } } });
      return out.match(/<image href="[^"]+"[^>]*width="(\d+)"/)?.[1];
    });
    expect(sizes).toEqual(['88', '176', '264', '352', '440']);
  });

  it('snaps the cleared hole outward to whole modules so the logo never clips a dot', () => {
    const withLink = {
      ...logo,
      content: { ...logo.content, link: 'example.com/with-logo' },
    };
    const out = composeSvg({ qrSvg: QR_SVG, settings: withLink });
    const rect = out.match(/<rect x="([\d.]+)" y="[\d.]+" width="([\d.]+)" height="[\d.]+" fill="#000"\/>/)!;
    const [x, w] = [Number(rect[1]), Number(rect[2])];
    const count = moduleCount(withLink); // 33 for this payload
    const ms = (0.88 * 1000) / count;
    // every hole edge sits on a module boundary (origin 60; 2-decimal edge
    // rounding keeps each edge within 0.005 of its boundary — a hair off,
    // visually nothing)
    expect((x - 60) / ms).toBeCloseTo(Math.round((x - 60) / ms), 2);
    expect((x + w - 60) / ms).toBeCloseTo(Math.round((x + w - 60) / ms), 2);
    // and the cleared square fully covers the exact logo box (368..632)
    expect(x).toBeLessThanOrEqual(368);
    expect(x + w).toBeGreaterThanOrEqual(632);
  });
});