// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CONTRIBUTE_URL, SiteFooter } from './SiteFooter';

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
});