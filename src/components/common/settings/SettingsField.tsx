import type { ReactNode } from 'react';

export default function SettingsField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="px-1 text-sm font-semibold text-slate-700 sm:text-base">{label}</span>
      {children}
    </div>
  );
}
