const back = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ back }) }));
jest.mock('@/src/api/note', () => ({
  ...jest.requireActual('@/src/api/note'),
  getNote: jest.fn(),
}));

import { cleanup, fireEvent, screen } from '@testing-library/react';

import * as noteApi from '@/src/api/note';
import NoteDetailDrawer from '@/src/components/note/NoteDetailDrawer';
import { renderWithIntl } from '@/src/hooks/__tests__/test-utils';

const noteMock = noteApi as jest.Mocked<typeof noteApi>;

beforeEach(() => {
  jest.clearAllMocks();
  noteMock.getNote.mockResolvedValue(undefined as never); // 로딩 상태로 충분 — 셸 동작만 검증
});

it('닫기 버튼은 router.back을 호출한다', async () => {
  await renderWithIntl(<NoteDetailDrawer noteId={1} />);
  fireEvent.click(screen.getByRole('button', { name: '닫기' }));
  expect(back).toHaveBeenCalledTimes(1);
});

it('Escape 키로 닫힌다', async () => {
  await renderWithIntl(<NoteDetailDrawer noteId={1} />);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(back).toHaveBeenCalledTimes(1);
});

it('열려 있는 동안 배경(body) 스크롤을 잠그고, 닫히면 복원한다', async () => {
  expect(document.body.style.overflow).toBe('');
  await renderWithIntl(<NoteDetailDrawer noteId={1} />);
  expect(document.body.style.overflow).toBe('hidden');
  cleanup();
  expect(document.body.style.overflow).toBe('');
});
