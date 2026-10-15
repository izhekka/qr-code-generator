import type { Options } from 'qr-code-styling';
import { buildPayload } from './payload';
import type { Settings } from './types';

/** Sanitize free-text color input into something SVG-safe. */
export function hex(input: string): string {
  return /^#[0-9a-f]{6}$/i.test(input.trim()) ? input.trim() : '#000000';
}

export function buildQrConfig(settings: Settings, size = 1000): Options {
  const p = settings.pattern;
  const pattern = p.gradient
    ? {
        type: 'linear' as const,
        rotation: Math.PI / 3,
        colorStops: [
          { offset: 0, color: hex(p.colorFrom) },
          { offset: 1, color: hex(p.colorTo) },
        ],
      }
    : undefined;

  return {
    width: size,
    height: size,
    type: 'svg',
    data: buildPayload(settings.content),
    margin: Math.round(size * 0.06),
    qrOptions: { errorCorrectionLevel: settings.logo.dataUrl ? ('H' as const) : ('M' as const) },
    image: settings.logo.dataUrl ?? undefined,
    imageOptions: {
      hideBackgroundDots: settings.logo.hideBackgroundDots,
      // this version sizes the logo in px; keep it proportional to `size`
      imageSize: Math.round(settings.logo.size * size),
      margin: Math.round(size * 0.004),
      crossOrigin: 'anonymous',
    },
    dotsOptions: { color: hex(p.color), type: p.dotType, gradient: pattern },
    cornersSquareOptions: { color: hex(settings.corners.squareColor), type: settings.corners.squareType },
    cornersDotOptions: { color: hex(settings.corners.dotColor), type: settings.corners.dotType },
    // background painting belongs to the composition (see compose.backgroundLayer)
    backgroundOptions: { color: 'rgba(0,0,0,0)' },
  };
}