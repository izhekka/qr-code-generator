'use client';

import { useReducer, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { DEFAULT_SETTINGS, settingsReducer } from '@/lib/settings';
import { getValidationError } from '@/lib/validate';
import { buildQrConfig } from '@/lib/qrConfig';
import { useLocale } from './i18n';
import { ContentSection } from './ContentSection';
import { PatternPanel } from './PatternPanel';
import { CornersPanel } from './CornersPanel';
import { LogoPanel } from './LogoPanel';
import { StickerPanel } from './StickerPanel';
import { Panel } from './controls';
import { QrPreview } from './QrPreview';
import { DownloadPanel } from './DownloadPanel';
import type { ReactNode } from 'react';

const TABS = ['sticker', 'pattern', 'corners', 'logo'] as const;
type Tab = (typeof TABS)[number];

export function BuilderClient() {
  const [settings, dispatch] = useReducer(settingsReducer, DEFAULT_SETTINGS);
  const [tab, setTab] = useReducer((_: Tab, next: Tab) => next, 'sticker');
  const { copy } = useLocale();

  // Created client-side only (BuilderClient is loaded with ssr: false).
  const qr = useRef<QRCodeStyling | null>(null);
  if (!qr.current) qr.current = new QRCodeStyling(buildQrConfig(DEFAULT_SETTINGS));

  const error = getValidationError(settings);

  const panels: Record<Tab, ReactNode> = {
    sticker: <StickerPanel settings={settings} dispatch={dispatch} />,
    pattern: <PatternPanel settings={settings} dispatch={dispatch} />,
    corners: <CornersPanel settings={settings} dispatch={dispatch} />,
    logo: <LogoPanel settings={settings} dispatch={dispatch} />,
  };

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-[1fr_420px]">
      <div className="flex flex-col gap-6">
        <Panel title={copy.steps.one}>
          <ContentSection settings={settings} dispatch={dispatch} error={error} />
        </Panel>
        <Panel title={copy.steps.two}>
          <div className="flex gap-2 border-b border-gray-200 pb-2 mb-4">
            {TABS.map((name) => (
              <button
                key={name}
                onClick={() => setTab(name)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === name ? 'bg-[#23234f] text-white' : 'text-gray-500 hover:text-[#23234f]'}`}
              >
                {copy.tabs[name]}
              </button>
            ))}
          </div>
          {panels[tab]}
        </Panel>
      </div>
      <div className="flex flex-col items-center gap-4 lg:sticky lg:top-6 lg:self-start">
        <Panel title={copy.steps.three}>
          <div className="flex flex-col items-center gap-4">
            <QrPreview settings={settings} qr={qr.current} />
            <DownloadPanel settings={settings} dispatch={dispatch} error={error} />
          </div>
        </Panel>
      </div>
    </main>
  );
}