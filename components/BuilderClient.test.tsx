// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom has no canvas; the components never touch it beyond append()/update().
vi.mock('qr-code-styling', () => ({
  default: class FakeQR {
    node = document.createElement('div');
    append = vi.fn((el: HTMLElement) => el.appendChild(this.node));
    update = vi.fn();
  },
}));

import { BuilderClient } from './BuilderClient';
import { LocaleProvider } from './i18n';
import { COPY } from '@/lib/i18n';

describe('BuilderClient', () => {
  afterEach(cleanup);

  it('shows the download error and disables downloading until content is entered', async () => {
    render(<BuilderClient />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Enter a URL to generate your QR code.');
    expect(screen.getByRole('button', { name: 'Download QR' })).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText('https://'), 'a.co');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download QR' })).toBeEnabled();
  });

  it('accepts a bare domain', async () => {
    render(<BuilderClient />);
    await userEvent.type(screen.getByPlaceholderText('https://'), 'example.com/x');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download QR' })).toBeEnabled();
  });

  it('rejects input that is not a website', async () => {
    render(<BuilderClient />);
    const input = screen.getByPlaceholderText('https://');
    await userEvent.type(input, 'not a link');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid link, like example.com.');
    expect(screen.getByRole('button', { name: 'Download QR' })).toBeDisabled();

    // fixing the input clears the error and re-enables download
    await userEvent.type(input, '{backspace>11/}example.com/x');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download QR' })).toBeEnabled();
  });

  it('opens the Sticker tab on page load', () => {
    render(<BuilderClient />);
    expect(screen.getByRole('button', { name: 'Sticker' }).className).toContain('bg-[#23234f]');
    expect(screen.getByRole('button', { name: 'No sticker' })).toBeInTheDocument();
  });

  it('renders the preview and all four design tabs', async () => {
    render(<BuilderClient />);
    await userEvent.type(screen.getByPlaceholderText('https://'), 'a');
    expect(screen.getByTestId('preview-qr')).toBeInTheDocument();
    for (const tab of ['Sticker', 'Pattern', 'Corners', 'Logo']) {
      expect(screen.getByRole('button', { name: tab })).toBeInTheDocument();
    }
  });

  it('wires design panels to shared settings state', async () => {
    render(<BuilderClient />);
    await userEvent.type(screen.getByPlaceholderText('https://'), 'a');
    await userEvent.click(screen.getByRole('button', { name: 'Sticker' }));
    await userEvent.click(screen.getByRole('button', { name: /Sticker square/ }));
    // Frame overlay appears over the preview because the sticker got selected.
    expect(screen.getByTestId('preview').querySelector('.pointer-events-none')).not.toBeNull();
  });

  it('renders Russian step titles and tabs when locale is ru', async () => {
    window.localStorage.setItem('qr-locale', 'ru');
    render(
      <LocaleProvider>
        <BuilderClient />
      </LocaleProvider>,
    );
    expect(await screen.findByRole('heading', { name: COPY.ru.steps.one })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: COPY.ru.steps.two })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: COPY.ru.steps.three })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: COPY.ru.tabs.logo })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: COPY.ru.download.cta })).toBeDisabled();
    window.localStorage.removeItem('qr-locale');
  });
});