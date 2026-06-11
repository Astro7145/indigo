'use client';

import { useTranslations } from 'next-intl';

import Modal from '@/src/components/common/modal/Modal';
import { useSettingsModalStore } from '@/src/stores/settingsModal';

import LanguageSelect from './LanguageSelect';
import SettingsField from './SettingsField';
import ThemeToggle from './ThemeToggle';

export default function SettingsModal() {
  const isOpen = useSettingsModalStore((s) => s.isOpen);
  const close = useSettingsModalStore((s) => s.close);
  const t = useTranslations('settings');
  const tc = useTranslations('common');

  return (
    <Modal open={isOpen} onClose={close} showCloseButton>
      <div className="flex flex-col gap-8">
        <Modal.Title>{t('title')}</Modal.Title>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <SettingsField label={t('language')}>
              <LanguageSelect />
            </SettingsField>
            <SettingsField label={t('darkMode')}>
              <ThemeToggle />
            </SettingsField>
          </div>

          <Modal.Actions>
            <Modal.Cancel>{tc('actions.cancel')}</Modal.Cancel>
            <Modal.Confirm onClick={close}>{tc('actions.confirm')}</Modal.Confirm>
          </Modal.Actions>
        </div>
      </div>
    </Modal>
  );
}
