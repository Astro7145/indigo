jest.mock('@/src/hooks/auth', () => ({
  useLogin: jest.fn(),
}));

jest.mock('@/src/components/common/icons', () => ({
  IcEye: () => <svg data-testid="ic-eye" />,
  IcEyeOff: () => <svg data-testid="ic-eye-off" />,
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as authHooks from '@/src/hooks/auth';
import LoginForm from '@/src/components/auth/LoginForm';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';

const mockedUseLogin = authHooks.useLogin as jest.MockedFunction<typeof authHooks.useLogin>;
const mockMutate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseLogin.mockReturnValue({ mutate: mockMutate } as unknown as ReturnType<typeof authHooks.useLogin>);
});

describe('LoginForm', () => {
  it('이메일·비밀번호 입력 필드와 로그인하기 버튼을 렌더링한다', () => {
    renderWithClient(<LoginForm />);
    expect(screen.getByPlaceholderText('이메일을 입력해주세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호를 입력해주세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인하기' })).toBeInTheDocument();
  });

  it('회원가입 링크를 렌더링한다', () => {
    renderWithClient(<LoginForm />);
    expect(screen.getByRole('link', { name: '회원가입' })).toBeInTheDocument();
  });

  it('초기 상태에서 로그인 버튼이 비활성화된다', () => {
    renderWithClient(<LoginForm />);
    expect(screen.getByRole('button', { name: '로그인하기' })).toBeDisabled();
  });

  it('유효한 이메일과 비밀번호 입력 시 로그인 버튼이 활성화된다', async () => {
    renderWithClient(<LoginForm />);
    const emailInput = screen.getByPlaceholderText('이메일을 입력해주세요');
    const passwordInput = screen.getByPlaceholderText('비밀번호를 입력해주세요');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.blur(emailInput);
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '로그인하기' })).not.toBeDisabled();
    });
  });

  it('유효한 폼 제출 시 mutate를 이메일·비밀번호와 함께 호출한다', async () => {
    renderWithClient(<LoginForm />);
    const emailInput = screen.getByPlaceholderText('이메일을 입력해주세요');
    const passwordInput = screen.getByPlaceholderText('비밀번호를 입력해주세요');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.blur(emailInput);
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '로그인하기' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: '로그인하기' }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ email: 'user@example.com', password: 'password' });
    });
  });

  describe('이메일 필드', () => {
    it('잘못된 이메일 입력 후 blur 시 에러 메시지가 표시된다', async () => {
      renderWithClient(<LoginForm />);
      const emailInput = screen.getByPlaceholderText('이메일을 입력해주세요');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
      expect(await screen.findByText('올바른 이메일을 입력해주세요.')).toBeInTheDocument();
    });
  });

  describe('비밀번호 필드', () => {
    it('빈 값으로 blur 시 에러 메시지가 표시된다', async () => {
      renderWithClient(<LoginForm />);
      fireEvent.blur(screen.getByPlaceholderText('비밀번호를 입력해주세요'));
      expect(await screen.findByText('비밀번호는 필수 입력입니다.')).toBeInTheDocument();
    });
  });
});
