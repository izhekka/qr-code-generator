// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { ContentSection } from './ContentSection';
import type { ValidationErrorKey } from '@/lib/validate';
import type { Action } from '@/lib/actions';

const dispatch = vi.fn<(action: Action) => void>();
const renderSection = (error: ValidationErrorKey | null = null) =>
  render(<ContentSection settings={DEFAULT_SETTINGS} dispatch={dispatch} error={error} />);

describe('ContentSection', () => {
  it('dispatches setField when a link is typed', async () => {
    renderSection();
    await userEvent.type(screen.getByPlaceholderText('https://'), 'a');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setField', field: 'link', value: 'a' });
  });

  it('dispatches setQrType when a type chip is clicked', async () => {
    renderSection();
    await userEvent.click(screen.getByRole('button', { name: /call/i }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'setQrType', qrType: 'call' });
  });

  it('switches the form fields and dispatches per-type fields', async () => {
    const { rerender } = renderSection();
    await userEvent.click(screen.getByRole('button', { name: /e-mail/i }));
    const email = { ...DEFAULT_SETTINGS.content, type: 'email' as const };
    rerender(<ContentSection settings={{ ...DEFAULT_SETTINGS, content: email }} dispatch={dispatch} error={null} />);

    await userEvent.type(screen.getByLabelText('To'), 'x');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setField', field: 'emailTo', value: 'x' });
    await userEvent.type(screen.getByLabelText('Subject'), 'y');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setField', field: 'emailSubject', value: 'y' });
    await userEvent.type(screen.getByLabelText('Body'), 'z');
    expect(dispatch).toHaveBeenCalledWith({ type: 'setField', field: 'emailBody', value: 'z' });
  });

  it('renders the validation error in an alert role', () => {
    renderSection('enterUrl');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a URL to generate your QR code.');
  });
});