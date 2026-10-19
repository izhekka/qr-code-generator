'use client';

import type { Action } from '@/lib/actions';
import type { Settings } from '@/lib/types';
import { inputClass } from './forms';
import { useLocale } from '../i18n';

export function SmsForm({ settings, dispatch }: {
  settings: Settings;
  dispatch(action: Action): void;
}) {
  const { copy } = useLocale();
  const labels = copy.content.sms;
  const sms = settings.content.sms;
  const set = (patch: Partial<typeof sms>) =>
    dispatch({ type: 'setContentPatch', patch: { sms: { ...sms, ...patch } } });

  return (
    <div className="flex flex-col gap-3 text-sm font-medium">
      <label className="flex flex-col gap-1">
        {labels.phone}
        <input type="tel" value={sms.phone} onChange={(e) => set({ phone: e.target.value })} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        {labels.message}
        <textarea rows={3} value={sms.message} onChange={(e) => set({ message: e.target.value })} className={inputClass} />
      </label>
    </div>
  );
}