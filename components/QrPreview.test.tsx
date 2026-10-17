// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { getSticker, listStickers } from '@/lib/stickers';
import type QRCodeStyling from 'qr-code-styling';
import type { Settings } from '@/lib/types';
import { QrPreview } from './QrPreview';

const fakeQr = () =>
  ({
    append: vi.fn(),
    update: vi.fn(),
  }) as unknown as QRCodeStyling & { append: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };

const PREVIEW = 360;

describe('QrPreview', () => {
  afterEach(cleanup);

  it('mounts the QR instance once and appends to the preview box', () => {
    const qr = fakeQr();
    render(<QrPreview settings={DEFAULT_SETTINGS} qr={qr} />);
    expect(qr.append).toHaveBeenCalledTimes(1);
    expect(qr.append).toHaveBeenCalledWith(screen.getByTestId('preview-qr'));
  });

  it('sizes and positions the QR from the sticker qrRect fractions', () => {
    const sticker = getSticker('square')!;
    const settings: Settings = { ...DEFAULT_SETTINGS, stickerId: 'square' };
    render(<QrPreview settings={settings} qr={fakeQr()} />);

    const box = screen.getByTestId('preview-qr');
    expect(parseInt(box.style.width, 10)).toBe(Math.round((sticker.qrRect.w * PREVIEW) / 1000));
    expect(parseFloat(box.style.left)).toBeCloseTo((sticker.qrRect.x * PREVIEW) / 1000, 1);
    expect(parseFloat(box.style.top)).toBeCloseTo((sticker.qrRect.y * PREVIEW) / 1000, 1);
  });

  it('renders each sticker frame over the QR, in the chosen sticker colors', () => {
    for (const s of listStickers()) {
      const settings: Settings = { ...DEFAULT_SETTINGS, stickerId: s.id };
      render(<QrPreview settings={settings} qr={fakeQr()} />);
      expect(screen.getByTestId('preview-frame').innerHTML).toContain('<svg');
      expect(screen.getByTestId('preview-frame').innerHTML).toContain(`stroke="${settings.sticker.color}"`);
      cleanup();
    }
    const colored: Settings = { ...DEFAULT_SETTINGS, stickerId: 'circle', sticker: { color: '#aa0000', textColor: '#00aa55' } };
    render(<QrPreview settings={colored} qr={fakeQr()} />);
    const frame = screen.getByTestId('preview-frame').innerHTML;
    expect(frame).toContain('stroke="#aa0000"');
    expect(frame).toContain('fill="#00aa55"');
  });

  it('paints the sticker interior with the background, under the QR', () => {
    const s: Settings = { ...DEFAULT_SETTINGS, stickerId: 'square', pattern: { ...DEFAULT_SETTINGS.pattern, bgColor: '#33dd77' } };
    render(<QrPreview settings={s} qr={fakeQr()} />);
    const bg = screen.getByTestId('preview-bg');
    expect(bg.innerHTML).toContain(getSticker('square')!.interior); // interior path, not a square
    expect(bg.innerHTML).toContain('fill="#33dd77"');
    expect(bg.innerHTML).not.toContain('<rect width="1000"');
  });

  it('paints the full canvas background without a sticker', () => {
    render(<QrPreview settings={DEFAULT_SETTINGS} qr={fakeQr()} />);
    const bg = screen.getByTestId('preview-bg');
    expect(bg.innerHTML).toContain('<rect width="1000"');
    expect(screen.queryByTestId('preview-frame')).toBeNull();
  });

  it('leaves the background empty when transparent', () => {
    const s: Settings = { ...DEFAULT_SETTINGS, pattern: { ...DEFAULT_SETTINGS.pattern, transparentBg: true } };
    render(<QrPreview settings={s} qr={fakeQr()} />);
    expect(screen.getByTestId('preview-bg').innerHTML).toBe('');
  });

  it('masks the QR with a hole at the logo percent and shows the logo on top', () => {
    const s: Settings = { ...DEFAULT_SETTINGS, logo: { dataUrl: 'data:image/png;base64,AAA', size: 0.4 } };
    render(<QrPreview settings={s} qr={fakeQr()} />);
    const qr = screen.getByTestId('preview-qr') as HTMLElement;
    expect(qr.style.maskImage).toContain('image/svg+xml');
    // the hole spans whole modules (moduleCount 21 for the default empty
    // payload) around the 40% box (32.4..67.6) → 31.14..68.86; painted as
    // four ring rects, the hole itself left unpainted (alpha masks +
    // SVG can't "erase", a full-canvas rect would mask nothing)
    expect(qr.style.maskImage).toContain("x='0' y='31.14' width='31.14' height='37.72'");
    expect(qr.style.maskImage).toContain("x='68.86' y='31.14' width='31.14' height='37.72'");
    expect(qr.style.maskImage).not.toContain("y='0' width='100' height='100'");
    const logo = screen.getByTestId('preview-logo') as HTMLImageElement;
    expect(logo.src).toBe('data:image/png;base64,AAA');
    expect(logo.style.width).toBe('126.72px');
    // same geometry rule as compose.ts: centered on the QR box
    expect(parseFloat(logo.style.left)).toBeCloseTo(116.64, 1);
  });

  it('emits no logo layer or mask without a logo', () => {
    render(<QrPreview settings={DEFAULT_SETTINGS} qr={fakeQr()} />);
    expect(screen.queryByTestId('preview-logo')).toBeNull();
    const qr = screen.getByTestId('preview-qr') as HTMLElement;
    expect(qr.style.maskImage).toBe('');
  });
});