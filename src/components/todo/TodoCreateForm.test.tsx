import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Modal from '@/src/components/common/modal/Modal';
import TodoCreateForm from './TodoCreateForm';

jest.mock('@/src/components/todo/date-picker/DatePicker', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CalendarDate } = require('@internationalized/date');
  return {
    __esModule: true,
    default: ({ onChange }: { onChange?: (date: InstanceType<typeof CalendarDate> | null) => void }) => (
      <button type="button" data-testid="mock-datepicker" onClick={() => onChange?.(new CalendarDate(2026, 6, 1))}>
        날짜를 선택해주세요
      </button>
    ),
  };
});

jest.mock('@/src/components/common/inputs/ImageInput', () => ({
  __esModule: true,
  default: ({ onFileChange }: { onFileChange: (f: File | null) => void }) => (
    <input data-testid="mock-image-input" type="file" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
  ),
}));

jest.mock('@/src/hooks/todo', () => ({ useCreateTodo: jest.fn() }));
jest.mock('@/src/hooks/goal', () => ({ useGoalList: jest.fn() }));
jest.mock('@/src/hooks/upload', () => ({ useCreateImageUploadUrl: jest.fn() }));
jest.mock('@/src/hooks/useToast', () => ({ useToast: jest.fn() }));

import { useCreateTodo } from '@/src/hooks/todo';
import { useGoalList } from '@/src/hooks/goal';
import { useCreateImageUploadUrl } from '@/src/hooks/upload';
import { useToast } from '@/src/hooks/useToast';

function renderForm(props: { onClose?: () => void } = {}) {
  const onClose = props.onClose ?? jest.fn();
  render(
    <Modal open onClose={onClose}>
      <TodoCreateForm onClose={onClose} />
    </Modal>,
  );
  return { onClose };
}

beforeEach(() => {
  (useCreateTodo as jest.Mock).mockReturnValue({ mutateAsync: jest.fn().mockResolvedValue({}) });
  (useGoalList as jest.Mock).mockReturnValue({ data: { goals: [] } });
  (useCreateImageUploadUrl as jest.Mock).mockReturnValue({ mutateAsync: jest.fn() });
  (useToast as jest.Mock).mockReturnValue({ showToast: jest.fn() });
});

it('"할 일 생성" 제목을 렌더링한다', () => {
  renderForm();
  expect(screen.getByRole('heading', { name: '할 일 생성' })).toBeInTheDocument();
});

it('제목·목표·마감기한·태그·링크·이미지 레이블을 렌더링한다', () => {
  renderForm();
  for (const label of ['제목', '목표', '마감기한', '태그', '링크', '이미지']) {
    expect(screen.getByText(label, { exact: true, selector: 'span, label' })).toBeInTheDocument();
  }
});

it('취소·확인 버튼을 렌더링한다', () => {
  renderForm();
  expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
});

it('제목 없이 제출하면 필드 아래 에러 메시지를 표시한다', async () => {
  renderForm();
  fireEvent.click(screen.getByRole('button', { name: '확인' }));
  expect(await screen.findByText('제목을 입력해주세요.')).toBeInTheDocument();
});

it('마감일 없이 제출하면 필드 아래 에러 메시지를 표시한다', async () => {
  renderForm();
  fireEvent.change(screen.getByPlaceholderText('할 일의 제목을 적어주세요'), { target: { value: '운동하기' } });
  fireEvent.click(screen.getByRole('button', { name: '확인' }));
  expect(await screen.findByText('마감일을 선택해주세요.')).toBeInTheDocument();
});

it('목표 목록에서 항목을 선택하면 트리거 텍스트가 바뀐다', () => {
  (useGoalList as jest.Mock).mockReturnValue({
    data: {
      goals: [{ id: 1, title: '자바스크립트 정복', createdAt: '', updatedAt: '', teamId: '', userId: 0 }],
    },
  });
  renderForm();
  fireEvent.click(screen.getByRole('button', { name: /목표를 선택/ }));
  fireEvent.click(screen.getByRole('menuitem', { name: '자바스크립트 정복' }));
  expect(screen.getByRole('button', { name: '자바스크립트 정복' })).toBeInTheDocument();
});

it('"목표 없음" 선택 시 트리거 텍스트가 기본값으로 돌아간다', () => {
  (useGoalList as jest.Mock).mockReturnValue({
    data: {
      goals: [{ id: 1, title: '자바스크립트 정복', createdAt: '', updatedAt: '', teamId: '', userId: 0 }],
    },
  });
  renderForm();
  fireEvent.click(screen.getByRole('button', { name: /목표를 선택/ }));
  fireEvent.click(screen.getByRole('menuitem', { name: '자바스크립트 정복' }));
  fireEvent.click(screen.getByRole('button', { name: '자바스크립트 정복' }));
  fireEvent.click(screen.getByRole('menuitem', { name: '목표 없음' }));
  expect(screen.getByRole('button', { name: /목표를 선택/ })).toBeInTheDocument();
});

it('중간 태그를 삭제해도 다음 태그의 색상이 중복되지 않는다', () => {
  renderForm();
  const input = screen.getByPlaceholderText('입력 후 Enter');

  // green, yellow 추가
  fireEvent.change(input, { target: { value: '태그1' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  fireEvent.change(input, { target: { value: '태그2' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  // 첫 번째 태그(green) 삭제
  fireEvent.click(screen.getAllByRole('button', { name: '태그 삭제' })[0]);

  // 다음 추가 태그는 red(인덱스 2)여야 함 — yellow와 중복되지 않음
  fireEvent.change(input, { target: { value: '태그3' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  const badge = screen.getByText('태그3').closest('span');
  expect(badge).toHaveClass('bg-badge-red-bg');
  expect(badge).not.toHaveClass('bg-badge-yellow-bg');
});

it('태그를 추가할 때마다 뱃지 색상이 순환된다', () => {
  renderForm();
  const input = screen.getByPlaceholderText('입력 후 Enter');
  const colors = ['green', 'yellow', 'red', 'purple', 'gray'];
  const labels = ['태그1', '태그2', '태그3', '태그4', '태그5', '태그6'];

  for (const label of labels) {
    fireEvent.change(input, { target: { value: label } });
    fireEvent.keyDown(input, { key: 'Enter' });
  }

  const badges = screen.getAllByText(/태그\d/);
  badges.forEach((badge, i) => {
    expect(badge.closest('span')).toHaveClass(`bg-badge-${colors[i % colors.length]}-bg`);
  });
});

it('태그 입력창에서 Enter를 누르면 Badge로 태그가 추가된다', () => {
  renderForm();
  const input = screen.getByPlaceholderText('입력 후 Enter');
  fireEvent.change(input, { target: { value: '중요' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(screen.getByText('중요')).toBeInTheDocument();
  expect(input).toHaveValue('');
});

it('중복 태그는 추가되지 않는다', () => {
  renderForm();
  const input = screen.getByPlaceholderText('입력 후 Enter');
  fireEvent.change(input, { target: { value: '중요' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  fireEvent.change(input, { target: { value: '중요' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(screen.getAllByText('중요')).toHaveLength(1);
});

it('빈 값은 태그로 추가되지 않는다', () => {
  renderForm();
  const input = screen.getByPlaceholderText('입력 후 Enter');
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(screen.queryByRole('button', { name: '태그 삭제' })).not.toBeInTheDocument();
});

it('태그 X 버튼 클릭 시 해당 태그가 제거된다', () => {
  renderForm();
  const input = screen.getByPlaceholderText('입력 후 Enter');
  fireEvent.change(input, { target: { value: '중요' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  fireEvent.click(screen.getByRole('button', { name: '태그 삭제' }));
  expect(screen.queryByText('중요')).not.toBeInTheDocument();
});

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText('할 일의 제목을 적어주세요'), {
    target: { value: '운동하기' },
  });
  fireEvent.click(screen.getByTestId('mock-datepicker'));
}

it('필수 필드 입력 후 제출 시 useCreateTodo를 호출하고 onClose를 실행한다', async () => {
  const mockMutateAsync = jest.fn().mockImplementation(async (_vars, options) => {
    options?.onSuccess?.({});
  });
  (useCreateTodo as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });
  const { onClose } = renderForm();

  fillRequiredFields();
  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  await waitFor(() => {
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ title: '운동하기', dueDate: '2026-06-01T00:00:00.000Z' }),
      expect.anything(),
    );
  });
  expect(onClose).toHaveBeenCalled();
});

it('createTodo 실패 시 실패 토스트를 표시한다', async () => {
  const mockShowToast = jest.fn();
  (useCreateTodo as jest.Mock).mockReturnValue({
    mutateAsync: jest.fn().mockImplementation(async (_vars, options) => {
      options?.onError?.(new Error('서버 오류'));
    }),
  });
  (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
  renderForm();

  fillRequiredFields();
  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  await waitFor(() => {
    expect(mockShowToast).toHaveBeenCalledWith('할 일 생성에 실패했습니다.');
  });
});

it('이미지 업로드 실패 시 업로드 실패 토스트를 표시하고 createTodo를 호출하지 않는다', async () => {
  const mockShowToast = jest.fn();
  const mockCreateTodoMutate = jest.fn();
  (useCreateImageUploadUrl as jest.Mock).mockReturnValue({
    mutateAsync: jest.fn().mockRejectedValue(new Error('업로드 실패')),
  });
  (useCreateTodo as jest.Mock).mockReturnValue({ mutateAsync: mockCreateTodoMutate });
  (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
  renderForm();

  fillRequiredFields();
  const file = new File(['img'], 'photo.png', { type: 'image/png' });
  fireEvent.change(screen.getByTestId('mock-image-input'), { target: { files: [file] } });
  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  await waitFor(() => {
    expect(mockShowToast).toHaveBeenCalledWith('이미지 업로드에 실패했습니다.');
  });
  expect(mockCreateTodoMutate).not.toHaveBeenCalled();
});

it('이미지 업로드 성공 시 fileUrl을 포함해 createTodo를 호출한다', async () => {
  const mockMutateAsync = jest.fn().mockResolvedValue({});
  const mockUploadMutate = jest.fn().mockResolvedValue({
    uploadUrl: 'https://s3.example.com/upload',
    url: 'https://s3.example.com/photo.png',
  });
  global.fetch = jest.fn().mockResolvedValue({ ok: true });
  (useCreateImageUploadUrl as jest.Mock).mockReturnValue({ mutateAsync: mockUploadMutate });
  (useCreateTodo as jest.Mock).mockReturnValue({ mutateAsync: mockMutateAsync });
  renderForm();

  fillRequiredFields();
  const file = new File(['img'], 'photo.png', { type: 'image/png' });
  fireEvent.change(screen.getByTestId('mock-image-input'), { target: { files: [file] } });
  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  await waitFor(() => {
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ fileUrl: 'https://s3.example.com/photo.png' }),
      expect.anything(),
    );
  });
});
