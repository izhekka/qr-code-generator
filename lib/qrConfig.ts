import qrcode from 'qrcode-generator';
import type { ErrorCorrectionLevel, Options } from 'qr-code-styling';
import { buildPayload } from './payload';
import type { Settings } from './types';

/** Sanitize free-text color input into something SVG-safe. */
export function hex(input: string): string {
  return /^#[0-9a-f]{6}$/i.test(input.trim()) ? input.trim() : '#000000';
}

/** A logo needs the extra damage budget: level H; plain codes ride M. */
export function errorCorrectionLevel(settings: Settings): ErrorCorrectionLevel {
  return settings.logo.dataUrl ? 'H' : 'M';
}

/** Standard Model 2 byte-mode capacity at version 40 — the engine's hard ceiling. */
const MODEL2_MAX_M = 2331;
const MODEL2_MAX_H = 1273;

/**
 * Longest payload the engine can actually encode given the effective EC level.
 * Compared against `buildPayload(...).length` (UTF-16 code units): the engine's
 * byte mode also consumes one byte per code unit (chars > 255 are truncated —
 * the generator's own byte math), so this is not a UTF-8 byte count.
 */
export function maxPayloadLength(settings: Settings): number {
  return errorCorrectionLevel(settings) === 'H' ? MODEL2_MAX_H : MODEL2_MAX_M;
}

/**
 * The module count of the rendered QR. The same generator, level and payload
 * as buildQrConfig hands to the library, so the count always matches what the
 * svg draws — the composition uses it to snap the logo hole to whole modules.
 */
export function moduleCount(settings: Settings): number {
  const qr = qrcode(0, errorCorrectionLevel(settings));
  qr.addData(buildPayload(settings.content));
  qr.make();
  return qr.getModuleCount();
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

  // The library never draws the logo itself: its image sizing derives the
  // drawn size from hidden-dot math quantized to odd module counts, so
  // neighboring slider stops collapse to the same rendered size. The logo is
  // composited on top instead (compose.ts / QrPreview) — see lib/compose.ts.
  // EC level H stays: it carries the lost modules behind the logo.
  return {
    width: size,
    height: size,
    type: 'svg',
    data: buildPayload(settings.content),
    margin: Math.round(size * 0.06),
    // qrcode-generator emits standard Model 2 (ISO/IEC 18004) symbols only —
    // versions 1–40 auto-selected; any engine swap must preserve that contract.
    qrOptions: { errorCorrectionLevel: errorCorrectionLevel(settings) },
    dotsOptions: { color: hex(p.color), type: p.dotType, gradient: pattern },
    cornersSquareOptions: { color: hex(settings.corners.squareColor), type: settings.corners.squareType },
    cornersDotOptions: { color: hex(settings.corners.dotColor), type: settings.corners.dotType },
    // background painting belongs to the composition (see compose.backgroundLayer)
    backgroundOptions: { color: 'rgba(0,0,0,0)' },
  };
}