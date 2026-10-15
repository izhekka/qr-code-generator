import { STICKERS } from './stickers-impl';
import type { Sticker } from './stickers-types';

export type { Sticker } from './stickers-types';

export function getSticker(id: string | null): Sticker | null {
  return STICKERS.find((s) => s.id === id) ?? null;
}

export function listStickers(): Sticker[] {
  return STICKERS;
}