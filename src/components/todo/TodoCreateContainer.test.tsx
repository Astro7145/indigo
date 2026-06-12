jest.mock('@/src/hooks/todo', () => ({ useCreateTodo: jest.fn() }));
jest.mock('@/src/hooks/upload', () => ({ useCreateImageUploadUrl: jest.fn() }));
jest.mock('@/src/hooks/useToast', () => ({ useToast: jest.fn() }));
jest.mock('@/src/components/todo/TodoFormUI');

import { act, render } from '@testing-library/react';

import TodoCreateContainer from '@/src/components/todo/TodoCreateContainer';
import TodoFormUI, { type TodoFormValues } from '@/src/components/todo/TodoFormUI';
import * as todoHooks from '@/src/hooks/todo';
import * as uploadHooks from '@/src/hooks/upload';
import * as toastHook from '@/src/hooks/useToast';

const mockedTodoFormUI = TodoFormUI as unknown as jest.Mock;
const mockedUseCreateTodo = todoHooks.useCreateTodo as jest.MockedFunction<typeof todoHooks.useCreateTodo>;
const mockedUseCreateImageUploadUrl = uploadHooks.useCreateImageUploadUrl as jest.MockedFunction<
  typeof uploadHooks.useCreateImageUploadUrl
>;
const mockedUseToast = toastHook.useToast as jest.MockedFunction<typeof toastHook.useToast>;

const mockMutate = jest.fn();
const mockCreateImageUploadUrl = jest.fn();
const mockShowToast = jest.fn();

let capturedOnSubmit: ((values: TodoFormValues) => Promise<void> | void) | null = null;

const baseValues: TodoFormValues = {
  title: '운동',
  dueDate: '2026-06-01',
  tags: [],
  imageFile: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  capturedOnSubmit = null;

  mockedTodoFormUI.mockImplementation(({ onSubmit }: { onSubmit: (values: TodoFormValues) => Promise<void> }) => {
    capturedOnSubmit = onSubmit;
    return null;
  });

  mockedUseCreateTodo.mockReturnValue({ mutate: mockMutate } as unknown as ReturnType<typeof todoHooks.useCreateTodo>);
  mockedUseCreateImageUploadUrl.mockReturnValue({
    mutateAsync: mockCreateImageUploadUrl,
  } as unknown as ReturnType<typeof uploadHooks.useCreateImageUploadUrl>);
  mockedUseToast.mockReturnValue({ showToast: mockShowToast, hideToast: jest.fn() });

  global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;
});

describe('TodoCreateContainer', () => {
  it('이미지 없이 제출 시 입력값으로 createTodo를 호출한다', async () => {
    render(<TodoCreateContainer onClose={jest.fn()} onCancel={jest.fn()} />);
    await act(async () => {
      await capturedOnSubmit!({ ...baseValues, goalId: 5, linkUrl: '' });
    });
    expect(mockMutate).toHaveBeenCalledWith(
      {
        title: '운동',
        goalId: 5,
        dueDate: '2026-06-01',
        linkUrl: undefined,
        fileUrl: undefined,
        tags: undefined,
      },
      expect.any(Object),
    );
  });

  it('이미지를 첨부하면 업로드 후 fileUrl을 포함해 createTodo를 호출한다', async () => {
    mockCreateImageUploadUrl.mockResolvedValue({
      uploadUrl: 'https://upload/url',
      url: 'https://cdn/image.png',
    });
    render(<TodoCreateContainer onClose={jest.fn()} onCancel={jest.fn()} />);
    const file = new File([''], 'pic.png', { type: 'image/png' });
    await act(async () => {
      await capturedOnSubmit!({ ...baseValues, imageFile: file });
    });
    expect(mockCreateImageUploadUrl).toHaveBeenCalledWith({ fileName: 'pic.png' });
    expect(global.fetch).toHaveBeenCalledWith('https://upload/url', { method: 'PUT', body: file });
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ fileUrl: 'https://cdn/image.png' }),
      expect.any(Object),
    );
  });

  it('이미지 업로드 URL 발급이 실패하면 토스트를 띄우고 createTodo를 호출하지 않는다', async () => {
    mockCreateImageUploadUrl.mockRejectedValue(new Error('fail'));
    render(<TodoCreateContainer onClose={jest.fn()} onCancel={jest.fn()} />);
    const file = new File([''], 'pic.png', { type: 'image/png' });
    await act(async () => {
      await capturedOnSubmit!({ ...baseValues, imageFile: file });
    });
    expect(mockShowToast).toHaveBeenCalledWith('이미지 업로드에 실패했습니다.');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('이미지 PUT 업로드가 실패하면 토스트를 띄우고 createTodo를 호출하지 않는다', async () => {
    mockCreateImageUploadUrl.mockResolvedValue({
      uploadUrl: 'https://upload/url',
      url: 'https://cdn/image.png',
    });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
    render(<TodoCreateContainer onClose={jest.fn()} onCancel={jest.fn()} />);
    const file = new File([''], 'pic.png', { type: 'image/png' });
    await act(async () => {
      await capturedOnSubmit!({ ...baseValues, imageFile: file });
    });
    expect(mockShowToast).toHaveBeenCalledWith('이미지 업로드에 실패했습니다.');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('createTodo 성공 시 성공 토스트를 띄우고 onClose를 호출한다', async () => {
    mockMutate.mockImplementation((_data: unknown, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    });
    const onClose = jest.fn();
    render(<TodoCreateContainer onClose={onClose} onCancel={jest.fn()} />);
    await act(async () => {
      await capturedOnSubmit!(baseValues);
    });
    expect(mockShowToast).toHaveBeenCalledWith('할 일이 추가되었습니다.');
    expect(onClose).toHaveBeenCalled();
  });

  it('createTodo 실패 시 실패 토스트를 띄우고 onClose는 호출되지 않는다', async () => {
    mockMutate.mockImplementation((_data: unknown, options?: { onError?: () => void }) => {
      options?.onError?.();
    });
    const onClose = jest.fn();
    render(<TodoCreateContainer onClose={onClose} onCancel={jest.fn()} />);
    await act(async () => {
      await capturedOnSubmit!(baseValues);
    });
    expect(mockShowToast).toHaveBeenCalledWith('할 일 생성에 실패했습니다.');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('태그가 있으면 텍스트 배열로 변환되어 createTodo에 전달된다', async () => {
    render(<TodoCreateContainer onClose={jest.fn()} onCancel={jest.fn()} />);
    await act(async () => {
      await capturedOnSubmit!({
        ...baseValues,
        tags: [
          { text: '취미', color: 'green' },
          { text: '운동', color: 'yellow' },
        ],
      });
    });
    expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ tags: ['취미', '운동'] }), expect.any(Object));
  });

  it('defaultDueDate를 TodoFormUI initialValues.dueDate로 전달한다', () => {
    let capturedInitialValues: Partial<TodoFormValues> | undefined;
    mockedTodoFormUI.mockImplementation(({ initialValues }: { initialValues?: Partial<TodoFormValues> }) => {
      capturedInitialValues = initialValues;
      return null;
    });
    render(<TodoCreateContainer onClose={jest.fn()} onCancel={jest.fn()} defaultDueDate="2025-01-10T00:00:00.000Z" />);
    expect(capturedInitialValues).toMatchObject({ dueDate: '2025-01-10T00:00:00.000Z' });
  });
});
