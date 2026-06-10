import TodoCreateContainer from '@/src/components/todo/TodoCreateContainer';
import TodoExitConfirm from '@/src/components/todo/TodoExitConfirm';
import TodoUpdateContainer from '@/src/components/todo/TodoUpdateContainer';
import { useModalStore } from '@/src/stores/modal';
import type { Todo } from '@/src/types/todo';

export type OpenTodoFormArgs = { mode: 'create'; defaultGoalId?: number } | { mode: 'update'; todo: Todo };

// 할 일 생성/수정 폼을 모달 스택으로 여는 훅. 반환된 함수를 이벤트 핸들러에서 호출한다.
// variant 'auto'(모바일 BottomSheet / 데스크탑 Modal)는 ModalStack이 해석하고, 작성 중 이탈은
// 확인 다이얼로그를 폼 위에 쌓아 처리한다. ESC·백드롭으로는 닫히지 않게 하고(작성 내용 보호),
// 폼 내부 취소 버튼(onCancel)만 확인을 거친다. 닫기는 ModalStack이 주입하는 controls로 처리한다:
// 자기 닫기는 close(맨 위), 확인창의 "예"는 closeWithParent(위 2개 = 확인창 + 바로 아래 폼)라,
// 호출부가 폼 핸들을 들고 있을 필요가 없다.
export function useOpenTodoForm() {
  return (args: OpenTodoFormArgs) => {
    const { open } = useModalStore.getState();

    const requestCancel = () =>
      open((confirm) => <TodoExitConfirm onStay={confirm.close} onLeave={confirm.closeWithParent} />, {
        variant: 'modal',
        closeOnBackdropClick: false,
        // 기존 폼-이탈 확인 모달과 동일한 너비(400px)·패딩으로 Modal 기본값(456px)을 덮어쓴다.
        className: 'w-[400px] pt-8 pb-6 sm:w-[400px] sm:pt-10 sm:pb-8',
      });

    open(
      (form) =>
        args.mode === 'create' ? (
          <TodoCreateContainer defaultGoalId={args.defaultGoalId} onClose={form.close} onCancel={requestCancel} />
        ) : (
          <TodoUpdateContainer todo={args.todo} onClose={form.close} onCancel={requestCancel} />
        ),
      { variant: 'auto', closeOnEsc: false, closeOnBackdropClick: false },
    );
  };
}
