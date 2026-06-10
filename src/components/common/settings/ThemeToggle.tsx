'use client';

import { useState, type ReactNode } from 'react';

import { IcMoon, IcSun } from '@/src/components/common/icons';
import { cn } from '@/src/utils/cn';

type Theme = 'light' | 'dark';

interface ToggleTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToggleTab({ label, active, onClick, children }: ToggleTabProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-label={label}
      aria-checked={active}
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-center justify-center rounded-full px-8 py-1.5 transition-colors sm:px-9.5 sm:py-2',
        active ? 'bg-white shadow-md' : 'bg-transparent',
      )}
    >
      {children}
    </button>
  );
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <div
      role="radiogroup"
      aria-label="다크모드"
      className="flex w-fit items-center gap-1.5 rounded-full bg-slate-50 p-1.5 sm:gap-2 sm:p-2"
    >
      <ToggleTab label="라이트 모드" active={theme === 'light'} onClick={() => setTheme('light')}>
        <IcSun className={cn('size-5 sm:size-6', theme === 'light' ? 'text-slate-600' : 'text-slate-400')} />
      </ToggleTab>
      <ToggleTab label="다크 모드" active={theme === 'dark'} onClick={() => setTheme('dark')}>
        <IcMoon className={cn('size-5 sm:size-6', theme === 'dark' ? 'text-slate-600' : 'text-slate-400')} />
      </ToggleTab>
    </div>
  );
}
