jest.mock('@/src/api/note', () => ({
  ...jest.requireActual('@/src/api/note'),
  createNote: jest.fn(),
  patchNote: jest.fn(),
}));

import { act } from '@testing-library/react';

import { createNote, patchNote } from '@/src/api/note';
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils';
import { useToastStore } from '@/src/stores/toast';
import type { Note } from '@/src/types/note';

import { useNoteSubmit } from './useNoteSubmit';

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

const draft = {
  title: '제목',
  content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '본문' }] }] },
  linkUrl: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  useToastStore.setState({ isOpen: false, message: '', variant: 'success' });
});

it('작성 모드에서 제출하면 노트를 생성하고 완료 콜백을 부른다', async () => {
  (createNote as jest.Mock).mockResolvedValue({ id: 99 });
  const onComplete = jest.fn();
  const { result } = renderHookWithClient(() => useNoteSubmit({ todoId: 12, mode: 'create', onComplete }));

  expect(result.current.isSubmitting).toBe(false);

  await act(async () => {
    await result.current.submit(draft);
  });

  expect(createNote).toHaveBeenCalledWith(expect.objectContaining({ todoId: 12, title: '제목' }));
  expect(patchNote).not.toHaveBeenCalled();
  expect(onComplete).toHaveBeenCalledTimes(1);
});

it('수정 모드에서 제출하면 대상 노트를 갱신하고 완료 콜백을 부른다', async () => {
  (patchNote as jest.Mock).mockResolvedValue({ id: 7 });
  const onComplete = jest.fn();
  const { result } = renderHookWithClient(() => useNoteSubmit({ todoId: 12, note, mode: 'edit', onComplete }));

  await act(async () => {
    await result.current.submit(draft);
  });

  expect(patchNote).toHaveBeenCalledWith(7, expect.objectContaining({ title: '제목' }));
  expect(createNote).not.toHaveBeenCalled();
  expect(onComplete).toHaveBeenCalledTimes(1);
});

it('작성에 실패하면 등록 실패 토스트를 띄우고 완료 콜백을 부르지 않는다', async () => {
  (createNote as jest.Mock).mockRejectedValue(new Error('fail'));
  const onComplete = jest.fn();
  const { result } = renderHookWithClient(() => useNoteSubmit({ todoId: 12, mode: 'create', onComplete }));

  await act(async () => {
    await result.current.submit(draft);
  });

  expect(onComplete).not.toHaveBeenCalled();
  expect(useToastStore.getState().message).toBe('노트 등록에 실패했어요.');
  expect(useToastStore.getState().variant).toBe('error');
});

it('수정에 실패하면 수정 실패 토스트를 띄운다', async () => {
  (patchNote as jest.Mock).mockRejectedValue(new Error('fail'));
  const onComplete = jest.fn();
  const { result } = renderHookWithClient(() => useNoteSubmit({ todoId: 12, note, mode: 'edit', onComplete }));

  await act(async () => {
    await result.current.submit(draft);
  });

  expect(onComplete).not.toHaveBeenCalled();
  expect(useToastStore.getState().message).toBe('노트 수정에 실패했어요.');
  expect(useToastStore.getState().variant).toBe('error');
});

it('작성 모드에서 링크가 있으면 생성 바디에 linkUrl이 포함된다', async () => {
  (createNote as jest.Mock).mockResolvedValue({ id: 99 });
  const { result } = renderHookWithClient(() => useNoteSubmit({ todoId: 12, mode: 'create', onComplete: jest.fn() }));

  await act(async () => {
    await result.current.submit({ ...draft, linkUrl: 'https://example.com' });
  });

  expect(createNote).toHaveBeenCalledWith(expect.objectContaining({ linkUrl: 'https://example.com' }));
});

it('작성 모드에서 링크가 없으면 생성 바디에 linkUrl을 보내지 않는다', async () => {
  (createNote as jest.Mock).mockResolvedValue({ id: 99 });
  const { result } = renderHookWithClient(() => useNoteSubmit({ todoId: 12, mode: 'create', onComplete: jest.fn() }));

  await act(async () => {
    await result.current.submit({ ...draft, linkUrl: null });
  });

  const body = (createNote as jest.Mock).mock.calls[0][0];
  expect(body).not.toHaveProperty('linkUrl');
});

it('수정 모드에서 linkUrl을 null로 보내면 링크 제거 의도로 그대로 전송된다', async () => {
  (patchNote as jest.Mock).mockResolvedValue({ id: 7 });
  const { result } = renderHookWithClient(() =>
    useNoteSubmit({ todoId: 12, note, mode: 'edit', onComplete: jest.fn() }),
  );

  await act(async () => {
    await result.current.submit({ ...draft, linkUrl: null });
  });

  expect(patchNote).toHaveBeenCalledWith(7, expect.objectContaining({ linkUrl: null }));
});
