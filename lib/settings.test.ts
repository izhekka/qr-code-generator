import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, settingsReducer } from './settings';

describe('settingsReducer', () => {
  it('sets the qr type and keeps field values', () => {
    const next = settingsReducer(DEFAULT_SETTINGS, { type: 'setQrType', qrType: 'email' });
    expect(next.content.type).toBe('email');
  });

  it('sets simple content fields', () => {
    const next = settingsReducer(DEFAULT_SETTINGS, { type: 'setField', field: 'link', value: 'example.com' });
    expect(next.content.link).toBe('example.com');
  });

  it('sets text and phone content fields', () => {
    let s = settingsReducer(DEFAULT_SETTINGS, { type: 'setField', field: 'text', value: 'hi' });
    expect(s.content.text).toBe('hi');
    s = settingsReducer(s, { type: 'setField', field: 'phone', value: '+1555' });
    expect(s.content.phone).toBe('+1555');
  });

  it('sets e-mail subfields', () => {
    let s = settingsReducer(DEFAULT_SETTINGS, { type: 'setField', field: 'emailTo', value: 'a@b.com' });
    expect(s.content.email.to).toBe('a@b.com');
    s = settingsReducer(s, { type: 'setField', field: 'emailSubject', value: 'Hi' });
    expect(s.content.email.subject).toBe('Hi');
    s = settingsReducer(s, { type: 'setField', field: 'emailBody', value: 'Yo' });
    expect(s.content.email.body).toBe('Yo');
    expect(s.content.text).toBe('');
  });

  it('patches nested content groups wholesale', () => {
    const next = settingsReducer(DEFAULT_SETTINGS, {
      type: 'setContentPatch',
      patch: { wifi: { ssid: 'home', password: 'pw', security: 'WEP', hidden: true } },
    });
    expect(next.content.wifi).toEqual({ ssid: 'home', password: 'pw', security: 'WEP', hidden: true });
    expect(next.content.vcard.firstName).toBe('');
    expect(next.content.event.allDay).toBe(false);
  });

  it('sets new-type fields via content patches', () => {
    let next = settingsReducer(DEFAULT_SETTINGS, {
      type: 'setContentPatch',
      patch: { vcard: { ...DEFAULT_SETTINGS.content.vcard, firstName: 'Ada' } },
    });
    expect(next.content.vcard.firstName).toBe('Ada');
    next = settingsReducer(next, { type: 'setContentPatch', patch: { event: { ...next.content.event, start: '2026-03-01T09:00', allDay: true } } });
    expect(next.content.event.start).toBe('2026-03-01T09:00');
    expect(next.content.event.allDay).toBe(true);
  });

  it('updates logo size without touching other settings', () => {
    const s = settingsReducer({ ...DEFAULT_SETTINGS, stickerId: 'phone' }, {
      type: 'setLogo', patch: { size: 0.4 },
    });
    expect(s.logo).toEqual({ dataUrl: null, size: 0.4 });
    expect(s.stickerId).toBe('phone');
  });

  it('patches pattern, corners, logo, download independently', () => {
    let s = settingsReducer(DEFAULT_SETTINGS, { type: 'setPattern', patch: { gradient: true } });
    expect(s.pattern.gradient).toBe(true);
    s = settingsReducer(s, { type: 'setCorners', patch: { dotType: 'dot' } });
    expect(s.corners.dotType).toBe('dot');
    s = settingsReducer(s, { type: 'setLogo', patch: { dataUrl: 'data:image/png;base64,AAA' } });
    expect(s.logo.dataUrl).toBe('data:image/png;base64,AAA');
    s = settingsReducer(s, { type: 'setDownload', patch: { size: 2048 } });
    expect(s.download.size).toBe(2048);
    expect(s.logo.dataUrl).toBe('data:image/png;base64,AAA');
  });

  it('sets and clears the sticker', () => {
    let s = settingsReducer(DEFAULT_SETTINGS, { type: 'setSticker', stickerId: 'phone' });
    expect(s.stickerId).toBe('phone');
    s = settingsReducer(s, { type: 'setSticker', stickerId: null });
    expect(s.stickerId).toBeNull();
  });

  it('patches sticker colors independently from each other', () => {
    expect(DEFAULT_SETTINGS.sticker).toEqual({ color: '#000000', textColor: '#000000' });
    let s = settingsReducer(DEFAULT_SETTINGS, { type: 'setStickerStyle', patch: { color: '#0a7d2c' } });
    expect(s.sticker).toEqual({ color: '#0a7d2c', textColor: '#000000' });
    s = settingsReducer(s, { type: 'setStickerStyle', patch: { textColor: '#7b5cd6' } });
    expect(s.sticker).toEqual({ color: '#0a7d2c', textColor: '#7b5cd6' });
  });

  it('defaults every ink color to black, background stays white', () => {
    expect(DEFAULT_SETTINGS.pattern.color).toBe('#000000');
    expect(DEFAULT_SETTINGS.pattern.colorFrom).toBe('#000000');
    expect(DEFAULT_SETTINGS.pattern.colorTo).toBe('#000000');
    expect(DEFAULT_SETTINGS.pattern.bgColor).toBe('#ffffff');
    expect(DEFAULT_SETTINGS.corners).toEqual({ squareType: 'square', squareColor: '#000000', dotType: 'square', dotColor: '#000000' });
  });
});