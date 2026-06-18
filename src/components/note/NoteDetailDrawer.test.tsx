const back = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ back }) }));
jest.mock('@/src/api/note', () => ({
  ...jest.requireActual('@/src/api/note'),
  getNote: jest.fn(),
}));

import { cleanup, fireEvent, screen } from '@testing-library/react';

import * as noteApi from '@/src/api/note';
import NoteDetailDrawer from '@/src/components/note/NoteDetailDrawer';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import { lockScroll, unlockScroll, _resetScrollLock } from '@/src/utils/scrollLock';

const noteMock = noteApi as jest.Mocked<typeof noteApi>;

beforeEach(() => {
  jest.clearAllMocks();
  noteMock.getNote.mockResolvedValue(undefined as never); // 로딩 상태로 충분 — 셸 동작만 검증
  _resetScrollLock();
  document.body.style.overflow = '';
});

it('닫기 버튼은 router.back을 호출한다', () => {
  renderWithClient(<NoteDetailDrawer noteId={1} />);
  fireEvent.click(screen.getByRole('button', { name: '닫기' }));
  expect(back).toHaveBeenCalledTimes(1);
});

it('Escape 키로 닫힌다', () => {
  renderWithClient(<NoteDetailDrawer noteId={1} />);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(back).toHaveBeenCalledTimes(1);
});

it('열려 있는 동안 배경(body) 스크롤을 잠그고, 닫히면 복원한다', () => {
  expect(document.body.style.overflow).toBe('');
  renderWithClient(<NoteDetailDrawer noteId={1} />);
  expect(document.body.style.overflow).toBe('hidden');
  cleanup();
  expect(document.body.style.overflow).toBe('');
});

it('모달 락과 겹쳐 열렸다 닫혀도, 모두 닫히면 배경 스크롤이 풀린다 (#217)', () => {
  lockScroll(); // 모달이 먼저 배경을 잠근 상태
  const { unmount } = renderWithClient(<NoteDetailDrawer noteId={1} />); // 드로어가 추가로 열림
  expect(document.body.style.overflow).toBe('hidden');

  unlockScroll(); // 모달이 먼저 닫힘 — 드로어가 아직 열려 있으니 잠금은 유지돼야 한다
  expect(document.body.style.overflow).toBe('hidden');

  unmount(); // 드로어도 닫힘 — 이제 모두 닫혔으니 스크롤이 풀려야 한다
  expect(document.body.style.overflow).toBe('');
});
