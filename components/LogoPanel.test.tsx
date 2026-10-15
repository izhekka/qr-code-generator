// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { PanelHarness } from '@/tests/harness';
import { LogoPanel } from './LogoPanel';
import type { Action } from '@/lib/actions';

const dispatch = vi.fn<(action: Action) => void>();
const file = (name: string, type: string) => new File(['logo-bytes'], name, { type });
const withLogo = { ...DEFAULT_SETTINGS, logo: { ...DEFAULT_SETTINGS.logo, dataUrl: 'data:image/png;base64,x' } };
const getFileInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type=file]') as HTMLInputElement;

describe('LogoPanel', () => {
  it('shows an upload error for unsupported file types and does not dispatch', () => {
    const { container } = render(<LogoPanel settings={DEFAULT_SETTINGS} dispatch={dispatch} />);
    fireEvent.change(getFileInput(container), { target: { files: [file('logo.txt', 'text/plain')] } });
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a PNG, JPEG, WEBP or SVG image.');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('shows the preview once a supported file is read and dispatches its data URL', async () => {
    const { container } = render(
      <PanelHarness onAction={dispatch}>{(s, d) => <LogoPanel settings={s} dispatch={d} />}</PanelHarness>,
    );
    fireEvent.change(getFileInput(container), { target: { files: [file('logo.png', 'image/png')] } });
    expect(await screen.findByRole('img', { name: 'Logo preview' })).toBeInTheDocument();
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setLogo',
      patch: { dataUrl: expect.stringMatching(/^data:image\/png;base64,/) },
    });
  });

  it('reports a read error and does not dispatch', () => {
    const original = FileReader.prototype.readAsDataURL;
    FileReader.prototype.readAsDataURL = function fake(this: FileReader) {
      this.onerror?.(new Event('error') as unknown as ProgressEvent<FileReader>);
    };
    try {
      const { container } = render(<LogoPanel settings={DEFAULT_SETTINGS} dispatch={dispatch} />);
      fireEvent.change(getFileInput(container), { target: { files: [file('logo.png', 'image/png')] } });
      expect(screen.getByRole('alert')).toHaveTextContent('Could not read that file.');
      expect(dispatch).not.toHaveBeenCalled();
    } finally {
      FileReader.prototype.readAsDataURL = original;
    }
  });

  it('dispatches setLogo size changes on the range input', () => {
    render(<LogoPanel settings={withLogo} dispatch={dispatch} />);
    fireEvent.change(screen.getByLabelText(/Logo size/), { target: { value: '0.2' } });
    expect(dispatch).toHaveBeenCalledWith({ type: 'setLogo', patch: { size: 0.2 } });
  });

  it('dispatches hideBackgroundDots from the toggle', async () => {
    render(<LogoPanel settings={withLogo} dispatch={dispatch} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Clear dots behind the logo' }));
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setLogo',
      patch: { hideBackgroundDots: !DEFAULT_SETTINGS.logo.hideBackgroundDots },
    });
  });

  it('dispatches setLogo with a null data URL when Remove logo is clicked', async () => {
    render(<LogoPanel settings={withLogo} dispatch={dispatch} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove logo' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'setLogo', patch: { dataUrl: null } });
  });
});