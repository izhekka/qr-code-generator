export interface QrRect { x: number; y: number; w: number }

export interface StickerColors {
  /** Frame, bar and handle art color. */
  stroke: string;
  /** Sticker label text color. */
  text: string;
}

export interface Sticker {
  id: string;
  label: string | null;
  qrRect: QrRect;
  /** Closed SVG path for the region inside the frame borders (0..1000 canvas). */
  interior: string;
  frame(label: string, colors?: StickerColors): string;   // SVG markup for viewBox 0 0 1000 1000
  thumb(size: number, label: string, colors?: StickerColors): string;
}