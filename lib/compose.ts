import { getSticker } from './stickers';
import { hex, moduleCount } from './qrConfig';
import type { Settings } from './types';

// The whole background belongs to the composition: the QR itself renders on
// transparency (its square background would spill past sticker frames), so the
// composition paints either the sticker's interior path or the full canvas.
export function backgroundLayer(settings: Settings): string {
  const p = settings.pattern;
  if (p.transparentBg) return '';
  const gradient = p.bgGradient
    ? `<defs><linearGradient id="bggrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hex(p.bgFrom)}"/><stop offset="1" stop-color="${hex(p.bgTo)}"/></linearGradient></defs>`
    : '';
  const fill = p.bgGradient ? 'url(#bggrad)' : hex(p.bgColor);
  const sticker = getSticker(settings.stickerId);
  const shape = sticker
    ? `<path d="${sticker.interior}" fill="${fill}"/>`
    : `<rect width="1000" height="1000" fill="${fill}"/>`;
  return gradient + shape;
}

// The logo is composited here, not by qr-code-styling: its image sizing
// derives the drawn logo from hidden-dot math quantized to odd module counts,
// so neighboring slider stops collapse to the same size (20% ≡ 30%, 40% ≡ 50%).
// We draw an exact centered box instead: the mask erases the QR dots
// underneath, and the image covers the cleared box — linear in the chosen
// percent, matching the preview. The cleared hole snaps outward to whole
// modules (logoGeometry) so no partially-clipped dot touches the logo edge.
// The slider percent refers to the QR's dot area; the library svg keeps a 6%
// quiet margin on each side, so the dots span 88% of the box. Scan budget
// (empirical, EC-H exports decoded back with jsQR and zxing-wasm): stops up
// to 30% scan reliably; at 40%+ the whole-module-snapped hole can cover
// ~25% of the dot area on fine grids (sitting on the alignment pattern),
// which no tested decoder reconstructs — larger stops render but may not
// read, and the Logo panel warns at 40%+.
export const LOGO_SPAN = 0.88;

export function logoGeometry(
  qrBox: { x: number; y: number; w: number },
  size: number,
  count: number,
): { image: { x: number; y: number; side: number }; hole: { x: number; y: number; w: number; h: number } } {
  const side = Math.round(qrBox.w * LOGO_SPAN * size);
  const offset = Math.round((qrBox.w - side) / 2);
  const image = { x: qrBox.x + offset, y: qrBox.y + offset, side };
  // hole edges already sit on module boundaries; round to 2 decimals for a
  // clean svg (a hundredth of a box unit doesn't clip a module meaningfully)
  const r2 = (n: number) => Number(n.toFixed(2));
  const { lo, hi } = logoHoleFraction(size, count);
  const left = qrBox.x + r2(lo * qrBox.w);
  const right = qrBox.x + r2(hi * qrBox.w);
  const top = qrBox.y + r2(lo * qrBox.w);
  const bottom = qrBox.y + r2(hi * qrBox.w);
  return { image, hole: { x: left, y: top, w: r2(right - left), h: r2(bottom - top) } };
}

// The cleared hole as fractions of the QR box, snapped outward to whole
// modules of the dot area so no partially-clipped dot touches the logo. The
// logo image stays at the exact labeled size; the cleared ring around it is
// at most one module wide. Shared by the export mask and the preview mask.
export function logoHoleFraction(size: number, count: number): { lo: number; hi: number } {
  const origin = (1 - LOGO_SPAN) / 2; // dot-area start as a fraction of the box
  const moduleSize = LOGO_SPAN / count; // as a fraction of the box
  const exact = LOGO_SPAN * size;
  const lo = origin + Math.floor((0.5 - exact / 2 - origin) / moduleSize) * moduleSize;
  const hi = origin + Math.ceil((0.5 + exact / 2 - origin) / moduleSize) * moduleSize;
  return { lo, hi };
}

function logoMask(hole: { x: number; y: number; w: number; h: number }): string {
  return (
    `<defs><mask id="logo-clear" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">` +
    `<rect width="1000" height="1000" fill="#fff"/>` +
    `<rect x="${hole.x}" y="${hole.y}" width="${hole.w}" height="${hole.h}" fill="#000"/>` +
    `</mask></defs>`
  );
}

function logoImage(image: { x: number; y: number; side: number }, dataUrl: string): string {
  // href + xlink:href keeps the image valid in every renderer we rasterize with
  return `<image href="${dataUrl}" xlink:href="${dataUrl}" x="${image.x}" y="${image.y}" width="${image.side}" height="${image.side}" preserveAspectRatio="xMidYMid meet"/>`;
}

export function composeSvg({ qrSvg, settings }: { qrSvg: string; settings: Settings }): string {
  const sticker = getSticker(settings.stickerId);

  // The library's svg output starts with an XML declaration; strip it (and the
  // root <svg>) so the markup can live inside our own wrapper element.
  const inner = qrSvg
    .replace(/^<\?xml[^>]*\?>\s*/, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '');
  const qrBox = sticker ? sticker.qrRect : { x: 0, y: 0, w: 1000 };
  const frame = sticker
    ? sticker.frame(sticker.label ?? '', { stroke: settings.sticker.color, text: settings.sticker.textColor })
    : '';

  const geo = settings.logo.dataUrl ? logoGeometry(qrBox, settings.logo.size, moduleCount(settings)) : null;
  const nestedQr = `<svg x="${qrBox.x}" y="${qrBox.y}" width="${qrBox.w}" height="${qrBox.w}" viewBox="0 0 1000 1000">${inner}</svg>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="1000" viewBox="0 0 1000 1000">` +
    (geo ? logoMask(geo.hole) : '') +
    backgroundLayer(settings) +
    (geo ? `<g mask="url(#logo-clear)">${nestedQr}</g>` + logoImage(geo.image, settings.logo.dataUrl!) : nestedQr) +
    frame +
    `</svg>`
  );
}

export async function rasterize(svg: string, size: number, mimeType: 'image/png' | 'image/jpeg' | 'image/webp'): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to rasterize the QR image.'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not available in this browser.');
    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
    }
    ctx.drawImage(img, 0, 0, size, size);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType));
    if (!blob) throw new Error('Could not encode the image.');
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}