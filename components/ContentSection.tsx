'use client';

import type { Action } from '@/lib/actions';
import type { ValidationErrorKey } from '@/lib/validate';
import type { ContentField, QrType, Settings } from '@/lib/types';
import { useLocale } from './i18n';
import { inputClass } from './content/forms';
import { VCardForm } from './content/VCardForm';
import { WifiForm } from './content/WifiForm';
import { EventForm } from './content/EventForm';
import { SmsForm } from './content/SmsForm';

const TYPES: { id: QrType; icon: string }[] = [
  { id: 'link', icon: '🔗' },
  { id: 'text', icon: '≡' },
  { id: 'email', icon: '✉' },
  { id: 'call', icon: '☎' },
  { id: 'vcard', icon: '👤' },
  { id: 'wifi', icon: '📶' },
  { id: 'event', icon: '📅' },
  { id: 'sms', icon: '💬' },
  { id: 'social', icon: '🌐' },
  { id: 'pdf', icon: '📄' },
  { id: 'appstore', icon: '📱' },
];

export function ContentSection({ settings, dispatch, error }: {
  settings: Settings;
  dispatch(action: Action): void;
  error: ValidationErrorKey | null;
}) {
  const { content } = settings;
  const { copy } = useLocale();
  const set = (field: ContentField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    dispatch({ type: 'setField', field, value: e.target.value });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {TYPES.map(({ id, icon }) => (
          <button
            key={id}
            onClick={() => dispatch({ type: 'setQrType', qrType: id })}
            className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${
              content.type === id
                ? 'border-[#7b5cd6] bg-[#7b5cd6]/10 text-[#23234f]'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            <span aria-hidden>{icon}</span> {copy.content.types[id]}
          </button>
        ))}
      </div>

      {(content.type === 'link' || content.type === 'social' || content.type === 'pdf' || content.type === 'appstore') && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          {copy.content.linkLabel}
          <input
            type="text"
            placeholder="https://"
            value={content.link}
            onChange={set('link')}
            className={inputClass}
          />
          {content.type !== 'link' && (
            <p className="text-xs text-gray-500">{copy.content.presetHelp[content.type]}</p>
          )}
        </label>
      )}

      {content.type === 'text' && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          {copy.content.textLabel}
          <textarea rows={4} value={content.text} onChange={set('text')} className={inputClass} />
        </label>
      )}

      {content.type === 'email' && (
        <div className="flex flex-col gap-3 text-sm font-medium">
          <label className="flex flex-col gap-1">
            {copy.content.to}
            <input type="email" value={content.email.to} onChange={set('emailTo')} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            {copy.content.subject}
            <input type="text" value={content.email.subject} onChange={set('emailSubject')} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            {copy.content.body}
            <textarea rows={3} value={content.email.body} onChange={set('emailBody')} className={inputClass} />
          </label>
        </div>
      )}

      {content.type === 'call' && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          {copy.content.phoneLabel}
          <input type="tel" placeholder="+1 555 010 2030" value={content.phone} onChange={set('phone')} className={inputClass} />
        </label>
      )}

      {content.type === 'vcard' && (
        <VCardForm settings={settings} dispatch={dispatch} />
      )}

      {content.type === 'wifi' && (
        <WifiForm settings={settings} dispatch={dispatch} />
      )}

      {content.type === 'event' && (
        <EventForm settings={settings} dispatch={dispatch} />
      )}

      {content.type === 'sms' && (
        <SmsForm settings={settings} dispatch={dispatch} />
      )}

      {error && <p className="text-sm text-red-600" role="alert">{copy.validation[error]}</p>}
    </div>
  );
}