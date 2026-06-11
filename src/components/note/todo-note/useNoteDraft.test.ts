import { act, renderHook } from '@testing-library/react';

import { useNoteDraft } from './useNoteDraft';
import type { Note } from '@/src/types/note';

const note: Note = {
  id: 7,
  teamId: 't',
  userId: 1,
  todoId: 12,
  title: '원래 제목',
  content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '원래 본문' }] }] },
  linkUrl: null,
  createdAt: '2024-03-25T00:00:00.000Z',
  updatedAt: '2024-03-25T00:00:00.000Z',
  todo: { id: 12, title: '할 일', done: false },
};

it('편집 모드에서 기존 노트 내용으로 초안이 채워진다', () => {
  const { result } = renderHook(() => useNoteDraft(note, true));

  expect(result.current.title).toBe('원래 제목');
  expect(result.current.content).toEqual(note.content);
});

it('내용이 원본과 같으면 변경 없음·유효함으로 본다', () => {
  const { result } = renderHook(() => useNoteDraft(note, true));

  expect(result.current.isDirty).toBe(false);
  expect(result.current.isValid).toBe(true);
});

it('제목을 바꾸면 변경됨으로 표시된다', () => {
  const { result } = renderHook(() => useNoteDraft(note, true));

  act(() => result.current.setTitle('바뀐 제목'));

  expect(result.current.title).toBe('바뀐 제목');
  expect(result.current.isDirty).toBe(true);
});

it('작성 모드(note 없음)에서 제목·본문이 비면 유효하지 않다', () => {
  const { result } = renderHook(() => useNoteDraft(undefined, true));

  expect(result.current.isValid).toBe(false);

  act(() => result.current.setTitle('새 제목'));
  expect(result.current.isValid).toBe(false); // 본문이 아직 비어 있음

  act(() =>
    result.current.setContent({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '본문' }] }],
    }),
  );
  expect(result.current.isValid).toBe(true);
});

it('읽기 모드에선 초안 변경과 무관하게 원본을 그대로 보여준다', () => {
  const { result } = renderHook(() => useNoteDraft(note, false));

  act(() => result.current.setTitle('몰래 바꾼 제목'));

  expect(result.current.title).toBe('원래 제목');
});

it('읽기→편집 진입 시 이전 편집의 취소분을 버리고 원본으로 초안을 리셋한다', () => {
  const { result, rerender } = renderHook(({ editing }) => useNoteDraft(note, editing), {
    initialProps: { editing: true },
  });

  // 편집 중 제목을 바꾸고
  act(() => result.current.setTitle('취소될 제목'));
  expect(result.current.title).toBe('취소될 제목');

  // 저장 없이 읽기로 돌아갔다가
  rerender({ editing: false });
  // 다시 편집으로 진입하면 원본으로 복원되어야 한다
  rerender({ editing: true });

  expect(result.current.title).toBe('원래 제목');
});
