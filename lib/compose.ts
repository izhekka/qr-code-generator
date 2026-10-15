import { getSticker } from './stickers';
import { hex } from './qrConfig';
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

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="1000" viewBox="0 0 1000 1000">` +
    backgroundLayer(settings) +
    `<svg x="${qrBox.x}" y="${qrBox.y}" width="${qrBox.w}" height="${qrBox.w}" viewBox="0 0 1000 1000">${inner}</svg>` +
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