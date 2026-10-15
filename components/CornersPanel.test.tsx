// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PanelHarness } from '@/tests/harness';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { CornersPanel } from './CornersPanel';
import type { Action } from '@/lib/actions';

const dispatch = vi.fn<(action: Action) => void>();

describe('CornersPanel', () => {
  it('marks the current styles as selected and offers both dot options', () => {
    render(<CornersPanel settings={DEFAULT_SETTINGS} dispatch={dispatch} />);
    const selected = screen.getByRole('button', { name: 'Corner square square' });
    expect(selected.className).toMatch(/border-\[#7b5cd6\]/);
    expect(screen.getByRole('button', { name: 'Corner dot dot' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Corner square dot' })).toBeInTheDocument();
  });

  it.each([
    ['extra-rounded', { name: 'Corner square extra-rounded' }],
    ['dot', { name: 'Corner dot dot' }],
  ])('dispatches setCorners for style "%s"', async (id, name) => {
    render(<CornersPanel settings={DEFAULT_SETTINGS} dispatch={dispatch} />);
    await userEvent.click(screen.getByRole('button', name));
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setCorners',
      patch: id === 'dot' ? { dotType: 'dot' } : { squareType: 'extra-rounded' },
    });
  });

  it('dispatches a square-color change via the hex input', async () => {
    render(<PanelHarness onAction={dispatch}>{(s, d) => <CornersPanel settings={s} dispatch={d} />}</PanelHarness>);
    const hex = screen.getByLabelText('Corner square color hex');
    await userEvent.clear(hex);
    await userEvent.type(hex, '#112233');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setCorners', patch: { squareColor: '#112233' } });
    expect((screen.getByLabelText('Corner square color hex') as HTMLInputElement).value).toBe('#112233');
  });
});