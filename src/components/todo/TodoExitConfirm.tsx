import { useTranslations } from 'next-intl';

import Modal from '@/src/components/common/modal/Modal';

interface TodoExitConfirmProps {
  /** "아니오" — 폼에 머무른다 */
  onStay: () => void;
  /** "예" — 작성 내용을 버리고 나간다 */
  onLeave: () => void;
}

// 할 일 폼에서 작성 중 이탈을 막는 확인 다이얼로그. Modal shell(ModalStack)이 씌워주므로 내용만 담는다.
export default function TodoExitConfirm({ onStay, onLeave }: TodoExitConfirmProps) {
  const tCommon = useTranslations('common');

  return (
    <>
      <Modal.Title className="text-center">{tCommon('discard.title')}</Modal.Title>
      <p className="my-5 text-center text-sm text-slate-500">{tCommon('discard.warning')}</p>
      <Modal.Actions className="mt-2">
        <Modal.Cancel onClick={onStay}>{tCommon('discard.cancel')}</Modal.Cancel>
        <Modal.Confirm onClick={onLeave}>{tCommon('discard.confirm')}</Modal.Confirm>
      </Modal.Actions>
    </>
  );
}
