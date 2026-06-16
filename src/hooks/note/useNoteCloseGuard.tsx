import NoteCancelConfirm from '@/src/components/note/todo-note/NoteCancelConfirm';
import { useModalStore } from '@/src/stores/modal';

export interface UseNoteCloseGuardParams {
  editing: boolean;
  isDirty: boolean;
  isCreate: boolean;
  /** 편집 모드 이탈: edit→goDetail, create→closeNote */
  onCancel: () => void;
  /** 읽기 모드 닫기: closeNote */
  onClose: () => void;
}

export interface NoteCloseGuard {
  /** read면 onClose, editing이면 dirty시 확인 모달·아니면 즉시 onCancel */
  requestClose: () => void;
}

function openCancelConfirm(isCreate: boolean, onCancel: () => void) {
  useModalStore.getState().open(
    (controls) => (
      <NoteCancelConfirm
        isCreate={isCreate}
        onStay={controls.close}
        onLeave={() => {
          controls.close();
          onCancel();
        }}
      />
    ),
    { variant: 'modal', className: 'h-[178px] sm:h-[250px]' },
  );
}

// NoteWorkspace의 닫기/취소 dirty 판단과 확인 모달을 전담한다.
// ESC 이벤트 트리거는 NoteDrawer가 소유하고, 이 훅이 노출하는 requestClose를
// ref를 통해 드로어가 호출하는 방식으로 연결된다.
export function useNoteCloseGuard({
  editing,
  isDirty,
  isCreate,
  onCancel,
  onClose,
}: UseNoteCloseGuardParams): NoteCloseGuard {
  const requestClose = () => {
    if (!editing) {
      onClose();
      return;
    }
    if (!isDirty) {
      onCancel();
      return;
    }
    openCancelConfirm(isCreate, onCancel);
  };

  return { requestClose };
}
