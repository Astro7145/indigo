jest.mock('next/navigation', () => ({ useRouter: () => ({ back: jest.fn() }) }));

jest.mock('@/src/api/note', () => ({
  ...jest.requireActual('@/src/api/note'),
  getNotes: jest.fn(),
}));

jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  getTodo: jest.fn().mockResolvedValue(null),
}));

// 자식 컴포넌트는 각자 테스트됨. 여기선 분기/토글만 검증하므로 가벼운 stub으로 대체.
// mode로 작성/상세/수정 셋 중 무엇이 렌더되는지만 드러낸다.
jest.mock('./NoteWorkspace', () => ({
  __esModule: true,
  default: ({
    mode,
    onEdit,
    onComplete,
    onCancel,
  }: {
    mode: 'create' | 'edit' | 'read';
    onEdit: () => void;
    onComplete: () => void;
    onCancel: () => void;
  }) => (
    <div>
      <p>{mode === 'create' ? '작성 폼' : mode === 'edit' ? '수정 폼' : '상세 뷰'}</p>
      <button type="button" onClick={onEdit}>
        수정
      </button>
      <button type="button" onClick={onComplete}>
        폼-완료
      </button>
      <button type="button" onClick={onCancel}>
        폼-취소
      </button>
    </div>
  ),
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { getNotes } from '@/src/api/note';
import NotePage from './NotePage';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Note } from '@/src/types/note';

const note: Note = {
  id: 7,
  teamId: 't',
  userId: 1,
  todoId: 12,
  title: '제목',
  content: { type: 'doc', content: [] },
  linkUrl: null,
  createdAt: '2024-03-25T00:00:00.000Z',
  updatedAt: '2024-03-25T00:00:00.000Z',
  todo: { id: 12, title: '할 일', done: false },
};

beforeEach(() => jest.clearAllMocks());

it('노트가 없으면 작성 화면을 보여준다', async () => {
  (getNotes as jest.Mock).mockResolvedValue({ notes: [], nextCursor: null, totalCount: 0 });

  renderWithClient(<NotePage todoId={12} />);

  expect(await screen.findByText('작성 폼')).toBeInTheDocument();
});

it('노트가 있으면 상세 화면을 보여준다', async () => {
  (getNotes as jest.Mock).mockResolvedValue({ notes: [note], nextCursor: null, totalCount: 1 });

  renderWithClient(<NotePage todoId={12} />);

  expect(await screen.findByText('상세 뷰')).toBeInTheDocument();
});

it('노트를 불러오는 동안 로딩 상태를 보여준다', () => {
  (getNotes as jest.Mock).mockReturnValue(new Promise(() => {}));

  renderWithClient(<NotePage todoId={12} />);

  expect(screen.getByText('불러오는 중…')).toBeInTheDocument();
});

it('노트 조회에 실패하면 에러 메시지를 보여준다', async () => {
  (getNotes as jest.Mock).mockRejectedValue(new Error('fail'));

  renderWithClient(<NotePage todoId={12} />);

  expect(await screen.findByText('노트를 불러오지 못했어요')).toBeInTheDocument();
});

it('상세 화면에서 수정을 누르면 수정 화면으로 전환되고, 취소하면 상세로 돌아온다', async () => {
  (getNotes as jest.Mock).mockResolvedValue({ notes: [note], nextCursor: null, totalCount: 1 });

  renderWithClient(<NotePage todoId={12} />);

  fireEvent.click(await screen.findByRole('button', { name: '수정' }));
  expect(await screen.findByText('수정 폼')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '폼-취소' }));
  await waitFor(() => expect(screen.getByText('상세 뷰')).toBeInTheDocument());
});
