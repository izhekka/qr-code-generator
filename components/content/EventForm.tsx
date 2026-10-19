'use client';

import type { Action } from '@/lib/actions';
import type { Settings } from '@/lib/types';
import { inputClass } from './forms';
import { useLocale } from '../i18n';

export function EventForm({ settings, dispatch }: {
  settings: Settings;
  dispatch(action: Action): void;
}) {
  const { copy } = useLocale();
  const labels = copy.content.event;
  const ev = settings.content.event;
  const set = (patch: Partial<typeof ev>) =>
    dispatch({ type: 'setContentPatch', patch: { event: { ...ev, ...patch } } });

  return (
    <div className="flex flex-col gap-3 text-sm font-medium">
      <label className="flex flex-col gap-1">
        {labels.title}
        <input type="text" value={ev.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} />
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={ev.allDay} onChange={(e) => set({ allDay: e.target.checked })} />
        {labels.allDay}
      </label>
      <label className="flex flex-col gap-1">
        {labels.start}
        <input type={ev.allDay ? 'date' : 'datetime-local'} value={ev.start} onChange={(e) => set({ start: e.target.value })} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        {labels.end}
        <input type={ev.allDay ? 'date' : 'datetime-local'} value={ev.end} onChange={(e) => set({ end: e.target.value })} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        {labels.location}
        <input type="text" value={ev.location} onChange={(e) => set({ location: e.target.value })} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        {labels.description}
        <textarea rows={3} value={ev.description} onChange={(e) => set({ description: e.target.value })} className={inputClass} />
      </label>
    </div>
  );
}