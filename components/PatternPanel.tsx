'use client';

import type { Action } from '@/lib/actions';
import type { DotType, Settings } from '@/lib/types';
import { hex } from '@/lib/qrConfig';
import { useLocale } from './i18n';
import { ColorPicker, Toggle } from './controls';

const DOT_TYPES: DotType[] = ['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'];

// Shapes approximate how qr-code-styling renders each dot style (see its
// _draw* methods): plain square, full-circle dots, and the rounded styles,
// whose corner radius grows as a module gains more neighbours.
function dotGlyph(type: DotType, color: string): string {
  const cell = 9;
  const cells: Array<[number, number]> = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [0, 2], [2, 2]];
  const neighbours = (col: number, row: number) => {
    const key = (c: number, r: number) => c * 3 + r;
    const set = new Set(cells.map(([c, r]) => key(c, r)));
    return [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dc, dr]) => set.has(key(col + dc, row + dr))).length;
  };
  const radius = (n: number, scale: number[]) =>
    (cell * (scale[Math.min(n, scale.length - 1)])).toFixed(1);
  const shape = (col: number, row: number) => {
    const x = col * cell, y = row * cell, s = cell - 2;
    switch (type) {
      case 'dots': return `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="${s / 2}"/>`;
      case 'rounded': return `<rect x="${x + 1}" y="${y + 1}" width="${s}" height="${s}" rx="${radius(neighbours(col, row), [0.5, 0.35, 0.15])}"/>`;
      case 'extra-rounded': return `<rect x="${x + 1}" y="${y + 1}" width="${s}" height="${s}" rx="${radius(neighbours(col, row), [0.5, 0.48, 0.35])}"/>`;
      case 'classy': return `<path d="M ${x + 1} ${y + 1} h ${s} v ${s} h ${-(s * 0.65).toFixed(1)} a ${(s * 0.35).toFixed(1)} ${(s * 0.35).toFixed(1)} 0 0 1 ${-(s * 0.35).toFixed(1)} ${-(s * 0.35).toFixed(1)} z"/>`;
      case 'classy-rounded': return `<path d="M ${x + 1} ${y + 1} h ${s} v ${s} h ${-(s * 0.25).toFixed(1)} a ${(s * 0.75).toFixed(1)} ${(s * 0.75).toFixed(1)} 0 0 1 ${-(s * 0.75).toFixed(1)} ${-(s * 0.75).toFixed(1)} z"/>`;
      default: return `<rect x="${x + 1}" y="${y + 1}" width="${s}" height="${s}"/>`;
    }
  };
  const modules = cells.map(([col, row]) => shape(col, row)).join('');
  return `<svg viewBox="0 0 27 27" fill="${color}" aria-hidden="true">${modules}</svg>`;
}

export function PatternPanel({ settings, dispatch }: {
  settings: Settings;
  dispatch(action: Action): void;
}) {
  const p = settings.pattern;
  const { copy } = useLocale();
  const patch = (p2: Partial<typeof p>) => dispatch({ type: 'setPattern', patch: p2 });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-500">{copy.pattern.caption}</p>
        <div className="flex flex-wrap gap-2">
          {DOT_TYPES.map((t) => (
            <button
              key={t}
              aria-label={t.replace('-', ' ')}
              title={t.replace('-', ' ')}
              onClick={() => patch({ dotType: t })}
              className={`flex h-14 w-14 items-center justify-center rounded-xl border p-1.5 ${
                p.dotType === t ? 'border-[#7b5cd6] bg-[#7b5cd6]/10' : 'border-gray-200 hover:border-gray-300'
              }`}
              dangerouslySetInnerHTML={{ __html: dotGlyph(t, hex(p.color)) }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <ColorPicker label={copy.pattern.colorLabel} value={p.color} onChange={(color) => patch({ color })} />
        <Toggle label={copy.pattern.gradient} checked={p.gradient} onChange={(gradient) => patch({ gradient })} />
      </div>
      {p.gradient && (
        <div className="flex items-center gap-4">
          <ColorPicker label={copy.pattern.from} value={p.colorFrom} onChange={(colorFrom) => patch({ colorFrom })} />
          <ColorPicker label={copy.pattern.to} value={p.colorTo} onChange={(colorTo) => patch({ colorTo })} />
        </div>
      )}

      <hr className="border-gray-200" />
      <div className="flex flex-wrap items-center gap-4">
        <ColorPicker label={copy.pattern.backgroundColor} value={p.bgColor} onChange={(bgColor) => patch({ bgColor })} />
        <Toggle label={copy.pattern.transparent} checked={p.transparentBg} onChange={(transparentBg) => patch({ transparentBg })} />
        <Toggle label={copy.pattern.backgroundGradient} checked={p.transparentBg ? false : p.bgGradient} onChange={(bgGradient) => patch({ bgGradient })} />
      </div>
      {p.bgGradient && !p.transparentBg && (
        <div className="flex items-center gap-4">
          <ColorPicker label={copy.pattern.backgroundFrom} value={p.bgFrom} onChange={(bgFrom) => patch({ bgFrom })} />
          <ColorPicker label={copy.pattern.backgroundTo} value={p.bgTo} onChange={(bgTo) => patch({ bgTo })} />
        </div>
      )}
    </div>
  );
}