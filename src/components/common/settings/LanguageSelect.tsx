'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';

import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcChevron } from '@/src/components/common/icons';
import { isValidLocale, routing, type Locale } from '@/src/i18n/routing';

type Language = 'English' | '日本語' | '한국어';

const LOCALE_LABELS: Record<Locale, Language> = {
  en: 'English',
  jp: '日本語',
  ko: '한국어',
};

const DEFAULT_LANGUAGE: Language = '한국어';

export default function LanguageSelect() {
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations('settings');

  const currentLabel = isValidLocale(locale) ? LOCALE_LABELS[locale] : DEFAULT_LANGUAGE;

  const getLocalePath = (targetLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = targetLocale;
    return segments.join('/');
  };

  return (
    <Dropdown open={open} onOpenChange={setOpen} className="w-full">
      <Dropdown.Trigger
        asChild
        className="flex w-full cursor-pointer items-center gap-2 rounded border border-slate-300 bg-white p-3 text-left sm:p-4"
      >
        <button type="button" aria-label={t('language')}>
          <span className="flex-1 text-sm text-slate-700 sm:text-base">{currentLabel}</span>
          <IcChevron direction={open ? 'up' : 'down'} className="size-6 shrink-0 text-slate-400" />
        </button>
      </Dropdown.Trigger>
      <Dropdown.Menu size="full">
        {routing.locales.map((loc) => (
          <Dropdown.Item key={loc} selected={loc === locale}>
            <Link href={getLocalePath(loc)} className="block w-full">
              {LOCALE_LABELS[loc]}
            </Link>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
