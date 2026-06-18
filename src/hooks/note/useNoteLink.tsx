import NoteLinkInput from '@/src/components/note/todo-note/NoteLinkInput';
import { useModalStore } from '@/src/stores/modal';

export interface UseNoteLinkParams {
  linkUrl: string | null;
  setLinkUrl: (value: string | null) => void;
}

export interface NoteLink {
  /** 링크 입력 다이얼로그를 모달 스택에 띄운다(기존 링크가 있으면 prefill) */
  openInput: () => void;
  /** 첨부된 링크를 제거한다 */
  remove: () => void;
}

// NoteWorkspace의 링크 첨부 입력 UI(모달 스택 연동)를 전담한다.
// linkUrl 데이터 자체(dirty 판정 포함)는 useNoteDraft가 책임진다.
export function useNoteLink({ linkUrl, setLinkUrl }: UseNoteLinkParams): NoteLink {
  const openInput = () => {
    useModalStore.getState().open(
      (controls) => (
        <NoteLinkInput
          initialUrl={linkUrl ?? ''}
          onConfirm={(url) => {
            setLinkUrl(url);
            controls.close();
          }}
          onClose={controls.close}
        />
      ),
      // 모달 셸의 기본 패딩은 닫기 버튼 없는 확인 팝업 전제(비대칭)라, 이 다이얼로그는
      // 자체 닫기 버튼을 그리는 헤더형 레이아웃이므로 대칭 패딩(p-4/sm:p-8)으로 덮어쓴다.
      { variant: 'modal', className: 'h-[180px] p-4 sm:h-[260px] sm:p-8' },
    );
  };

  return { openInput, remove: () => setLinkUrl(null) };
}
