// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { ContentSection } from './ContentSection';
import type { ValidationErrorKey } from '@/lib/validate';
import type { Action } from '@/lib/actions';
import type { Settings } from '@/lib/types';

const dispatch = vi.fn<(action: Action) => void>();
const renderSection = (error: ValidationErrorKey | null = null, state: Settings = DEFAULT_SETTINGS) =>
  render(<ContentSection settings={state} dispatch={dispatch} error={error} />);

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

  it('dispatches vCard field patches from the contact form', async () => {
    const { rerender } = renderSection();
    await userEvent.click(screen.getByRole('button', { name: 'Contact' }));
    const vcard = { ...DEFAULT_SETTINGS.content, type: 'vcard' as const };
    rerender(<ContentSection settings={{ ...DEFAULT_SETTINGS, content: vcard }} dispatch={dispatch} error={null} />);

    await userEvent.type(screen.getByLabelText('First name'), 'A');
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setContentPatch',
      patch: { vcard: { firstName: 'A', lastName: '', org: '', title: '', phone: '', email: '', website: '', address: '' } },
    });
  });

  it('dispatches security changes from the Wi-Fi form', async () => {
    const { rerender } = renderSection();
    await userEvent.click(screen.getByRole('button', { name: 'Wi-Fi' }));
    const wifi = { ...DEFAULT_SETTINGS.content, type: 'wifi' as const };
    rerender(<ContentSection settings={{ ...DEFAULT_SETTINGS, content: wifi }} dispatch={dispatch} error={null} />);

    expect(screen.getByLabelText('Network name (SSID)')).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Security'), 'nopass');
    expect(dispatch.mock.calls.at(-1)).toEqual([
      { type: 'setContentPatch', patch: { wifi: { ssid: '', password: '', security: 'nopass', hidden: false } } },
    ]);
  });

  it('hides the password field when the network is open', () => {
    const state = structuredClone(DEFAULT_SETTINGS);
    state.content.type = 'wifi';
    state.content.wifi.security = 'nopass';
    renderSection(null, state);
    expect(screen.getByLabelText('Network name (SSID)')).toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });

  it('switches the event times to plain dates for all-day events', async () => {
    const { rerender } = renderSection();
    await userEvent.click(screen.getByRole('button', { name: 'Event' }));
    const event = { ...DEFAULT_SETTINGS.content, type: 'event' as const };
    rerender(<ContentSection settings={{ ...DEFAULT_SETTINGS, content: event }} dispatch={dispatch} error={null} />);

    expect(screen.getByLabelText('Starts')).toHaveAttribute('type', 'datetime-local');
    await userEvent.click(screen.getByLabelText('All day'));
    expect(dispatch.mock.calls.at(-1)).toEqual([
      { type: 'setContentPatch', patch: { event: { title: '', start: '', end: '', allDay: true, location: '', description: '' } } },
    ]);
  });

  it('dispatches SMS form values', async () => {
    const { rerender } = renderSection();
    await userEvent.click(screen.getByRole('button', { name: 'SMS' }));
    const sms = { ...DEFAULT_SETTINGS.content, type: 'sms' as const };
    rerender(<ContentSection settings={{ ...DEFAULT_SETTINGS, content: sms }} dispatch={dispatch} error={null} />);

    await userEvent.type(screen.getByLabelText('Phone number'), '5');
    expect(dispatch.mock.calls.at(-1)).toEqual([
      { type: 'setContentPatch', patch: { sms: { phone: '5', message: '' } } },
    ]);
  });

  it('shows preset helper text under the link input', async () => {
    const { rerender } = renderSection();
    for (const [name, help, id] of [
      ['Social', 'Paste your Linktree, Instagram or other profile page URL.', 'social'],
      ['PDF', 'Paste the URL of a hosted PDF file.', 'pdf'],
      ['App', 'Paste the Google Play or App Store URL.', 'appstore'],
    ] as const) {
      await userEvent.click(screen.getByRole('button', { name }));
      const content = { ...DEFAULT_SETTINGS.content, type: id };
      rerender(<ContentSection settings={{ ...DEFAULT_SETTINGS, content }} dispatch={dispatch} error={null} />);

      expect(screen.getByPlaceholderText('https://')).toBeInTheDocument();
      expect(screen.getByText(help)).toBeInTheDocument();
      await userEvent.type(screen.getByPlaceholderText('https://'), 'a');
      expect(dispatch).toHaveBeenCalledWith({ type: 'setField', field: 'link', value: 'a' });
    }
  });
});