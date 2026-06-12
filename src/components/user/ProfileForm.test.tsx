// 수동 목(ko 메시지 조회) 대신 "네임스페이스.키"를 그대로 돌려주는 t로 오버라이드한다.
// 렌더 결과가 번역 키와 일치하면 문구가 하드코딩이 아니라 카탈로그를 경유한다는 뜻이다.
jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    const t = (key: string, values?: Record<string, unknown>) => {
      const id = namespace ? `${namespace}.${key}` : key;
      return values ? `${id} ${Object.values(values).join(' ')}` : id;
    };
    return t;
  },
  useLocale: () => 'ko',
}));

const mockShowToast = jest.fn();
const mockUpdateMe = jest.fn();

jest.mock('@/src/hooks/useToast', () => ({ useToast: () => ({ showToast: mockShowToast }) }));
jest.mock('@/src/hooks/user', () => ({
  useMe: jest.fn(),
  useUpdateMe: () => ({ mutateAsync: mockUpdateMe }),
  useChangePassword: () => ({ mutateAsync: jest.fn() }),
}));
jest.mock('@/src/hooks/upload', () => ({
  useCreateImageUploadUrl: () => ({ mutateAsync: jest.fn() }),
  useUploadImageToS3: () => ({ mutateAsync: jest.fn() }),
}));

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ProfileForm from '@/src/components/user/ProfileForm';
import { useMe } from '@/src/hooks/user';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useMe).mockReturnValue({
    data: { name: '체다치즈', email: 'cheese@example.com' },
    isLoading: false,
  } as unknown as ReturnType<typeof useMe>);
  mockUpdateMe.mockResolvedValue({});
});

describe('ProfileForm i18n', () => {
  it('라벨·비밀번호 섹션·저장 버튼을 번역 키로 렌더한다', async () => {
    render(<ProfileForm />);

    expect(screen.getByText('common.fields.email')).toBeInTheDocument();
    expect(screen.getByText('common.fields.name')).toBeInTheDocument();
    expect(screen.getByText('me.password.section')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('me.password.currentPlaceholder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.actions.save' })).toBeInTheDocument();

    // reset(me) 이후 백그라운드 재검증이 끝날 때까지 기다려 act 경고를 막는다.
    await waitFor(() => expect(screen.getByRole('button', { name: 'common.actions.save' })).toBeEnabled());
  });

  it('이름을 비우고 블러하면 validation 카탈로그의 nameRequired 메시지를 보여준다', async () => {
    render(<ProfileForm />);

    const nameInput = await screen.findByDisplayValue('체다치즈');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);

    expect(await screen.findByRole('alert')).toHaveTextContent('validation.nameRequired');
  });

  it('새 비밀번호만 입력하고 현재 비밀번호를 비워 두면 currentPasswordRequired 메시지를 보여준다', async () => {
    render(<ProfileForm />);

    await screen.findByDisplayValue('체다치즈');
    fireEvent.change(screen.getByPlaceholderText('me.password.newPlaceholder'), { target: { value: 'newpass123' } });
    const currentPasswordInput = screen.getByPlaceholderText('me.password.currentPlaceholder');
    fireEvent.focus(currentPasswordInput);
    fireEvent.blur(currentPasswordInput);

    const alerts = await screen.findAllByRole('alert');
    expect(alerts.map((el) => el.textContent)).toContain('validation.currentPasswordRequired');
  });

  it('저장 성공 시 common 카탈로그의 saved 토스트를 띄운다', async () => {
    render(<ProfileForm />);

    await screen.findByDisplayValue('체다치즈');
    const button = screen.getByRole('button', { name: 'common.actions.save' });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);

    await waitFor(() => expect(mockUpdateMe).toHaveBeenCalledWith({ name: '체다치즈' }));
    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith('common.toast.saved'));
  });
});
