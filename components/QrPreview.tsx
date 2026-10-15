'use client';

import { useEffect, useRef } from 'react';
import type QRCodeStyling from 'qr-code-styling';
import { buildQrConfig } from '@/lib/qrConfig';
import { backgroundLayer } from '@/lib/compose';
import { getSticker } from '@/lib/stickers';
import type { Settings } from '@/lib/types';

const PREVIEW = 360;

export function QrPreview({ settings, qr }: {
  settings: Settings;
  qr: QRCodeStyling;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const stuck = useRef(false);
  const sticker = settings.stickerId ? getSticker(settings.stickerId) : null;
  const qrRect = sticker ? sticker.qrRect : { x: 0, y: 0, w: 1000 };
  const size = Math.round((PREVIEW * qrRect.w) / 1000);

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
        }}
        data-testid="preview-qr"
      />
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