'use client';

import type { ReactNode } from 'react';

export function ColorPicker({ value, onChange, label }: {
  value: string;
  onChange(value: string): void;
  label: string;
  }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      <span>{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
        />
        <input
          type="text"
          aria-label={`${label} hex`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#7b5cd6] focus:outline-none"
        />
      </span>
    </label>
  );
}

export function Toggle({ checked, onChange, label }: {
  checked: boolean;
  onChange(checked: boolean): void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#7b5cd6]"
      />
      {label}
    </label>
  );
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}