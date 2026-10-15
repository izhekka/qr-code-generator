// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { listStickers } from '@/lib/stickers';
import { PanelHarness } from '@/tests/harness';
import { StickerPanel } from './StickerPanel';
import type { Action } from '@/lib/actions';

const dispatch = vi.fn<(action: Action) => void>();
const withSticker = (stickerId: string | null) => ({ ...DEFAULT_SETTINGS, stickerId });
const renderPanel = (settings = DEFAULT_SETTINGS) =>
  render(
    <PanelHarness initial={settings} onAction={dispatch}>
      {(s, d) => <StickerPanel settings={s} dispatch={d} />}
    </PanelHarness>,
  );

describe('StickerPanel', () => {
  it('offers a none button plus one thumb per sticker', () => {
    renderPanel(withSticker(null));
    expect(screen.getByRole('button', { name: 'No sticker' })).toBeInTheDocument();
    for (const s of listStickers()) {
      expect(screen.getByRole('button', { name: `Sticker ${s.id}` })).toBeInTheDocument();
    }
  });

  it('dispatches setSticker with the thumb id when clicked', async () => {
    const first = listStickers()[0];
    renderPanel(withSticker(null));
    await userEvent.click(screen.getByRole('button', { name: `Sticker ${first.id}` }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'setSticker', stickerId: first.id });
  });

  it('dispatches setSticker with null when the none button is clicked', async () => {
    const first = listStickers()[0];
    renderPanel(withSticker(first.id));
    const selected = screen.getByRole('button', { name: `Sticker ${first.id}` });
    expect(selected.className).toMatch(/border-\[#7b5cd6\]/);
    await userEvent.click(screen.getByRole('button', { name: 'No sticker' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'setSticker', stickerId: null });
  });

  it('dispatches setStickerStyle when the sticker colors change', async () => {
    renderPanel(withSticker('bag'));
    await userEvent.type(screen.getByRole('textbox', { name: 'Sticker color hex' }), '{backspace>7/}#0a7d2c');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setStickerStyle', patch: { color: '#0a7d2c' } });
    await userEvent.type(screen.getByRole('textbox', { name: 'Text color hex' }), '{backspace>7/}#7b5cd6');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setStickerStyle', patch: { textColor: '#7b5cd6' } });
  });

  it('renders the thumbs with the chosen sticker colors', () => {
    renderPanel({ ...withSticker('bag'), sticker: { color: '#aa0000', textColor: '#00aa55' } });
    const thumb = screen.getByRole('button', { name: 'Sticker bag' }).innerHTML;
    expect(thumb).toContain('stroke="#aa0000"');
    expect(thumb).toContain('fill="#00aa55"');
  });
});