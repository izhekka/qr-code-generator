// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
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
    expect(screen.getByRole('link', { name: 'Create Static QR' })).toHaveAttribute('href', '/constructor');
  });
});