'use client';

import { useTranslations } from 'next-intl';

import BottomSheet from '@/src/components/common/BottomSheet';
import Button from '@/src/components/common/buttons/Button';
import { useSettingsModalStore } from '@/src/stores/settingsModal';

import LanguageSelect from './LanguageSelect';
import SettingsField from './SettingsField';
import ThemeToggle from './ThemeToggle';

export default function SettingsBottomSheet() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const isOpen = useSettingsModalStore((s) => s.isOpen);
  const close = useSettingsModalStore((s) => s.close);

  return (
    <BottomSheet isOpen={isOpen} onClose={close}>
      <div role="dialog" aria-label={t('title')} className="flex flex-col gap-8">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{t('title')}</h2>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <SettingsField label={t('language')}>
              <LanguageSelect />
            </SettingsField>
            <SettingsField label={t('darkMode')}>
              <ThemeToggle />
            </SettingsField>
          </div>

          <div className="flex w-full items-center gap-2 *:flex-1">
            <Button
              variant="tertiary"
              size="large"
              onClick={close}
              className="dark:border-white/20 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
            >
              {tCommon('actions.close')}
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
