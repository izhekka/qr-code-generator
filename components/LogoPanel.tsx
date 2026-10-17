'use client';

import { useRef, useState } from 'react';
import type { Action } from '@/lib/actions';
import type { Settings } from '@/lib/types';

export function LogoPanel({ settings, dispatch }: {
  settings: Settings;
  dispatch(action: Action): void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logo = settings.logo;

  const onFile = (file: File | undefined) => {
    setUploadError(null);
    if (!file) return;
    if (!/^(image\/(png|jpeg|webp|svg\+xml))$/.test(file.type)) {
      setUploadError('Pick a PNG, JPEG, WEBP or SVG image.');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setUploadError('Could not read that file.');
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (result) dispatch({ type: 'setLogo', patch: { dataUrl: result } });
      else setUploadError('Could not read that file.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:border-[#7b5cd6]"
        >
          Upload logo
        </button>
        {uploadError && <p className="mt-2 text-sm text-red-600" role="alert">{uploadError}</p>}
      </div>

      {logo.dataUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo.dataUrl} alt="Logo preview" className="h-16 w-16 rounded border border-gray-200 bg-white object-contain" />
          <label className="flex flex-col gap-1 text-sm font-medium">
            Logo size ({Math.round(logo.size * 100)}%)
            {/* snaps to 10% steps; the percent is of the QR's dot area
                (see compose.logoGeometry for the geometry + scan budget) */}
            <input
              type="range"
              min={0.1}
              max={0.5}
              step={0.1}
              value={logo.size}
              onChange={(e) => dispatch({ type: 'setLogo', patch: { size: Number(e.target.value) } })}
              className="w-full accent-[#7b5cd6]"
            />
          </label>
          {logo.size >= 0.4 && (
            <p className="text-xs text-amber-700">From 40% up the cleared area may exceed what scanners can read — 30% or smaller scans reliably.</p>
          )}
          <button
            onClick={() => dispatch({ type: 'setLogo', patch: { dataUrl: null } })}
            className="self-start text-sm font-semibold text-red-600 hover:underline"
          >
            Remove logo
          </button>
        </>
      )}
    </div>
  );
}