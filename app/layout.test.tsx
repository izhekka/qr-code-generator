// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import RootLayout from './layout';
import { COPY } from '@/lib/i18n';

// Analytics is a client component whose script injection is environment-driven;
// the layout's own job is only to render it once in the document.
// globals.css is stubbed: vite's PostCSS loader rejects the repo's Tailwind 4
// config, and the only test that exercises the layout (which imports it) is this one.
vi.mock('./globals.css', () => ({}));
vi.mock('@vercel/analytics/next', () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));

describe('root layout', () => {
  it('renders Analytics, header, footer and children once', () => {
    render(
      <RootLayout>
        <p>child content</p>
      </RootLayout>,
    );
    expect(screen.getByTestId('vercel-analytics')).toBeInTheDocument();
    expect(screen.getByText('child content')).toBeInTheDocument();
    expect(screen.getByText(COPY.en.footer.tagline)).toBeInTheDocument();
  });
});