'use client';

import type { Action } from '@/lib/actions';
import type { Settings, WifiSecurity } from '@/lib/types';
import { inputClass } from './forms';
import { useLocale } from '../i18n';

export function WifiForm({ settings, dispatch }: {
  settings: Settings;
  dispatch(action: Action): void;
}) {
  const { copy } = useLocale();
  const labels = copy.content.wifi;
  const w = settings.content.wifi;
  const set = (patch: Partial<typeof w>) =>
    dispatch({ type: 'setContentPatch', patch: { wifi: { ...w, ...patch } } });

  return (
    <div className="flex flex-col gap-3 text-sm font-medium">
      <label className="flex flex-col gap-1">
        {labels.ssid}
        <input type="text" value={w.ssid} onChange={(e) => set({ ssid: e.target.value })} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        {labels.security}
        <select
          value={w.security}
          onChange={(e) => set({ security: e.target.value as WifiSecurity })}
          className={inputClass}
        >
          <option value="WPA">{labels.showPassword}</option>
          <option value="WEP">WEP</option>
          <option value="nopass">{labels.open}</option>
        </select>
      </label>
      {w.security !== 'nopass' && (
        <label className="flex flex-col gap-1">
          {labels.password}
          <input type="text" value={w.password} onChange={(e) => set({ password: e.target.value })} className={inputClass} />
        </label>
      )}
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={w.hidden} onChange={(e) => set({ hidden: e.target.checked })} />
        {labels.hidden}
      </label>
    </div>
  );
}