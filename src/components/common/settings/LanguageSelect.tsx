'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcChevron } from '@/src/components/common/icons';

const LANGUAGES = ['English', '日本語', '한국어'] as const;
type Language = (typeof LANGUAGES)[number];

const DEFAULT_LANGUAGE: Language = '한국어';

export default function LanguageSelect() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [open, setOpen] = useState(false);
  const t = useTranslations('settings');

  return (
    <Dropdown open={open} onOpenChange={setOpen} className="w-full">
      <Dropdown.Trigger
        asChild
        className="flex w-full cursor-pointer items-center gap-2 rounded border border-slate-300 bg-white p-3 text-left sm:p-4"
      >
        <button type="button" aria-label={t('language')}>
          <span className="flex-1 text-sm text-slate-700 sm:text-base">{language}</span>
          <IcChevron direction={open ? 'up' : 'down'} className="size-6 shrink-0 text-slate-400" />
        </button>
      </Dropdown.Trigger>
      <Dropdown.Menu size="full">
        {LANGUAGES.map((lang) => (
          <Dropdown.Item key={lang} selected={lang === language} onClick={() => setLanguage(lang)}>
            {lang}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
