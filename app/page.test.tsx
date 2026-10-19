// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from './page';
import { LocaleProvider } from '@/components/i18n';
import { COPY } from '@/lib/i18n';

describe('landing page', () => {
  it('renders the English hero and sections by default', () => {
    render(<Home />);
    expect(screen.getByText(COPY.en.hero.title)).toBeInTheDocument();
    expect(screen.getByText('Private by design')).toBeInTheDocument();
    expect(screen.getByText('How it works', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: COPY.en.hero.createCta })).toSatisfy((links: HTMLElement[]) => links.every((l) => l.getAttribute('href') === '/builder-static'));
  });

  it('renders Russian when the stored locale is ru', async () => {
    window.localStorage.setItem('qr-locale', 'ru');
    render(
      <LocaleProvider>
        <Home />
      </LocaleProvider>,
    );
    expect(await screen.findByText(COPY.ru.hero.title)).toBeInTheDocument();
    expect(screen.getByText(COPY.ru.features.items[1].title)).toBeInTheDocument();
    expect(screen.getByText(COPY.ru.faq.items[0].q)).toBeInTheDocument();
    window.localStorage.removeItem('qr-locale');
  });

  it('embeds WebApplication JSON-LD in the prerendered markup', () => {
    render(<Home />);
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script?.textContent ?? '');
    expect(data['@type']).toBe('WebApplication');
    expect(data.applicationCategory).toBe('UtilitiesApplication');
    expect(data.url).toBe('https://qr.w-app.online/');
    expect(data.offers).toEqual({ '@type': 'Offer', price: 0, priceCurrency: 'USD' });
  });
});