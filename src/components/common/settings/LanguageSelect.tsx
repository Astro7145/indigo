'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcChevron } from '@/src/components/common/icons';
import { setUserLocale } from '@/src/i18n/locale';
import { locales, type Locale } from '@/src/i18n/routing';

// 언어명은 각 언어의 자기표기(autonym)로 고정 — 번역 대상이 아니다.
const LANGUAGE_LABELS: Record<Locale, string> = {
  en: 'English',
  jp: '日本語',
  ko: '한국어',
};

export default function LanguageSelect() {
  const activeLocale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleSelect = (locale: Locale) => {
    if (locale === activeLocale) return;
    // 쿠키 갱신 후 서버 컴포넌트를 재렌더해 새 locale을 반영한다.
    startTransition(async () => {
      await setUserLocale(locale);
      router.refresh();
    });
  };

  return (
    <Dropdown open={open} onOpenChange={setOpen} className="w-full">
      <Dropdown.Trigger
        asChild
        className="flex w-full cursor-pointer items-center gap-2 rounded border border-slate-300 bg-white p-3 text-left sm:p-4"
      >
        <button type="button" aria-label="언어">
          <span className="flex-1 text-sm text-slate-700 sm:text-base">{LANGUAGE_LABELS[activeLocale]}</span>
          <IcChevron direction={open ? 'up' : 'down'} className="size-6 shrink-0 text-slate-400" />
        </button>
      </Dropdown.Trigger>
      <Dropdown.Menu size="full">
        {locales.map((locale) => (
          <Dropdown.Item key={locale} selected={locale === activeLocale} onClick={() => handleSelect(locale)}>
            {LANGUAGE_LABELS[locale]}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
