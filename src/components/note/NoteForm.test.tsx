jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn() })),
}));

jest.mock('@/src/api/note', () => ({
  ...jest.requireActual('@/src/api/note'),
  getNotes: jest.fn(),
  createNote: jest.fn(),
  patchNote: jest.fn(),
}));

jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  getTodo: jest.fn(),
}));

// 단위 테스트 격리: NoteEditor 자체는 별도 테스트, 여기서는 wiring만 검증
jest.mock('@/src/components/note/NoteEditor', () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    onLinkInsertClick,
    titleSlot,
    attachmentSlot,
  }: {
    value: { type?: string; content?: unknown[] };
    onChange: (json: { type: string; content: { type: string; content: { type: string; text: string }[] }[] }) => void;
    onLinkInsertClick?: () => void;
    titleSlot?: React.ReactNode;
    attachmentSlot?: React.ReactNode;
  }) => (
    <>
      {titleSlot}
      {attachmentSlot}
      <textarea
        data-testid="note-editor-mock"
        aria-label="본문"
        value={(value as unknown as { _text?: string })._text ?? ''}
        onChange={(e) =>
          onChange({
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: e.target.value }] }],
          })
        }
      />
      <button type="button" onClick={onLinkInsertClick}>
        편집기-링크-트리거
      </button>
    </>
  ),
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { createNote, getNotes, patchNote } from '@/src/api/note';
import { getTodo } from '@/src/api/todo';
import NoteForm from '@/src/components/note/NoteForm';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';

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
  tags: [
    { id: 1, name: '코딩' },
    { id: 2, name: '공부' },
  ],
  isFavorite: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn() });
  (getTodo as jest.Mock).mockResolvedValue(sampleTodo);
  (getNotes as jest.Mock).mockResolvedValue({ notes: [], nextCursor: null, totalCount: 0 });
});

it('작성 모드: 빈 폼에서 등록 버튼은 비활성이다', async () => {
  renderWithClient(<NoteForm mode="create" todoId={12} />);

  await waitFor(() => expect(screen.getByRole('button', { name: '등록하기' })).toBeDisabled());
});

it('작성 모드: 제목과 본문이 모두 입력되면 등록 버튼이 활성화된다', async () => {
  renderWithClient(<NoteForm mode="create" todoId={12} />);

  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목입니다' } });
  fireEvent.change(screen.getByLabelText('본문'), { target: { value: '본문 내용' } });

  await waitFor(() => expect(screen.getByRole('button', { name: '등록하기' })).toBeEnabled());
});

it('작성 모드: 등록 클릭 시 createNote가 호출되고 router.back으로 이동한다', async () => {
  const back = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back });
  (createNote as jest.Mock).mockResolvedValue({ id: 99 });

  renderWithClient(<NoteForm mode="create" todoId={12} />);

  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목' } });
  fireEvent.change(screen.getByLabelText('본문'), { target: { value: '본문' } });
  fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

  await waitFor(() => expect(createNote).toHaveBeenCalledWith(expect.objectContaining({ todoId: 12, title: '제목' })));
  await waitFor(() => expect(back).toHaveBeenCalledTimes(1));
});

it('링크 입력 모달에서 URL을 확인하면 카드가 표시된다', async () => {
  renderWithClient(<NoteForm mode="create" todoId={12} />);

  fireEvent.click(screen.getByRole('button', { name: '편집기-링크-트리거' }));
  fireEvent.change(screen.getByLabelText('링크 URL'), { target: { value: 'https://example.com/abc' } });
  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  await waitFor(() => expect(screen.getAllByText('https://example.com/abc').length).toBeGreaterThan(0));
  expect(screen.getByRole('button', { name: '링크 삭제' })).toBeInTheDocument();
});

it('링크 카드의 삭제 버튼 클릭 시 카드가 사라진다', async () => {
  renderWithClient(<NoteForm mode="create" todoId={12} />);

  fireEvent.click(screen.getByRole('button', { name: '편집기-링크-트리거' }));
  fireEvent.change(screen.getByLabelText('링크 URL'), { target: { value: 'https://x' } });
  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  await waitFor(() => expect(screen.getByRole('button', { name: '링크 삭제' })).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: '링크 삭제' }));

  expect(screen.queryByRole('button', { name: '링크 삭제' })).not.toBeInTheDocument();
});

it('수정 모드: 초기 데이터를 로드해 폼에 채우고 수정 클릭 시 patchNote를 호출한다', async () => {
  const back = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back });
  (getNotes as jest.Mock).mockResolvedValue({
    notes: [
      {
        id: 7,
        teamId: 't',
        userId: 1,
        todoId: 12,
        title: '원래 제목',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '원래 본문' }] }] },
        linkUrl: null,
        createdAt: '2024-03-25T00:00:00.000Z',
        updatedAt: '2024-03-25T00:00:00.000Z',
        todo: { id: 12, title: 't', done: false },
      },
    ],
    nextCursor: null,
    totalCount: 1,
  });
  (patchNote as jest.Mock).mockResolvedValue({ id: 7 });

  renderWithClient(<NoteForm mode="edit" todoId={12} />);

  await waitFor(() => expect(screen.getByLabelText('제목')).toHaveValue('원래 제목'));

  fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

  await waitFor(() =>
    expect(patchNote).toHaveBeenCalledWith(7, expect.objectContaining({ title: '원래 제목', linkUrl: null })),
  );
  await waitFor(() => expect(back).toHaveBeenCalledTimes(1));
});

it('수정 모드: 데이터 로딩 중에는 "불러오는 중…"이 보인다', () => {
  (getNotes as jest.Mock).mockReturnValue(new Promise(() => {}));

  renderWithClient(<NoteForm mode="edit" todoId={12} />);

  expect(screen.getByText('불러오는 중…')).toBeInTheDocument();
  expect(screen.queryByLabelText('제목')).not.toBeInTheDocument();
});
