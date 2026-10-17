// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { LocaleProvider, useLocale } from './i18n';

function ToggleButton() {
  const { locale, setLocale } = useLocale();
  return <button onClick={() => (locale === 'en' ? setLocale('ru') : setLocale('en'))}>{locale === 'en' ? 'to ru' : 'to en'}</button>;
}

function Probe() {
  const { locale, copy } = useLocale();
  return <p>{copy.hero.createCta} [{locale}]</p>;
}

function App() {
  return (
    <LocaleProvider>
      <ToggleButton />
      <Probe />
    </LocaleProvider>
  );
}

describe('LocaleProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = 'en';
  });

  it('defaults to en without stored locale', () => {
    render(<App />);
    expect(screen.getByText('Create Static QR [en]')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
  });

  it('applies a stored ru locale after mount and updates html lang', async () => {
    window.localStorage.setItem('qr-locale', 'ru');
    render(<App />);
    expect(await screen.findByText(/Создать QR-код \[ru\]/)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('ru');
  });

  it('setLocale persists to storage and back-navigation restores en', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'to ru' }));
    expect(screen.getByText(/Создать QR-код \[ru\]/)).toBeInTheDocument();
    expect(window.localStorage.getItem('qr-locale')).toBe('ru');
    fireEvent.click(screen.getByRole('button', { name: 'to en' }));
    expect(window.localStorage.getItem('qr-locale')).toBe('en');
  });

  it('ignores garbage stored values', () => {
    window.localStorage.setItem('qr-locale', 'de');
    render(<App />);
    expect(screen.getByText('Create Static QR [en]')).toBeInTheDocument();
  });

  it('uses a Russian system language on first visit', async () => {
    Object.defineProperty(window.navigator, 'language', { value: 'ru-RU', configurable: true });
    render(<App />);
    expect(await screen.findByText(/Создать QR-код \[ru\]/)).toBeInTheDocument();
  });

  it('a stored choice wins over the system language', async () => {
    Object.defineProperty(window.navigator, 'language', { value: 'ru-RU', configurable: true });
    window.localStorage.setItem('qr-locale', 'en');
    render(<App />);
    expect(await screen.findByText(/Create Static QR \[en\]/)).toBeInTheDocument();
  });
});