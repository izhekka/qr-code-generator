// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CONTRIBUTE_URL, SiteFooter } from './SiteFooter';
import { LocaleProvider } from './i18n';
import { COPY } from '@/lib/i18n';

describe('SiteFooter', () => {
  it('links to the repository for contributing', () => {
    render(<SiteFooter />);
    const link = screen.getByRole('link', { name: 'Contribute' });
    expect(link).toHaveAttribute('href', CONTRIBUTE_URL);
    expect(link).toHaveAttribute('href', 'https://github.com/izhekka/qr-code-generator');
  });

  it('points the FAQ link at the landing page anchor from any page', () => {
    render(<SiteFooter />);
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/#faq');
  });

  it('localizes the footer to Russian', async () => {
    window.localStorage.setItem('qr-locale', 'ru');
    render(
      <LocaleProvider>
        <SiteFooter />
      </LocaleProvider>,
    );
    expect(await screen.findByText(COPY.ru.footer.tagline)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: COPY.ru.footer.contribute })).toHaveAttribute('href', 'https://github.com/izhekka/qr-code-generator');
    window.localStorage.removeItem('qr-locale');
  });
});