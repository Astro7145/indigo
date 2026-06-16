'use client';

import Modal from '@/src/components/common/modal/Modal';
import { useSettingsModalStore } from '@/src/stores/settingsModal';

import LanguageSelect from './LanguageSelect';
import SettingsField from './SettingsField';
import ThemeToggle from './ThemeToggle';

export default function SettingsModal() {
  const isOpen = useSettingsModalStore((s) => s.isOpen);
  const close = useSettingsModalStore((s) => s.close);

  return (
    <Modal open={isOpen} onClose={close} showCloseButton className="dark:bg-indigo-dark-300">
      <div className="flex flex-col gap-8">
        <Modal.Title className="dark:text-white">설정</Modal.Title>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <SettingsField label="언어">
              <LanguageSelect />
            </SettingsField>
            <SettingsField label="다크모드">
              <ThemeToggle />
            </SettingsField>
          </div>

          <Modal.Actions>
            <Modal.Cancel className="dark:border-white/20 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white">
              닫기
            </Modal.Cancel>
          </Modal.Actions>
        </div>
      </div>
    </Modal>
  );
}
