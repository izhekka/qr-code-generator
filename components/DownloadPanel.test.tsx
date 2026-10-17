// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { DownloadPanel } from './DownloadPanel';
import type { Action } from '@/lib/actions';

const dispatch = vi.fn<(action: Action) => void>();
const { saveBlob, rasterize } = vi.hoisted(() => ({
  saveBlob: vi.fn(),
  rasterize: vi.fn(),
}));

vi.mock('@/lib/compose', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/compose')>();
  return { ...mod, saveBlob, rasterize };
});

const VALID = { ...DEFAULT_SETTINGS, content: { ...DEFAULT_SETTINGS.content, link: 'example.com' } };
const AS_SVG = { ...VALID, download: { ...DEFAULT_SETTINGS.download, format: 'svg' as const } };

// The real rasterize/saveBlob use URL.createObjectURL + canvas, which jsdom
// does not provide; they are covered end-to-end by Playwright. Here they are
// replaced so the panel's branching can be asserted in isolation.
function stubUrl() {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('DownloadPanel', () => {
  it('disables the download button while the content error is set', () => {
    render(<DownloadPanel settings={DEFAULT_SETTINGS} dispatch={dispatch} error="enterUrl" />);
    expect(screen.getByRole('button', { name: 'Download QR' })).toBeDisabled();
    expect(saveBlob).not.toHaveBeenCalled();
  });

  it('enables the download button with valid content', () => {
    render(<DownloadPanel settings={DEFAULT_SETTINGS} dispatch={dispatch} error={null} />);
    expect(screen.getByRole('button', { name: 'Download QR' })).toBeEnabled();
  });

  it('disables the size select for SVG and dispatches format changes', async () => {
    const one = render(<DownloadPanel settings={DEFAULT_SETTINGS} dispatch={dispatch} error={null} />);
    expect(one.getByLabelText('Size')).toBeEnabled();
    await userEvent.selectOptions(one.getByLabelText('Format'), 'svg');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setDownload', patch: { format: 'svg' } });
    one.unmount();

    const two = render(<DownloadPanel settings={AS_SVG} dispatch={dispatch} error={null} />);
    expect(two.getByLabelText('Size')).toBeDisabled();
  });

  it('saves an SVG composed from a fresh render, without the XML declaration', async () => {
    stubUrl();
    render(<DownloadPanel settings={AS_SVG} dispatch={dispatch} error={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Download QR' }));

    await waitFor(() => expect(saveBlob).toHaveBeenCalledTimes(1));
    const [blob, filename] = saveBlob.mock.calls[0];
    expect(filename).toBe('qr-code.svg');
    expect(blob).toBeInstanceOf(Blob);
    expect((blob as Blob).type).toBe('image/svg+xml');
    const svg = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blob as Blob);
    });
    expect(svg).not.toContain('<?xml');
    expect(svg).toContain('viewBox="0 0 1000 1000"');
  });

  it('rasterizes binary formats at the selected size', async () => {
    stubUrl();
    rasterize.mockResolvedValue(new Blob(['png-bytes'], { type: 'image/png' }));
    render(<DownloadPanel settings={VALID} dispatch={dispatch} error={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Download QR' }));

    await waitFor(() => expect(saveBlob).toHaveBeenCalledTimes(1));
    expect(rasterize).toHaveBeenCalledWith(expect.any(String), 1024, 'image/png');
  });

  it('reports a failure without saving', async () => {
    stubUrl();
    saveBlob.mockImplementationOnce(() => {
      throw new Error('disk gone');
    });
    render(<DownloadPanel settings={AS_SVG} dispatch={dispatch} error={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Download QR' }));

    // Unexpected throw sites surface the generic localized failure instead of
    // a raw English message.
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Download failed.'));
    expect(saveBlob).toHaveBeenCalledTimes(1);
  });
});