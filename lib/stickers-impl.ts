import type { QrRect, Sticker, StickerColors } from './stickers-types';

const INK = '#111827';

const resolve = (colors?: Partial<StickerColors>): StickerColors => ({
  stroke: colors?.stroke ?? INK,
  text: colors?.text ?? INK,
});

// The qr-code-styling library leaves a quiet margin inside its QR box — the
// library's own default is 0.06 on top of horizontal module centering, which
// works out to ~6.5% of the box. The thumbnails draw the mini-QR on the same
// inset content box so they match what the real QR looks like (and stay
// strictly inside roundish frames, whose corners clamp the square box).
const CONTENT_MARGIN = 0.065;

/** Deterministic 8×8 fake QR block used in thumbnails. */
function miniQrDots(rect: QrRect): string {
  const bits = [
    1, 1, 0, 1, 1, 0, 1, 1,
    1, 1, 0, 1, 0, 1, 1, 1,
    0, 1, 0, 0, 1, 1, 0, 1,
    1, 0, 1, 1, 0, 1, 1, 0,
    1, 1, 0, 1, 1, 0, 0, 1,
    0, 1, 1, 0, 1, 0, 1, 1,
    1, 0, 1, 1, 0, 1, 1, 0,
    1, 1, 0, 0, 1, 1, 0, 1,
  ];
  const n = 8;
  const m = rect.w * CONTENT_MARGIN;
  const box = { x: rect.x + m, y: rect.y + m, w: rect.w - 2 * m };
  const cell = box.w / n;
  let out = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!bits[r * n + c]) continue;
      out += `<rect x="${(box.x + c * cell).toFixed(1)}" y="${(box.y + r * cell).toFixed(1)}" width="${(cell * 0.85).toFixed(1)}" height="${(cell * 0.85).toFixed(1)}" fill="${INK}"/>`;
    }
  }
  // three finder squares for QR-realism
  return out;
}

function wrap(content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">${content}</svg>`;
}

function labelBand(label: string, y = 920, fontSize = 72, color = INK): string {
  return `<text x="500" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="${fontSize}" fill="${color}">${label}</text>`;
}

function define(
  id: string,
  label: string | null,
  qrRect: QrRect,
  frameArt: (r: QrRect, ink: string) => string,
  opts: { interior: string; labelY?: number },
): Sticker {
  const labelSvg = (text: string, c: StickerColors) =>
    id === 'topbar'
      ? // the label sits on the ink bar, so it stays white; the bar itself
        // takes the chosen sticker color
        `<text x="500" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="64" fill="#ffffff">${text}</text>`
      : labelBand(text, opts.labelY, undefined, c.text);

  return {
    id,
    label,
    qrRect,
    interior: opts.interior,
    frame: (labelText: string, colors?: Partial<StickerColors>) => {
      const c = resolve(colors);
      return wrap(`${frameArt(qrRect, c.stroke)}${label && labelText ? labelSvg(labelText, c) : ''}`);
    },
    thumb: (size: number, labelText: string, colors?: Partial<StickerColors>) => {
      const c = resolve(colors);
      return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1000 1000">` +
        `${frameArt(qrRect, c.stroke)}${miniQrDots(qrRect)}${label && labelText ? labelSvg(labelText, c) : ''}` +
        `</svg>`
      );
    },
  };
}

export const STICKERS: Sticker[] = [
  define('square', 'SCAN ME', { x: 120, y: 80, w: 760 }, (_r, ink) =>
    `<rect x="30" y="30" width="940" height="940" fill="none" stroke="${ink}" stroke-width="20"/>`,
    { interior: 'M40 40 h920 v920 h-920 Z' }),
  define('rounded', 'SCAN ME', { x: 120, y: 80, w: 760 }, (_r, ink) =>
    `<rect x="30" y="30" width="940" height="940" rx="90" fill="none" stroke="${ink}" stroke-width="24"/>`,
    { interior: 'M42 120 a78 78 0 0 1 78 -78 h760 a78 78 0 0 1 78 78 v760 a78 78 0 0 1 -78 78 h-760 a78 78 0 0 1 -78 -78 Z' }),
  define('circle', 'SCAN ME', { x: 160, y: 130, w: 680 }, (_r, ink) =>
    `<circle cx="500" cy="500" r="470" fill="none" stroke="${ink}" stroke-width="24"/>`,
    { interior: 'M500 42 a458 458 0 1 1 -0.1 0 Z' }),
  define('phone', 'SCAN ME', { x: 150, y: 140, w: 700 }, (_r, ink) =>
    `<rect x="70" y="30" width="860" height="940" rx="90" fill="none" stroke="${ink}" stroke-width="24"/><rect x="360" y="930" width="280" height="18" rx="9" fill="${ink}"/>`,
    { interior: 'M82 120 a78 78 0 0 1 78 -78 h680 a78 78 0 0 1 78 78 v760 a78 78 0 0 1 -78 78 h-680 a78 78 0 0 1 -78 -78 Z' }),
  define('clipboard', 'SCAN ME', { x: 150, y: 170, w: 700 }, (_r, ink) =>
    `<rect x="90" y="60" width="820" height="900" rx="40" fill="none" stroke="${ink}" stroke-width="24"/><rect x="380" y="20" width="240" height="80" rx="20" fill="none" stroke="${ink}" stroke-width="24"/>`,
    { interior: 'M102 100 a28 28 0 0 1 28 -28 h740 a28 28 0 0 1 28 28 v820 a28 28 0 0 1 -28 28 h-740 a28 28 0 0 1 -28 -28 Z' }),
  // bag interior spans y 272..908 (line at 260/920, 24 stroke); the QR box and
  // label are sized so the rendered content and text never cross the walls.
  define('bag', 'SCAN ME', { x: 245, y: 272, w: 580 }, (_r, ink) =>
    `<path d="M140 260 h720 l40 660 h-800 Z" fill="none" stroke="${ink}" stroke-width="24"/><path d="M360 260 v-40 a140 140 0 0 1 280 0 v40" fill="none" stroke="${ink}" stroke-width="24"/>`,
    { interior: 'M141 272 h708 l38 636 h-772 Z', labelY: 878 }),
  define('topbar', 'SCAN ME', { x: 110, y: 140, w: 780 }, (_r, ink) =>
    `<rect x="20" y="20" width="960" height="960" rx="40" fill="none" stroke="${ink}" stroke-width="20"/><path d="M20 60 a40 40 0 0 1 40 -40 h880 a40 40 0 0 1 40 40 v50 h-960 Z" fill="${ink}"/>`,
    { interior: 'M30 60 a30 30 0 0 1 30 -30 h880 a30 30 0 0 1 30 30 v880 a30 30 0 0 1 -30 30 h-880 a30 30 0 0 1 -30 -30 Z' }),
];