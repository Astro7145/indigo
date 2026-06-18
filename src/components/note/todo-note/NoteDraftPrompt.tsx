import { useTranslations } from 'next-intl';

import Modal from '@/src/components/common/modal/Modal';

interface NoteDraftPromptProps {
  /** "새로 쓰기" — 초안은 그대로 두고 프롬프트만 닫는다 */
  onDismiss: () => void;
  /** "불러오기" — 저장된 초안을 적용한다 */
  onConfirm: () => void;
}

// 임시저장된 초안 불러오기 확인 다이얼로그. Modal shell(ModalStack)이 씌워주므로 내용만 담는다.
export default function NoteDraftPrompt({ onDismiss, onConfirm }: NoteDraftPromptProps) {
  const t = useTranslations('note');

  return (
    <>
      <Modal.Title className="text-center text-base sm:text-xl">{t('draftPrompt.title')}</Modal.Title>
      <p className="mt-1 mb-6 text-center text-xs font-medium text-slate-500 sm:mb-10 sm:text-base">
        {t('draftPrompt.description')}
      </p>
      <Modal.Actions>
        <Modal.Cancel className="h-10 w-[151.5px] sm:h-14 sm:w-[190px]" onClick={onDismiss}>
          {t('draftPrompt.new')}
        </Modal.Cancel>
        <Modal.Confirm className="h-10 w-[151.5px] sm:h-14 sm:w-[190px]" onClick={onConfirm}>
          {t('draftPrompt.load')}
        </Modal.Confirm>
      </Modal.Actions>
    </>
  );
}
