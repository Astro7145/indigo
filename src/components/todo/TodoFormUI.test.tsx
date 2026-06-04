jest.mock('@/src/hooks/goal', () => ({ useGoalList: jest.fn() }));

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

import { fireEvent, screen, waitFor } from '@testing-library/react';

import TodoFormUI from '@/src/components/todo/TodoFormUI';
import * as goalHooks from '@/src/hooks/goal';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';

const mockedUseGoalList = goalHooks.useGoalList as jest.MockedFunction<typeof goalHooks.useGoalList>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseGoalList.mockReturnValue({ data: { goals: [] } } as unknown as ReturnType<typeof goalHooks.useGoalList>);
});

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText('할 일의 제목을 적어주세요'), { target: { value: '운동하기' } });
  fireEvent.click(screen.getByTestId('mock-datepicker'));
}

describe('TodoFormUI', () => {
  it('제목·목표·마감기한·태그·링크·이미지 필드와 취소·제출 버튼을 렌더링한다', () => {
    renderWithClient(<TodoFormUI onSubmit={jest.fn()} onClose={jest.fn()} title="할 일 생성" submitLabel="확인" />);
    expect(screen.getByPlaceholderText('할 일의 제목을 적어주세요')).toBeInTheDocument();
    expect(screen.getByText('목표를 선택해주세요')).toBeInTheDocument();
    expect(screen.getByTestId('mock-datepicker')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('입력 후 Enter')).toBeInTheDocument();
    expect(screen.getByLabelText('링크')).toBeInTheDocument();
    expect(screen.getByTestId('mock-image-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
  });

  it('제목을 30자 초과로 입력하면 에러 메시지가 표시된다', async () => {
    renderWithClient(<TodoFormUI onSubmit={jest.fn()} onClose={jest.fn()} title="할 일 생성" submitLabel="확인" />);
    fireEvent.change(screen.getByPlaceholderText('할 일의 제목을 적어주세요'), {
      target: { value: 'a'.repeat(31) },
    });
    expect(await screen.findByText('제목은 30자 이하로 입력해주세요.')).toBeInTheDocument();
  });

  it('잘못된 형식의 URL을 링크에 입력하면 에러 메시지가 표시된다', async () => {
    renderWithClient(<TodoFormUI onSubmit={jest.fn()} onClose={jest.fn()} title="할 일 생성" submitLabel="확인" />);
    fireEvent.change(screen.getByLabelText('링크'), { target: { value: 'not a url' } });
    expect(await screen.findByText('올바른 URL을 입력해주세요.')).toBeInTheDocument();
  });

  it('필수 항목이 다 채워지지 않은 초기 상태에서 제출 버튼이 비활성화된다', () => {
    renderWithClient(
      <TodoFormUI
        onSubmit={jest.fn()}
        onClose={jest.fn()}
        title="할 일 생성"
        submitLabel="확인"
        disableSubmitUntilValid
      />,
    );
    expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
  });

  it('필수 항목인 제목과 마감기한을 채우면 제출 버튼이 활성화된다', async () => {
    renderWithClient(
      <TodoFormUI
        onSubmit={jest.fn()}
        onClose={jest.fn()}
        title="할 일 생성"
        submitLabel="확인"
        disableSubmitUntilValid
      />,
    );
    fillRequiredFields();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '확인' })).not.toBeDisabled();
    });
  });

  it('필수 필드를 채우고 제출하면 onSubmit이 입력값과 함께 호출된다', async () => {
    const onSubmit = jest.fn();
    renderWithClient(<TodoFormUI onSubmit={onSubmit} onClose={jest.fn()} title="할 일 생성" submitLabel="확인" />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '운동하기',
          dueDate: '2026-06-01T00:00:00.000Z',
          tags: [],
          imageFile: null,
        }),
      );
    });
  });

  it('isPending이 true면 제출 버튼이 비활성화된다', () => {
    renderWithClient(
      <TodoFormUI onSubmit={jest.fn()} onClose={jest.fn()} title="할 일 생성" submitLabel="확인" isPending />,
    );
    expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
  });

  it('제출 처리가 진행 중인 동안 제출 버튼이 비활성화된다', async () => {
    let resolveSubmit: () => void = () => {};
    const onSubmit = jest.fn(() => new Promise<void>((resolve) => (resolveSubmit = resolve)));
    renderWithClient(<TodoFormUI onSubmit={onSubmit} onClose={jest.fn()} title="할 일 생성" submitLabel="확인" />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    await waitFor(() => expect(screen.getByRole('button', { name: '확인' })).toBeDisabled());
    resolveSubmit();
  });

  it('헤더의 닫기 버튼을 누르면 onClose가 호출된다', () => {
    const onClose = jest.fn();
    renderWithClient(<TodoFormUI onSubmit={jest.fn()} onClose={onClose} title="할 일 생성" submitLabel="확인" />);
    fireEvent.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalled();
  });

  it('취소 버튼을 누르면 onClose가 호출된다', () => {
    const onClose = jest.fn();
    renderWithClient(<TodoFormUI onSubmit={jest.fn()} onClose={onClose} title="할 일 생성" submitLabel="확인" />);
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('Enter 키로 폼이 제출되면 onSubmit이 호출된다 (페이지 리로드 방지)', async () => {
    const onSubmit = jest.fn();
    const { container } = renderWithClient(
      <TodoFormUI onSubmit={onSubmit} onClose={jest.fn()} title="할 일 생성" submitLabel="확인" />,
    );
    fillRequiredFields();
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('initialValues.done이 정의되면 상태 필드가 표시된다', () => {
    renderWithClient(
      <TodoFormUI
        onSubmit={jest.fn()}
        onClose={jest.fn()}
        title="할 일 수정"
        submitLabel="수정"
        initialValues={{ done: false, title: '기존', dueDate: '2026-06-01T00:00:00.000Z' }}
      />,
    );
    expect(screen.getByText('TO DO')).toBeInTheDocument();
    expect(screen.getByText('DONE')).toBeInTheDocument();
  });

  it('initialValues.done이 정의되지 않으면 상태 필드가 표시되지 않는다', () => {
    renderWithClient(<TodoFormUI onSubmit={jest.fn()} onClose={jest.fn()} title="할 일 생성" submitLabel="확인" />);
    expect(screen.queryByText('TO DO')).not.toBeInTheDocument();
    expect(screen.queryByText('DONE')).not.toBeInTheDocument();
  });

  it('initialValues가 주어지면 폼이 해당 값으로 초기화된다', () => {
    renderWithClient(
      <TodoFormUI
        onSubmit={jest.fn()}
        onClose={jest.fn()}
        title="할 일 수정"
        submitLabel="수정"
        initialValues={{ title: '기존 할 일', dueDate: '2026-06-01T00:00:00.000Z', linkUrl: 'https://example.com' }}
      />,
    );
    expect(screen.getByPlaceholderText('할 일의 제목을 적어주세요')).toHaveValue('기존 할 일');
    expect(screen.getByLabelText('링크')).toHaveValue('https://example.com');
  });
});
