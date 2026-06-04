'use client';

import BottomSheet from '@/src/components/common/BottomSheet';
import Modal from '@/src/components/common/modal/Modal';
import TodoDetailContent from '@/src/components/todo/TodoDetailContent';
import { useIsMobile } from '@/src/hooks/useIsMobile';
import type { Todo } from '@/src/types/todo';

interface TodoDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
}

/**
 * 할일 상세를 데스크탑은 모달, 모바일은 바텀시트로 표시하는 반응형 셸.
 *
 * 셸은 상시 마운트하고 `isOpen`만 토글한다(TodoFormSheet와 동일). 닫는 동안(todo=null)
 * content는 null이 되지만, 바텀시트의 exit는 AnimatePresence가 직전 subtree를 보존해 재생한다.
 * 노트 페치는 내부 TodoDetailContent가 담당한다.
 */
export default function TodoDetailSheet({ isOpen, onClose, todo }: TodoDetailSheetProps) {
  const isMobile = useIsMobile();

  const content = todo ? <TodoDetailContent todo={todo} onClose={onClose} /> : null;

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        {content}
      </BottomSheet>
    );
  }

  // Modal 기본 패딩을 디자인의 p-40(상하좌우 균일)으로 덮어쓴다.
  // Modal은 base(pt-12…)와 sm:(sm:pt-16…) 두 변형을 모두 가지므로, base+sm 둘 다 override해야 한다(p-10 sm:p-10).
  return (
    <Modal open={isOpen} onClose={onClose} className="p-10 sm:p-10">
      {content}
    </Modal>
  );
}
