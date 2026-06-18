import Modal from '@/src/components/common/modal/Modal';

interface GoalNavConfirmProps {
  goalTitle: string;
  /** 취소 — 그래프에 머무른다 */
  onCancel: () => void;
  /** 이동 — 목표 상세로 이동한다 */
  onConfirm: () => void;
}

// 목표 노드 클릭 시 바로 이동하지 않고 한 번 확인을 받는 다이얼로그. Modal shell은 ModalStack이 씌운다.
export default function GoalNavConfirm({ goalTitle, onCancel, onConfirm }: GoalNavConfirmProps) {
  return (
    <>
      <Modal.Title className="text-center">목표로 이동할까요?</Modal.Title>
      <p className="my-5 text-center text-sm text-slate-500">
        <span className="font-medium text-slate-700">{goalTitle}</span> 상세 화면으로 이동합니다.
      </p>
      <Modal.Actions className="mt-2">
        <Modal.Cancel onClick={onCancel}>취소</Modal.Cancel>
        <Modal.Confirm onClick={onConfirm}>이동</Modal.Confirm>
      </Modal.Actions>
    </>
  );
}
