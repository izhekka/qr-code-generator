'use client';

import type { Action } from '@/lib/actions';
import type { Settings } from '@/lib/types';
import { inputClass } from './forms';
import { useLocale } from '../i18n';

export function VCardForm({ settings, dispatch }: {
  settings: Settings;
  dispatch(action: Action): void;
}) {
  const { copy } = useLocale();
  const labels = copy.content.vcard;
  const set = (field: keyof typeof labels) => (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({
      type: 'setContentPatch',
      patch: { vcard: { ...settings.content.vcard, [field]: e.target.value } },
    });

  return (
    <div className="flex flex-col gap-3 text-sm font-medium">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          {labels.firstName}
          <input type="text" value={settings.content.vcard.firstName} onChange={set('firstName')} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          {labels.lastName}
          <input type="text" value={settings.content.vcard.lastName} onChange={set('lastName')} className={inputClass} />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        {labels.org}
        <input type="text" value={settings.content.vcard.org} onChange={set('org')} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        {labels.title}
        <input type="text" value={settings.content.vcard.title} onChange={set('title')} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        {labels.phone}
        <input type="tel" value={settings.content.vcard.phone} onChange={set('phone')} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        {labels.email}
        <input type="email" value={settings.content.vcard.email} onChange={set('email')} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        {labels.website}
        <input type="text" value={settings.content.vcard.website} onChange={set('website')} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        {labels.address}
        <input type="text" value={settings.content.vcard.address} onChange={set('address')} className={inputClass} />
      </label>
    </div>
  );
}