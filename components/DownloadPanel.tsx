'use client';

import { useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { buildQrConfig } from '@/lib/qrConfig';
import { composeSvg, rasterize, saveBlob } from '@/lib/compose';
import type { Action } from '@/lib/actions';
import type { ValidationErrorKey } from '@/lib/validate';
import type { DownloadFormat, Settings } from '@/lib/types';
import { useLocale } from './i18n';

const FORMATS: DownloadFormat[] = ['png', 'jpeg', 'svg', 'webp'];
const SIZES: Array<512 | 1024 | 2048> = [512, 1024, 2048];

export function DownloadPanel({ settings, dispatch, error }: {
  settings: Settings;
  dispatch(action: Action): void;
  error: ValidationErrorKey | null;
}) {
  const { copy } = useLocale();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<'readError' | 'failed' | null>(null);

  const download = async () => {
    setBusy(true);
    setFailure(null);
    try {
      // Export always composes from a fresh 1000×1000 render so coordinates
      // line up with composeSvg's viewBox — the preview instance may be any size.
      const exportQr = new QRCodeStyling(buildQrConfig(settings, 1000));
      const raw = await exportQr.getRawData('svg');
      const text = typeof raw === 'string' ? raw : await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('readError'));
        reader.onload = () => resolve(String(reader.result));
        reader.readAsText(raw as Blob);
      });
      const svg = composeSvg({ qrSvg: text, settings });
      const ext = settings.download.format;
      const filename = `qr-code.${ext}`;
      if (ext === 'svg') {
        saveBlob(new Blob([svg], { type: 'image/svg+xml' }), filename);
      } else {
        const mime = ({ png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' } as const)[ext];
        saveBlob(await rasterize(svg, settings.download.size, mime), filename);
      }
    } catch (e) {
      setFailure(e instanceof Error && e.message === 'readError' ? 'readError' : 'failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          {copy.download.format}
          <select
            value={settings.download.format}
            onChange={(e) => dispatch({ type: 'setDownload', patch: { format: e.target.value as DownloadFormat } })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize focus:border-[#7b5cd6] focus:outline-none"
          >
            {FORMATS.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          {copy.download.size}
          <select
            value={settings.download.size}
            disabled={settings.download.format === 'svg'}
            onChange={(e) => dispatch({ type: 'setDownload', patch: { size: Number(e.target.value) as 512 | 1024 | 2048 } })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7b5cd6] focus:outline-none disabled:text-gray-400"
          >
            {SIZES.map((s) => <option key={s} value={s}>{s} px</option>)}
          </select>
        </label>
      </div>
      <button
        onClick={download}
        disabled={Boolean(error) || busy}
        className="rounded-xl bg-[#23234f] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#7b5cd6] disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {copy.download.cta}
      </button>
      {failure && <p className="text-sm text-red-600" role="alert">{failure === 'readError' ? copy.logo.readError : copy.download.failed}</p>}
    </div>
  );
}