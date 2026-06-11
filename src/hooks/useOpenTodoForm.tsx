import TodoCreateContainer from '@/src/components/todo/TodoCreateContainer';
import TodoExitConfirm from '@/src/components/todo/TodoExitConfirm';
import TodoUpdateContainer from '@/src/components/todo/TodoUpdateContainer';
import { useModalStore } from '@/src/stores/modal';
import type { Todo } from '@/src/types/todo';

export type OpenTodoFormArgs = { mode: 'create'; defaultGoalId?: number } | { mode: 'update'; todo: Todo };

// 할 일 생성/수정 폼을 모달 스택으로 여는 훅.
export function useOpenTodoForm() {
  return (args: OpenTodoFormArgs) => {
    const { open } = useModalStore.getState();

    const requestCancel = () =>
      open((confirm) => <TodoExitConfirm onStay={confirm.close} onLeave={confirm.closeWithParent} />, {
        variant: 'modal',
        className: 'w-[400px] pt-8 pb-6 sm:w-[400px] sm:pt-10 sm:pb-8',
      });

    open(
      (form) =>
        args.mode === 'create' ? (
          <TodoCreateContainer defaultGoalId={args.defaultGoalId} onClose={form.close} onCancel={requestCancel} />
        ) : (
          <TodoUpdateContainer todo={args.todo} onClose={form.close} onCancel={requestCancel} />
        ),
      // ESC·백드롭으로도 닫기에 반응하되, 작성 내용 보호를 위해 곧장 닫지 않고 이탈 확인을 띄운다.
      { variant: 'auto', onClose: requestCancel },
    );
  };
}
