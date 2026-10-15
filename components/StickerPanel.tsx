'use client';

import type { Action } from '@/lib/actions';
import { listStickers } from '@/lib/stickers';
import type { Settings } from '@/lib/types';
import { ColorPicker } from './controls';

export function StickerPanel({ settings, dispatch }: {
  settings: Settings;
  dispatch(action: Action): void;
}) {
  const stickerColors = { stroke: settings.sticker.color, text: settings.sticker.textColor };
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-gray-500">Sticker frame</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => dispatch({ type: 'setSticker', stickerId: null })}
          className={`flex h-20 w-20 items-center justify-center rounded-xl border text-2xl ${
            settings.stickerId === null ? 'border-[#7b5cd6] bg-[#7b5cd6]/10' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          aria-label="No sticker"
        >
          ✕
        </button>
        {listStickers().map((s) => (
          <button
            key={s.id}
            onClick={() => dispatch({ type: 'setSticker', stickerId: s.id })}
            className={`rounded-xl border p-1 ${
              settings.stickerId === s.id ? 'border-[#7b5cd6] bg-[#7b5cd6]/10' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            aria-label={`Sticker ${s.id}`}
            dangerouslySetInnerHTML={{ __html: s.thumb(76, 'SCAN ME', stickerColors) }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-6">
        <ColorPicker label="Sticker color" value={settings.sticker.color} onChange={(color) => dispatch({ type: 'setStickerStyle', patch: { color } })} />
        <ColorPicker label="Text color" value={settings.sticker.textColor} onChange={(textColor) => dispatch({ type: 'setStickerStyle', patch: { textColor } })} />
      </div>
    </div>
  );
}