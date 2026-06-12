import Modal from '@/src/components/common/modal/Modal';

interface NoteCancelConfirmProps {
  /** create 모드면 "작성", 아니면 "수정" 문구를 쓴다 */
  isCreate: boolean;
  /** "취소" — 작성/수정으로 돌아간다 */
  onStay: () => void;
  /** "확인" — 작성 내용을 버리고 취소한다 */
  onLeave: () => void;
}

// 노트 작성/수정 취소 확인 다이얼로그. Modal shell(ModalStack)이 씌워주므로 내용만 담는다.
export default function NoteCancelConfirm({ isCreate, onStay, onLeave }: NoteCancelConfirmProps) {
  return (
    <>
      <Modal.Title className="text-center text-base sm:text-xl">
        {isCreate ? '노트 작성을 취소하시겠어요?' : '노트 수정을 취소하시겠어요?'}
      </Modal.Title>
      <p className="mt-1 mb-6 flex items-center justify-center gap-1 text-xs font-medium text-red-500 sm:mb-10 sm:text-base">
        <span
          aria-hidden
          className="inline-flex size-4 items-center justify-center rounded-full border border-red-500 text-[10px] sm:size-5 sm:text-xs"
        >
          !
        </span>
        작성하신 모든 내용이 사라집니다.
      </p>
      <Modal.Actions>
        <Modal.Cancel className="h-10 w-[151.5px] sm:h-14 sm:w-[190px]" onClick={onStay}>
          취소
        </Modal.Cancel>
        <Modal.Confirm className="h-10 w-[151.5px] sm:h-14 sm:w-[190px]" onClick={onLeave}>
          확인
        </Modal.Confirm>
      </Modal.Actions>
    </>
  );
}
