jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('@/src/api/note', () => ({
  ...jest.requireActual('@/src/api/note'),
  createNote: jest.fn(),
  patchNote: jest.fn(),
}));

jest.mock('@/src/api/link-preview', () => ({
  ...jest.requireActual('@/src/api/link-preview'),
  getLinkPreview: jest.fn(),
}));

// NoteContentEditor는 별도 테스트됨. 여기선 wiring만 보므로, 편집 모드는 textarea로,
// 읽기 모드는 본문 텍스트만 노출하는 가벼운 stub으로 대체한다.
jest.mock('./NoteContentEditor', () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    editable,
    onLink,
    titleSlot,
    attachmentSlot,
  }: {
    value?: { content?: { content?: { text?: string }[] }[] };
    onChange?: (json: unknown) => void;
    editable?: boolean;
    onLink?: () => void;
    titleSlot?: React.ReactNode;
    attachmentSlot?: React.ReactNode;
  }) => (
    <>
      {titleSlot}
      {attachmentSlot}
      {editable ? (
        <>
          <textarea
            aria-label="본문"
            onChange={(e) =>
              onChange?.({
                type: 'doc',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: e.target.value }] }],
              })
            }
          />
          {onLink && (
            <button type="button" onClick={onLink}>
              링크 삽입
            </button>
          )}
        </>
      ) : (
        <div data-testid="note-body">{value?.content?.[0]?.content?.[0]?.text ?? ''}</div>
      )}
    </>
  ),
}));

// 모달은 전역 스택(ModalStack)을 통해 렌더된다. auto variant를 데스크탑(Modal)로 고정하고,
// BottomSheet 내부 motion/react-aria를 jsdom에서 단순화한다(ModalStack.test와 동일).
jest.mock('@/src/hooks/useIsMobile', () => ({ useIsMobile: () => false }));
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, onClick, onKeyDown, className, style }: React.HTMLAttributes<HTMLDivElement>) => (
      <div onClick={onClick} onKeyDown={onKeyDown} className={className} style={style}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useDragControls: () => ({ start: jest.fn() }),
  usePresence: () => [true, () => {}],
}));
jest.mock('react-aria', () => ({ usePreventScroll: jest.fn() }));

import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { createNote, patchNote } from '@/src/api/note';
import { getLinkPreview } from '@/src/api/link-preview';
import ModalStack from '@/src/components/common/modal/ModalStack';
import NoteWorkspace, { type NoteWorkspaceHandle } from './NoteWorkspace';
import { loadDraft, saveDraft } from './noteDraftStorage';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import { useModalStore } from '@/src/stores/modal';
import { useToastStore } from '@/src/stores/toast';
import type { Note } from '@/src/types/note';

const sampleTodo = {
  id: 12,
  teamId: 't',
  userId: 1,
  goalId: 5,
  title: '자바스크립트 기초 챕터1 듣기',
  done: false,
  fileUrl: null,
  linkUrl: null,
  dueDate: null,
  createdAt: '2024-03-25T00:00:00.000Z',
  updatedAt: '2024-03-25T00:00:00.000Z',
  goal: { id: 5, title: '자바스크립트로 웹 서비스 만들기' },
  noteIds: [],
  tags: [{ id: 1, name: '코딩' }],
  isFavorite: false,
};

const existingNote: Note = {
  id: 7,
  teamId: 't',
  userId: 1,
  todoId: 12,
  title: '원래 제목',
  content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '원래 본문' }] }] },
  linkUrl: null,
  createdAt: '2024-03-25T00:00:00.000Z',
  updatedAt: '2024-03-25T00:00:00.000Z',
  // 목록 응답의 embedded todo ref는 tags를 포함하지 않는다 (tags는 full todo 조회로만 옴).
  todo: {
    id: 12,
    title: '자바스크립트 기초 챕터1 듣기',
    done: false,
    goal: { id: 5, title: '자바스크립트로 웹 서비스 만들기' },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  useModalStore.setState({ modals: [] });
  useToastStore.setState({ isOpen: false, message: '', variant: 'success' });
  jest.mocked(getLinkPreview).mockResolvedValue({ title: null, faviconUrl: null });
});

// --- 상세(읽기) 모드 ---

it('상세: 노트 제목과 메타 정보, 본문을 보여준다', () => {
  renderWithClient(
    <NoteWorkspace
      todoId={12}
      note={existingNote}
      todo={sampleTodo}
      mode="read"
      onEdit={() => {}}
      onComplete={() => {}}
      onCancel={() => {}}
    />,
  );

  expect(screen.getByRole('heading', { name: '원래 제목' })).toBeInTheDocument();
  expect(screen.getByText('자바스크립트로 웹 서비스 만들기')).toBeInTheDocument();
  expect(screen.getByText('자바스크립트 기초 챕터1 듣기')).toBeInTheDocument();
  expect(screen.getByTestId('note-body')).toHaveTextContent('원래 본문');
  // tags는 note.todo에 없고 full todo(prop)로 채워진다.
  expect(screen.getByText('코딩')).toBeInTheDocument();
});

it('상세: 수정 버튼을 누르면 수정 전환 콜백을 부른다', () => {
  const onEdit = jest.fn();
  renderWithClient(
    <NoteWorkspace
      todoId={12}
      note={existingNote}
      mode="read"
      onEdit={onEdit}
      onComplete={() => {}}
      onCancel={() => {}}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

  expect(onEdit).toHaveBeenCalledTimes(1);
});

it('상세: 제목 입력창은 노출되지 않는다', () => {
  renderWithClient(
    <NoteWorkspace
      todoId={12}
      note={existingNote}
      mode="read"
      onEdit={() => {}}
      onComplete={() => {}}
      onCancel={() => {}}
    />,
  );

  expect(screen.queryByLabelText('제목')).not.toBeInTheDocument();
});

// --- 작성(create) 모드 ---

it('작성: 제목과 본문이 비어 있으면 등록할 수 없다', () => {
  renderWithClient(
    <NoteWorkspace todoId={12} mode="create" onEdit={() => {}} onComplete={() => {}} onCancel={() => {}} />,
  );

  expect(screen.getByRole('button', { name: '등록하기' })).toBeDisabled();
});

it('작성: 제목과 본문을 채우면 등록할 수 있다', () => {
  renderWithClient(
    <NoteWorkspace todoId={12} mode="create" onEdit={() => {}} onComplete={() => {}} onCancel={() => {}} />,
  );

  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목입니다' } });
  fireEvent.change(screen.getByLabelText('본문'), { target: { value: '본문 내용' } });

  expect(screen.getByRole('button', { name: '등록하기' })).toBeEnabled();
});

it('작성: 등록하면 노트를 생성하고 완료 콜백을 부른다', async () => {
  const onComplete = jest.fn();
  (createNote as jest.Mock).mockResolvedValue({ id: 99 });

  renderWithClient(
    <NoteWorkspace todoId={12} mode="create" onEdit={() => {}} onComplete={onComplete} onCancel={() => {}} />,
  );

  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목' } });
  fireEvent.change(screen.getByLabelText('본문'), { target: { value: '본문' } });
  fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

  await waitFor(() => expect(createNote).toHaveBeenCalledWith(expect.objectContaining({ todoId: 12, title: '제목' })));
  await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
});

// --- 수정(edit) 모드 ---

it('수정: 기존 노트 내용이 채워지고, 수정하면 노트를 갱신하고 완료 콜백을 부른다', async () => {
  const onComplete = jest.fn();
  (patchNote as jest.Mock).mockResolvedValue({ id: 7 });

  renderWithClient(
    <NoteWorkspace
      todoId={12}
      note={existingNote}
      mode="edit"
      onEdit={() => {}}
      onComplete={onComplete}
      onCancel={() => {}}
    />,
  );

  expect(screen.getByLabelText('제목')).toHaveValue('원래 제목');

  fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

  await waitFor(() => expect(patchNote).toHaveBeenCalledWith(7, expect.objectContaining({ title: '원래 제목' })));
  await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
});

it('수정: 변경한 채로 취소하면 확인 후 취소 콜백을 부른다', () => {
  const onCancel = jest.fn();

  renderWithClient(
    <>
      <NoteWorkspace
        todoId={12}
        note={existingNote}
        mode="edit"
        onEdit={() => {}}
        onComplete={() => {}}
        onCancel={onCancel}
      />
      <ModalStack />
    </>,
  );

  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '바뀐 제목' } });
  fireEvent.click(screen.getByRole('button', { name: '취소' }));

  // 변경사항이 있으므로 확인 모달이 뜬다
  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  expect(onCancel).toHaveBeenCalledTimes(1);
});

// --- requestClose (ESC 등 외부 트리거가 NoteDrawer를 통해 호출) ---

it('상세: requestClose()를 호출하면 onClose를 부른다', () => {
  const onClose = jest.fn();
  const ref = { current: null } as React.RefObject<NoteWorkspaceHandle | null>;
  renderWithClient(
    <NoteWorkspace
      ref={ref}
      todoId={12}
      note={existingNote}
      mode="read"
      onEdit={() => {}}
      onComplete={() => {}}
      onCancel={() => {}}
      onClose={onClose}
    />,
  );

  act(() => ref.current?.requestClose());

  expect(onClose).toHaveBeenCalledTimes(1);
});

it('작성: 내용 없이 requestClose()를 호출하면 모달 없이 onCancel을 바로 호출한다', () => {
  const onCancel = jest.fn();
  const ref = { current: null } as React.RefObject<NoteWorkspaceHandle | null>;
  renderWithClient(
    <NoteWorkspace ref={ref} todoId={12} mode="create" onEdit={() => {}} onComplete={() => {}} onCancel={onCancel} />,
  );

  act(() => ref.current?.requestClose());

  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('노트 작성을 취소하시겠어요?')).not.toBeInTheDocument();
});

it('작성: 내용 입력 후 requestClose()를 호출하면 취소 확인 모달을 띄우고 확인하면 onCancel을 호출한다', () => {
  const onCancel = jest.fn();
  const ref = { current: null } as React.RefObject<NoteWorkspaceHandle | null>;
  renderWithClient(
    <>
      <NoteWorkspace ref={ref} todoId={12} mode="create" onEdit={() => {}} onComplete={() => {}} onCancel={onCancel} />
      <ModalStack />
    </>,
  );

  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '입력 중인 제목' } });
  act(() => ref.current?.requestClose());

  expect(screen.getByText('노트 작성을 취소하시겠어요?')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  expect(onCancel).toHaveBeenCalledTimes(1);
});

// --- 임시저장·불러오기 ---

it('작성 모드에 임시저장 버튼이 있다', () => {
  renderWithClient(
    <NoteWorkspace todoId={12} mode="create" onEdit={() => {}} onComplete={() => {}} onCancel={() => {}} />,
  );

  expect(screen.getByRole('button', { name: '임시저장' })).toBeInTheDocument();
});

it('상세(읽기) 모드에는 임시저장 버튼이 없다', () => {
  renderWithClient(
    <NoteWorkspace
      todoId={12}
      note={existingNote}
      mode="read"
      onEdit={() => {}}
      onComplete={() => {}}
      onCancel={() => {}}
    />,
  );

  expect(screen.queryByRole('button', { name: '임시저장' })).not.toBeInTheDocument();
});

it('임시저장을 누르면 작성 중인 내용이 보관되고 안내 토스트가 뜬다', () => {
  renderWithClient(
    <NoteWorkspace todoId={12} mode="create" onEdit={() => {}} onComplete={() => {}} onCancel={() => {}} />,
  );

  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '임시 제목' } });
  fireEvent.change(screen.getByLabelText('본문'), { target: { value: '임시 본문' } });
  fireEvent.click(screen.getByRole('button', { name: '임시저장' }));

  expect(loadDraft(12)?.title).toBe('임시 제목');
  expect(useToastStore.getState().message).toBe('임시 저장되었어요.');
  expect(useToastStore.getState().variant).toBe('success');
});

it('저장된 초안이 있으면 작성 진입 시 불러오기를 묻고, 불러오면 제목이 채워진다', () => {
  saveDraft(12, {
    title: '저장된 제목',
    content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '저장된 본문' }] }] },
  });

  renderWithClient(
    <>
      <NoteWorkspace todoId={12} mode="create" onEdit={() => {}} onComplete={() => {}} onCancel={() => {}} />
      <ModalStack />
    </>,
  );

  fireEvent.click(screen.getByRole('button', { name: '불러오기' }));

  expect(screen.getByLabelText('제목')).toHaveValue('저장된 제목');
});

it('등록에 성공하면 임시저장해 둔 초안이 비워진다', async () => {
  (createNote as jest.Mock).mockResolvedValue({ id: 99 });

  renderWithClient(
    <NoteWorkspace todoId={12} mode="create" onEdit={() => {}} onComplete={() => {}} onCancel={() => {}} />,
  );

  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목' } });
  fireEvent.change(screen.getByLabelText('본문'), { target: { value: '본문' } });
  fireEvent.click(screen.getByRole('button', { name: '임시저장' }));
  expect(loadDraft(12)).not.toBeNull();

  fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

  await waitFor(() => expect(createNote).toHaveBeenCalled());
  await waitFor(() => expect(loadDraft(12)).toBeNull());
});

// --- 링크 첨부 ---

const noteWithLink: Note = { ...existingNote, linkUrl: 'https://example.com' };

it('작성: 링크 삽입 버튼을 누르면 링크 입력 모달이 열린다', () => {
  renderWithClient(
    <>
      <NoteWorkspace todoId={12} mode="create" onEdit={() => {}} onComplete={() => {}} onCancel={() => {}} />
      <ModalStack />
    </>,
  );

  fireEvent.click(screen.getByRole('button', { name: '링크 삽입' }));

  expect(screen.getByText('링크 업로드')).toBeInTheDocument();
});

it('작성: 링크를 입력하고 확인하면 링크 카드가 보인다', () => {
  renderWithClient(
    <>
      <NoteWorkspace todoId={12} mode="create" onEdit={() => {}} onComplete={() => {}} onCancel={() => {}} />
      <ModalStack />
    </>,
  );

  fireEvent.click(screen.getByRole('button', { name: '링크 삽입' }));
  fireEvent.change(screen.getByLabelText('링크 URL'), { target: { value: 'https://example.com' } });
  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  expect(screen.getByRole('button', { name: '링크 미리보기 열기' })).toBeInTheDocument();
});

it('수정: 링크 카드의 삭제 버튼을 누르면 링크가 사라진다', () => {
  renderWithClient(
    <NoteWorkspace
      todoId={12}
      note={noteWithLink}
      mode="edit"
      onEdit={() => {}}
      onComplete={() => {}}
      onCancel={() => {}}
    />,
  );

  expect(screen.getByRole('button', { name: '링크 미리보기 열기' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '링크 삭제' }));

  expect(screen.queryByRole('button', { name: '링크 미리보기 열기' })).not.toBeInTheDocument();
});

it('링크 카드에 가져온 제목과 favicon을 보여준다', async () => {
  jest.mocked(getLinkPreview).mockResolvedValue({ title: '예시 페이지', faviconUrl: 'https://example.com/icon.png' });

  renderWithClient(
    <NoteWorkspace
      todoId={12}
      note={noteWithLink}
      mode="read"
      onEdit={() => {}}
      onComplete={() => {}}
      onCancel={() => {}}
    />,
  );

  expect(await screen.findByText('예시 페이지')).toBeInTheDocument();
  const favicon = screen.getByRole('button', { name: '링크 미리보기 열기' }).querySelector('img');
  expect(favicon).toHaveAttribute('src', 'https://example.com/icon.png');
});

it('상세: 링크가 있으면 카드를 보여주고 클릭하면 새 탭으로 연다', () => {
  const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

  renderWithClient(
    <NoteWorkspace
      todoId={12}
      note={noteWithLink}
      mode="read"
      onEdit={() => {}}
      onComplete={() => {}}
      onCancel={() => {}}
    />,
  );

  expect(screen.queryByRole('button', { name: '링크 삭제' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '링크 미리보기 열기' }));

  expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
  openSpy.mockRestore();
});

it('작성: 링크를 첨부하고 등록하면 링크도 함께 전송된다', async () => {
  (createNote as jest.Mock).mockResolvedValue({ id: 99 });

  renderWithClient(
    <>
      <NoteWorkspace todoId={12} mode="create" onEdit={() => {}} onComplete={() => {}} onCancel={() => {}} />
      <ModalStack />
    </>,
  );

  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목' } });
  fireEvent.change(screen.getByLabelText('본문'), { target: { value: '본문' } });
  fireEvent.click(screen.getByRole('button', { name: '링크 삽입' }));
  fireEvent.change(screen.getByLabelText('링크 URL'), { target: { value: 'https://example.com' } });
  fireEvent.click(screen.getByRole('button', { name: '확인' }));
  fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

  await waitFor(() =>
    expect(createNote).toHaveBeenCalledWith(expect.objectContaining({ linkUrl: 'https://example.com' })),
  );
});
