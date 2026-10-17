// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';
import { SiteHeader } from './SiteHeader';
import { LocaleProvider } from './i18n';
import { COPY } from '@/lib/i18n';

// Renders the header under the real provider; optionally pre-seeds storage
// so the stored-locale path is exercised the same way the app hits it.
function renderHeader(storage?: 'ru' | 'en') {
  if (storage) window.localStorage.setItem('qr-locale', storage);
  const utils = render(
    <LocaleProvider>
      <SiteHeader />
    </LocaleProvider>,
  );
  if (storage) window.localStorage.removeItem('qr-locale');
  return utils;
}

describe('SiteHeader', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the wordmark, anchors and CTA', () => {
    render(<SiteHeader />);
    expect(screen.getByRole('link', { name: /QR Generator/ })).toHaveAttribute('href', '/');
    for (const { label, href } of [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Features', href: '/#features' },
      { label: 'QR types', href: '/#types' },
      { label: 'FAQ', href: '/#faq' },
    ]) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href);
    }
    expect(screen.getByRole('link', { name: 'Create Static QR' })).toHaveAttribute('href', '/builder-static');
  });

  it('shows the EN|RU switch and switching to RU localizes nav and CTA', async () => {
    renderHeader();
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'RU' }));
    expect(await screen.findByRole('link', { name: COPY.ru.header.createCta })).toHaveAttribute('href', '/builder-static');
    expect(screen.getByRole('link', { name: COPY.ru.header.nav.howItWorks })).toHaveAttribute('href', '/#how-it-works');
    expect(screen.getByRole('button', { name: 'RU' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('stored ru locale renders Russian on first paint', async () => {
    renderHeader('ru');
    expect(await screen.findByRole('link', { name: COPY.ru.header.createCta })).toBeInTheDocument();
    expect(screen.getByText(COPY.ru.header.brand)).toBeInTheDocument();
  });

  it('sits the language switch right of the CTA (very right)', () => {
    renderHeader();
    const ru = screen.getByRole('button', { name: 'RU' });
    const cta = screen.getByRole('link', { name: 'Create Static QR' });
    // DOCUMENT_POSITION_PRECEDING: the CTA node comes before the switch node,
    // i.e. the switch is the rightmost element in the header.
    expect(ru.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });
});