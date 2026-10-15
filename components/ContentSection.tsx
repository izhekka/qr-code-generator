'use client';

import type { Action } from '@/lib/actions';
import type { ContentField, QrType, Settings } from '@/lib/types';

const TYPES: { id: QrType; icon: string }[] = [
  { id: 'link', icon: '🔗' },
  { id: 'text', icon: '≡' },
  { id: 'email', icon: '✉' },
  { id: 'call', icon: '☎' },
];

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7b5cd6] focus:outline-none';

export function ContentSection({ settings, dispatch, error }: {
  settings: Settings;
  dispatch(action: Action): void;
  error: string | null;
}) {
  const { content } = settings;
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
            <span aria-hidden>{icon}</span> {id === 'email' ? 'E-mail' : id}
          </button>
        ))}
      </div>

      {content.type === 'link' && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          Enter your Website
          <input
            type="text"
            placeholder="https://"
            value={content.link}
            onChange={set('link')}
            className={inputClass}
          />
        </label>
      )}

      {content.type === 'text' && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          Enter your text
          <textarea rows={4} value={content.text} onChange={set('text')} className={inputClass} />
        </label>
      )}

      {content.type === 'email' && (
        <div className="flex flex-col gap-3 text-sm font-medium">
          <label className="flex flex-col gap-1">
            To
            <input type="email" value={content.email.to} onChange={set('emailTo')} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            Subject
            <input type="text" value={content.email.subject} onChange={set('emailSubject')} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            Body
            <textarea rows={3} value={content.email.body} onChange={set('emailBody')} className={inputClass} />
          </label>
        </div>
      )}

      {content.type === 'call' && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          Phone number
          <input type="tel" placeholder="+1 555 010 2030" value={content.phone} onChange={set('phone')} className={inputClass} />
        </label>
      )}

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}