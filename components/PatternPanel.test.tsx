// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PanelHarness } from '@/tests/harness';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { PatternPanel } from './PatternPanel';
import type { Action } from '@/lib/actions';

const dispatch = vi.fn<(action: Action) => void>();
const renderPanel = (initial = DEFAULT_SETTINGS) =>
  render(
    <PanelHarness initial={initial} onAction={dispatch}>
      {(s, d) => <PatternPanel settings={s} dispatch={d} />}
    </PanelHarness>,
  );

describe('PatternPanel', () => {
  it('selects a dot-style chip', async () => {
    renderPanel();
    await userEvent.click(screen.getByRole('button', { name: 'extra rounded' }));
    expect(screen.getByRole('button', { name: 'extra rounded' }).className).toMatch(/border-\[#7b5cd6\]/);
    expect(dispatch).toHaveBeenCalledWith({ type: 'setPattern', patch: { dotType: 'extra-rounded' } });
  });

  it('shows dot-style chips as icons, not text labels', () => {
    renderPanel();
    for (const name of ['square', 'dots', 'rounded', 'classy', 'classy rounded', 'extra rounded']) {
      const btn = screen.getByRole('button', { name });
      const svg = btn.querySelector('svg');
      expect(svg, name).not.toBeNull();
      expect(svg, name).toHaveAttribute('aria-hidden', 'true');
      expect(svg, name).toHaveAttribute('fill', DEFAULT_SETTINGS.pattern.color); // previews the chosen color
      expect(btn.textContent, name).toBe('');
    }
  });

  it('applies a hex color change to the next picker state', async () => {
    renderPanel();
    const hex = screen.getByLabelText('Pattern color hex');
    await userEvent.clear(hex);
    await userEvent.type(hex, '#0a0a0a');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setPattern', patch: { color: '#0a0a0a' } });
  });

  it('reveals the two gradient pickers only while the gradient toggle is on', async () => {
    renderPanel();
    expect(screen.queryByLabelText('Gradient from')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Gradient to')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Use gradient pattern' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'setPattern', patch: { gradient: true } });
    expect(screen.getByLabelText('Gradient from')).toBeInTheDocument();
    expect(screen.getByLabelText('Gradient to')).toBeInTheDocument();

    const from = screen.getByLabelText('Gradient from hex');
    await userEvent.clear(from);
    await userEvent.type(from, '#123456');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setPattern', patch: { colorFrom: '#123456' } });
    const to = screen.getByLabelText('Gradient to hex');
    await userEvent.clear(to);
    await userEvent.type(to, '#654321');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setPattern', patch: { colorTo: '#654321' } });

    await userEvent.click(screen.getByRole('checkbox', { name: 'Use gradient pattern' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'setPattern', patch: { gradient: false } });
    expect(screen.queryByLabelText('Gradient from')).not.toBeInTheDocument();
  });

  it('hides the background gradient pickers when the background is transparent', () => {
    renderPanel({ ...DEFAULT_SETTINGS, pattern: { ...DEFAULT_SETTINGS.pattern, transparentBg: true } });
    expect(screen.queryByLabelText('Background from')).not.toBeInTheDocument();
    expect((screen.getByRole('checkbox', { name: 'Use gradient background' }) as HTMLInputElement).checked).toBe(false);
  });

  it('dispatches a background color change', async () => {
    renderPanel();
    const hex = screen.getByLabelText('Background color hex');
    await userEvent.clear(hex);
    await userEvent.type(hex, '#fefefe');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setPattern', patch: { bgColor: '#fefefe' } });
  });

  it('toggles the background gradient and shows its pickers', async () => {
    renderPanel();
    expect(screen.queryByLabelText('Background from')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Use gradient background' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'setPattern', patch: { bgGradient: true } });
    expect(screen.getByLabelText('Background from')).toBeInTheDocument();
    expect(screen.getByLabelText('Background to')).toBeInTheDocument();

    const from = screen.getByLabelText('Background from hex');
    await userEvent.clear(from);
    await userEvent.type(from, '#aabbcc');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setPattern', patch: { bgFrom: '#aabbcc' } });
    const to = screen.getByLabelText('Background to hex');
    await userEvent.clear(to);
    await userEvent.type(to, '#ccbbaa');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setPattern', patch: { bgTo: '#ccbbaa' } });

    await userEvent.click(screen.getByRole('checkbox', { name: 'Use transparent background' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'setPattern', patch: { transparentBg: true } });
    expect(screen.queryByLabelText('Background from')).not.toBeInTheDocument();
    expect((screen.getByRole('checkbox', { name: 'Use gradient background' }) as HTMLInputElement).checked).toBe(false);
  });
});