'use client';

import { useEffect, useRef } from 'react';
import type QRCodeStyling from 'qr-code-styling';
import { buildQrConfig, moduleCount } from '@/lib/qrConfig';
import { logoHoleFraction, backgroundLayer, LOGO_SPAN } from '@/lib/compose';
import { getSticker } from '@/lib/stickers';
import type { Settings } from '@/lib/types';

const PREVIEW = 360;

// Masks the QR in the preview exactly like compose.ts masks it in exports:
// the hole spans logoHoleFraction — whole modules of the dot area (the module
// count comes from the same generator the library renders with —
// qrConfig.moduleCount) — so no partly-clipped dot touches the logo edge. The
// library's own image sizing is unusable here (odd module quantization
// collapses neighboring slider stops), so the composition owns the logo box
// in both paths.
// Masks through an <img>-like SVG source use the ALPHA channel, not
// luminance, and SVG painting never erases what's under it — so the opaque
// area is painted as four rects around the hole and the hole is left
// unpainted (a full-canvas rect, even with a transparent hole rect drawn
// over it, would stay opaque and mask nothing).
function logoHoleMask(pct: number, count: number): string {
  const f = (n: number) => Number(n.toFixed(2));
  const { lo, hi } = logoHoleFraction(pct / 100, count);
  const left = f(lo * 100);
  const right = f(hi * 100);
  const w = `fill='white'`;
  const hole = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><rect x='0' y='0' width='100' height='${left}' ${w}/><rect x='0' y='${right}' width='100' height='${f(100 - right)}' ${w}/><rect x='0' y='${left}' width='${left}' height='${f(right - left)}' ${w}/><rect x='${right}' y='${left}' width='${f(100 - right)}' height='${f(right - left)}' ${w}/></svg>`;
  return `url("data:image/svg+xml,${hole}")`;
}

export function QrPreview({ settings, qr }: {
  settings: Settings;
  qr: QRCodeStyling;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const stuck = useRef(false);
  const sticker = settings.stickerId ? getSticker(settings.stickerId) : null;
  const qrRect = sticker ? sticker.qrRect : { x: 0, y: 0, w: 1000 };
  const size = Math.round((PREVIEW * qrRect.w) / 1000);
  const logoPct = settings.logo.dataUrl ? Math.round(settings.logo.size * 100) : 0;
  // the module grid of the rendered QR — the hole snaps to it in both paths
  const logoCount = moduleCount(settings);

  useEffect(() => {
    if (mount.current && !stuck.current) {
      qr.append(mount.current);
      stuck.current = true;
    }
  }, [qr]);

  useEffect(() => {
    qr.update(buildQrConfig(settings, size));
  }, [qr, settings, size]);

  return (
    <div className="relative" style={{ width: PREVIEW, height: PREVIEW }} data-testid="preview">
      <svg
        viewBox="0 0 1000 1000"
        className="pointer-events-none absolute inset-0"
        data-testid="preview-bg"
        dangerouslySetInnerHTML={{ __html: backgroundLayer(settings) }}
      />
      <div
        ref={mount}
        className="absolute"
        style={{
          left: (qrRect.x / 1000) * PREVIEW,
          top: (qrRect.y / 1000) * PREVIEW,
          width: size,
          height: size,
          ...(logoPct
            ? {
                maskImage: logoHoleMask(logoPct, logoCount),
                WebkitMaskImage: logoHoleMask(logoPct, logoCount),
                maskSize: '100% 100%',
                WebkitMaskSize: '100% 100%',
              }
            : {}),
        }}
        data-testid="preview-qr"
      />
      {settings.logo.dataUrl && logoPct > 0 && (
        /* same geometry rule as compose.ts: centered box at `size` percent of the dot area */
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={settings.logo.dataUrl}
          alt="Logo"
          data-testid="preview-logo"
          className="pointer-events-none absolute object-contain"
          style={{
            left: ((qrRect.x + (qrRect.w * (1 - (logoPct / 100) * LOGO_SPAN)) / 2) / 1000) * PREVIEW,
            top: ((qrRect.y + (qrRect.w * (1 - (logoPct / 100) * LOGO_SPAN)) / 2) / 1000) * PREVIEW,
            width: size * (logoPct / 100) * LOGO_SPAN,
            height: size * (logoPct / 100) * LOGO_SPAN,
          }}
        />
      )}
      {sticker && (
        <div
          className="pointer-events-none absolute inset-0"
          data-testid="preview-frame"
          dangerouslySetInnerHTML={{ __html: sticker.frame('SCAN ME', { stroke: settings.sticker.color, text: settings.sticker.textColor }) }}
        />
      )}
    </div>
  );
}