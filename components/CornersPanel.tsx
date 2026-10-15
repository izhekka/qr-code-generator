'use client';

import type { Action } from '@/lib/actions';
import type { CornerDotType, CornerSquareType, Settings } from '@/lib/types';
import { ColorPicker } from './controls';

const SQUARE_TYPES: { id: CornerSquareType; glyph: string }[] = [
  { id: 'square', glyph: '□' },
  { id: 'dot', glyph: '⭘' },
  { id: 'extra-rounded', glyph: '▢' },
];

const CORNER_DOT_TYPES: { id: CornerDotType; glyph: string }[] = [
  { id: 'square', glyph: '■' },
  { id: 'dot', glyph: '⬤' },
];

function chip(selected: boolean): string {
  return `flex h-14 w-14 items-center justify-center rounded-xl border text-2xl ${
    selected ? 'border-[#7b5cd6] bg-[#7b5cd6]/10' : 'border-gray-200 bg-white hover:border-gray-300'
  }`;
}

export function CornersPanel({ settings, dispatch }: {
  settings: Settings;
  dispatch(action: Action): void;
}) {
  const c = settings.corners;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">Frame around corner dots style</p>
          <div className="flex flex-wrap gap-2">
            {SQUARE_TYPES.map(({ id, glyph }) => (
              <button key={id} onClick={() => dispatch({ type: 'setCorners', patch: { squareType: id } })} className={chip(c.squareType === id)} aria-label={`Corner square ${id}`}>
                {glyph}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">Corner dots type</p>
          <div className="flex flex-wrap gap-2">
            {CORNER_DOT_TYPES.map(({ id, glyph }) => (
              <button key={id} onClick={() => dispatch({ type: 'setCorners', patch: { dotType: id } })} className={chip(c.dotType === id)} aria-label={`Corner dot ${id}`}>
                {glyph}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorPicker label="Corner square color" value={c.squareColor} onChange={(squareColor) => dispatch({ type: 'setCorners', patch: { squareColor } })} />
        <ColorPicker label="Corner dots color" value={c.dotColor} onChange={(dotColor) => dispatch({ type: 'setCorners', patch: { dotColor } })} />
      </div>
    </div>
  );
}