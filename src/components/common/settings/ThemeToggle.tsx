'use client';

import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useSyncExternalStore, type ComponentType, type ReactNode, type SVGProps } from 'react';

import { IcMonitor, IcMoon, IcSun } from '@/src/components/common/icons';
import { cn } from '@/src/utils/cn';

const emptySubscribe = () => () => {};

const OPTIONS = [
  { value: 'light', key: 'themeLight', Icon: IcSun },
  { value: 'dark', key: 'themeDark', Icon: IcMoon },
  { value: 'system', key: 'themeSystem', Icon: IcMonitor },
] as const satisfies ReadonlyArray<{
  value: string;
  key: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}>;

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
        'flex cursor-pointer items-center justify-center rounded-full px-6 py-1.5 sm:px-7 sm:py-2',
        active ? 'dark:bg-indigo-dark-300 bg-white shadow-md' : 'bg-transparent',
      )}
    >
      {children}
    </button>
  );
}

export default function ThemeToggle() {
  const t = useTranslations('settings');
  const { theme, setTheme } = useTheme();
  // 서버/하이드레이션 시점엔 테마를 알 수 없으므로 마운트 후에만 활성 탭을 표시한다.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const current = mounted ? theme : undefined;

  return (
    <div
      role="radiogroup"
      aria-label={t('darkMode')}
      className="dark:bg-indigo-dark-100 flex w-fit items-center gap-1.5 rounded-full bg-slate-50 p-1.5 sm:gap-2 sm:p-2"
    >
      {OPTIONS.map(({ value, key, Icon }) => {
        const active = current === value;
        return (
          <ToggleTab key={value} label={t(key)} active={active} onClick={() => setTheme(value)}>
            <Icon
              className={cn(
                'size-5 sm:size-6',
                active ? 'text-slate-600 dark:text-white' : 'text-slate-400 dark:text-white/40',
              )}
            />
          </ToggleTab>
        );
      })}
    </div>
  );
}
