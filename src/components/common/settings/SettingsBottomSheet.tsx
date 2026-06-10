'use client';

import BottomSheet from '@/src/components/common/BottomSheet';
import Button from '@/src/components/common/buttons/Button';
import { useSettingsModalStore } from '@/src/stores/settingsModal';

import LanguageSelect from './LanguageSelect';
import SettingsField from './SettingsField';
import ThemeToggle from './ThemeToggle';

export default function SettingsBottomSheet() {
  const isOpen = useSettingsModalStore((s) => s.isOpen);
  const close = useSettingsModalStore((s) => s.close);

  return (
    <BottomSheet isOpen={isOpen} onClose={close}>
      <div role="dialog" aria-label="설정" className="flex flex-col gap-8">
        <h2 className="text-lg font-semibold text-slate-800">설정</h2>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <SettingsField label="언어">
              <LanguageSelect />
            </SettingsField>
            <SettingsField label="다크모드">
              <ThemeToggle />
            </SettingsField>
          </div>

          <div className="flex w-full items-center gap-2 *:flex-1">
            <Button variant="tertiary" size="large" onClick={close}>
              취소
            </Button>
            <Button variant="primary" size="large" onClick={close}>
              확인
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
