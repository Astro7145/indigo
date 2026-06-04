jest.mock('@/src/hooks/todo', () => ({ useUpdateTodo: jest.fn() }));
jest.mock('@/src/hooks/upload', () => ({ useCreateImageUploadUrl: jest.fn() }));
jest.mock('@/src/hooks/useToast', () => ({ useToast: jest.fn() }));
jest.mock('@/src/components/todo/TodoFormUI');

import { act, render } from '@testing-library/react';

import TodoUpdateContainer from '@/src/components/todo/TodoUpdateContainer';
import TodoFormUI, { type TodoFormValues } from '@/src/components/todo/TodoFormUI';
import * as todoHooks from '@/src/hooks/todo';
import * as uploadHooks from '@/src/hooks/upload';
import * as toastHook from '@/src/hooks/useToast';
import type { Todo } from '@/src/types/todo';

const mockedTodoFormUI = TodoFormUI as unknown as jest.Mock;
const mockedUseUpdateTodo = todoHooks.useUpdateTodo as jest.MockedFunction<typeof todoHooks.useUpdateTodo>;
const mockedUseCreateImageUploadUrl = uploadHooks.useCreateImageUploadUrl as jest.MockedFunction<
  typeof uploadHooks.useCreateImageUploadUrl
>;
const mockedUseToast = toastHook.useToast as jest.MockedFunction<typeof toastHook.useToast>;

const mockMutate = jest.fn();
const mockCreateImageUploadUrl = jest.fn();
const mockShowToast = jest.fn();

let capturedOnSubmit: ((values: TodoFormValues) => Promise<void> | void) | null = null;
let capturedInitialValues: Partial<TodoFormValues> | null = null;

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 1,
    teamId: 'team',
    userId: 1,
    goalId: 7,
    title: '기존 할 일',
    done: false,
    fileUrl: 'https://existing/image.png',
    linkUrl: 'https://link',
    dueDate: '2026-06-01',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01',
    goal: { id: 7, title: '목표' },
    noteIds: [],
    tags: [
      { id: 10, name: '운동' },
      { id: 11, name: '취미' },
    ],
    isFavorite: false,
    ...overrides,
  };
}

const baseSubmitValues: TodoFormValues = {
  title: '수정',
  dueDate: '2026-06-01',
  tags: [],
  imageFile: null,
  fileUrl: null,
  done: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  capturedOnSubmit = null;
  capturedInitialValues = null;

  mockedTodoFormUI.mockImplementation(
    ({
      onSubmit,
      initialValues,
    }: {
      onSubmit: (values: TodoFormValues) => Promise<void>;
      initialValues?: Partial<TodoFormValues>;
    }) => {
      capturedOnSubmit = onSubmit;
      capturedInitialValues = initialValues ?? null;
      return null;
    },
  );

  mockedUseUpdateTodo.mockReturnValue({ mutate: mockMutate } as unknown as ReturnType<typeof todoHooks.useUpdateTodo>);
  mockedUseCreateImageUploadUrl.mockReturnValue({
    mutateAsync: mockCreateImageUploadUrl,
  } as unknown as ReturnType<typeof uploadHooks.useCreateImageUploadUrl>);
  mockedUseToast.mockReturnValue({ showToast: mockShowToast, hideToast: jest.fn() });

  global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;
});

describe('TodoUpdateContainer', () => {
  describe('initialValues 매핑', () => {
    it('todo의 기본 필드가 TodoFormUI 초기값으로 전달된다', () => {
      render(<TodoUpdateContainer todo={makeTodo()} onClose={jest.fn()} />);
      expect(capturedInitialValues).toMatchObject({
        title: '기존 할 일',
        goalId: 7,
        dueDate: '2026-06-01',
        linkUrl: 'https://link',
        fileUrl: 'https://existing/image.png',
        done: false,
      });
    });

    it('todo.tags는 색상이 부여된 배열로 변환되어 전달된다', () => {
      render(<TodoUpdateContainer todo={makeTodo()} onClose={jest.fn()} />);
      expect(capturedInitialValues?.tags).toEqual([
        { text: '운동', color: 'green' },
        { text: '취미', color: 'yellow' },
      ]);
    });

    it('todo.tags가 null이면 빈 배열로 변환된다', () => {
      const todo = makeTodo({ tags: null as unknown as Todo['tags'] });
      render(<TodoUpdateContainer todo={todo} onClose={jest.fn()} />);
      expect(capturedInitialValues?.tags).toEqual([]);
    });

    it('todo.dueDate가 null이면 빈 문자열로 전달된다', () => {
      render(<TodoUpdateContainer todo={makeTodo({ dueDate: null })} onClose={jest.fn()} />);
      expect(capturedInitialValues?.dueDate).toBe('');
    });

    it('todo.linkUrl이 null이면 빈 문자열로 전달된다', () => {
      render(<TodoUpdateContainer todo={makeTodo({ linkUrl: null })} onClose={jest.fn()} />);
      expect(capturedInitialValues?.linkUrl).toBe('');
    });

    it('todo.goalId가 null이면 undefined로 전달된다', () => {
      render(<TodoUpdateContainer todo={makeTodo({ goalId: null })} onClose={jest.fn()} />);
      expect(capturedInitialValues?.goalId).toBeUndefined();
    });
  });

  describe('handleSubmit', () => {
    it('이미지 변경 없이 제출하면 기존 fileUrl을 유지한 채 updateTodo를 호출한다', async () => {
      render(<TodoUpdateContainer todo={makeTodo()} onClose={jest.fn()} />);
      await act(async () => {
        await capturedOnSubmit!({
          ...baseSubmitValues,
          title: '수정된 할 일',
          done: true,
          fileUrl: 'https://existing/image.png',
        });
      });
      expect(mockMutate).toHaveBeenCalledWith(
        {
          todoId: 1,
          body: expect.objectContaining({
            title: '수정된 할 일',
            done: true,
            fileUrl: 'https://existing/image.png',
            tags: [],
          }),
        },
        expect.any(Object),
      );
    });

    it('fileUrl이 null이면 명시적 삭제로 처리되어 body.fileUrl도 null로 전달된다', async () => {
      render(<TodoUpdateContainer todo={makeTodo()} onClose={jest.fn()} />);
      await act(async () => {
        await capturedOnSubmit!({ ...baseSubmitValues, fileUrl: null });
      });
      expect(mockMutate).toHaveBeenCalledWith(
        { todoId: 1, body: expect.objectContaining({ fileUrl: null }) },
        expect.any(Object),
      );
    });

    it('새 이미지를 첨부하면 업로드 후 새 fileUrl로 updateTodo를 호출한다', async () => {
      mockCreateImageUploadUrl.mockResolvedValue({
        uploadUrl: 'https://upload/url',
        url: 'https://cdn/new.png',
      });
      render(<TodoUpdateContainer todo={makeTodo()} onClose={jest.fn()} />);
      const file = new File([''], 'new.png', { type: 'image/png' });
      await act(async () => {
        await capturedOnSubmit!({
          ...baseSubmitValues,
          imageFile: file,
          fileUrl: 'https://existing/image.png',
        });
      });
      expect(mockMutate).toHaveBeenCalledWith(
        { todoId: 1, body: expect.objectContaining({ fileUrl: 'https://cdn/new.png' }) },
        expect.any(Object),
      );
    });

    it('이미지 업로드 실패 시 토스트를 띄우고 updateTodo를 호출하지 않는다', async () => {
      mockCreateImageUploadUrl.mockRejectedValue(new Error('fail'));
      render(<TodoUpdateContainer todo={makeTodo()} onClose={jest.fn()} />);
      const file = new File([''], 'fail.png', { type: 'image/png' });
      await act(async () => {
        await capturedOnSubmit!({ ...baseSubmitValues, imageFile: file });
      });
      expect(mockShowToast).toHaveBeenCalledWith('이미지 업로드에 실패했습니다.');
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('dueDate가 빈 문자열이면 body.dueDate가 null로 전달된다', async () => {
      render(<TodoUpdateContainer todo={makeTodo()} onClose={jest.fn()} />);
      await act(async () => {
        await capturedOnSubmit!({ ...baseSubmitValues, dueDate: '' });
      });
      expect(mockMutate).toHaveBeenCalledWith(
        { todoId: 1, body: expect.objectContaining({ dueDate: null }) },
        expect.any(Object),
      );
    });

    it('updateTodo 성공 시 성공 토스트를 띄우고 onClose를 호출한다', async () => {
      mockMutate.mockImplementation((_data: unknown, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      });
      const onClose = jest.fn();
      render(<TodoUpdateContainer todo={makeTodo()} onClose={onClose} />);
      await act(async () => {
        await capturedOnSubmit!(baseSubmitValues);
      });
      expect(mockShowToast).toHaveBeenCalledWith('할 일이 수정되었습니다.');
      expect(onClose).toHaveBeenCalled();
    });

    it('updateTodo 실패 시 실패 토스트를 띄우고 onClose는 호출되지 않는다', async () => {
      mockMutate.mockImplementation((_data: unknown, options?: { onError?: () => void }) => {
        options?.onError?.();
      });
      const onClose = jest.fn();
      render(<TodoUpdateContainer todo={makeTodo()} onClose={onClose} />);
      await act(async () => {
        await capturedOnSubmit!(baseSubmitValues);
      });
      expect(mockShowToast).toHaveBeenCalledWith('할 일 수정에 실패했습니다.');
      expect(onClose).not.toHaveBeenCalled();
    });

    it('태그가 있으면 텍스트 배열로 변환되어 updateTodo에 전달된다', async () => {
      render(<TodoUpdateContainer todo={makeTodo()} onClose={jest.fn()} />);
      await act(async () => {
        await capturedOnSubmit!({
          ...baseSubmitValues,
          tags: [
            { text: '취미', color: 'green' },
            { text: '운동', color: 'yellow' },
          ],
        });
      });
      expect(mockMutate).toHaveBeenCalledWith(
        { todoId: 1, body: expect.objectContaining({ tags: ['취미', '운동'] }) },
        expect.any(Object),
      );
    });
  });
});
