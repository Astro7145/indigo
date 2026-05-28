jest.mock('@/src/hooks/auth', () => ({
  useSignup: jest.fn(),
}));

jest.mock('@/src/hooks/user', () => ({
  useCheckNickname: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/src/components/common/icons', () => ({
  IcEye: () => <svg data-testid="ic-eye" />,
  IcEyeOff: () => <svg data-testid="ic-eye-off" />,
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import * as authHooks from '@/src/hooks/auth';
import * as userHooks from '@/src/hooks/user';
import SignupForm from '@/src/components/auth/SignupForm';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';

const mockedUseSignup = authHooks.useSignup as jest.MockedFunction<typeof authHooks.useSignup>;
const mockedUseCheckNickname = userHooks.useCheckNickname as jest.MockedFunction<typeof userHooks.useCheckNickname>;
const mockMutate = jest.fn();
const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  mockedUseSignup.mockReturnValue({ mutate: mockMutate, isSuccess: false } as unknown as ReturnType<
    typeof authHooks.useSignup
  >);
  mockedUseCheckNickname.mockReturnValue({ data: { available: true } } as unknown as ReturnType<
    typeof userHooks.useCheckNickname
  >);
});

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } });
  fireEvent.blur(screen.getByLabelText('이름'));
  fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'user@example.com' } });
  fireEvent.blur(screen.getByLabelText('이메일'));
  fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } });
  fireEvent.blur(screen.getByLabelText('비밀번호'));
  fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'password123' } });
  fireEvent.blur(screen.getByLabelText('비밀번호 확인'));
};

describe('SignupForm', () => {
  it('이름·이메일·비밀번호·비밀번호 확인 필드와 회원가입 버튼을 렌더링한다', () => {
    renderWithClient(<SignupForm />);
    expect(screen.getByLabelText('이름')).toBeInTheDocument();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '회원가입 하기' })).toBeInTheDocument();
  });

  it('로그인 링크를 렌더링한다', () => {
    renderWithClient(<SignupForm />);
    expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument();
  });

  it('초기 상태에서 회원가입 버튼이 비활성화된다', () => {
    renderWithClient(<SignupForm />);
    expect(screen.getByRole('button', { name: '회원가입 하기' })).toBeDisabled();
  });

  it('모든 필드를 유효하게 입력하면 회원가입 버튼이 활성화된다', async () => {
    renderWithClient(<SignupForm />);
    fillValidForm();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '회원가입 하기' })).not.toBeDisabled();
    });
  });

  it('유효한 폼 제출 시 mutate를 이름·이메일·비밀번호와 함께 호출한다', async () => {
    renderWithClient(<SignupForm />);
    fillValidForm();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '회원가입 하기' })).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole('button', { name: '회원가입 하기' }));
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'user@example.com',
        name: '홍길동',
        password: 'password123',
      });
    });
  });

  it('회원가입 성공 시 router.push("/")를 호출한다', () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockedUseSignup.mockReturnValue({ mutate: mockMutate, isSuccess: true } as unknown as ReturnType<
      typeof authHooks.useSignup
    >);
    renderWithClient(<SignupForm />);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  describe('이름 필드', () => {
    it('빈 값으로 blur 시 에러 메시지가 표시된다', async () => {
      renderWithClient(<SignupForm />);
      fireEvent.blur(screen.getByLabelText('이름'));
      expect(await screen.findByText('이름을 입력해주세요.')).toBeInTheDocument();
    });

    it('이미 사용 중인 닉네임이면 에러 메시지가 표시된다', async () => {
      mockedUseCheckNickname.mockReturnValue({ data: { available: false } } as unknown as ReturnType<
        typeof userHooks.useCheckNickname
      >);
      renderWithClient(<SignupForm />);
      expect(await screen.findByText('이미 사용 중인 닉네임입니다.')).toBeInTheDocument();
    });

    it('이미 사용 중인 닉네임이면 회원가입 버튼이 비활성화된다', async () => {
      mockedUseCheckNickname.mockReturnValue({ data: { available: false } } as unknown as ReturnType<
        typeof userHooks.useCheckNickname
      >);
      renderWithClient(<SignupForm />);
      await screen.findByText('이미 사용 중인 닉네임입니다.');
      expect(screen.getByRole('button', { name: '회원가입 하기' })).toBeDisabled();
    });

    it('사용 가능한 닉네임이면 에러 메시지가 표시되지 않는다', () => {
      renderWithClient(<SignupForm />);
      expect(screen.queryByText('이미 사용 중인 닉네임입니다.')).not.toBeInTheDocument();
    });
  });

  describe('이메일 필드', () => {
    it('잘못된 이메일 입력 후 blur 시 에러 메시지가 표시된다', async () => {
      renderWithClient(<SignupForm />);
      fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'invalid-email' } });
      fireEvent.blur(screen.getByLabelText('이메일'));
      expect(await screen.findByText('올바른 이메일을 입력해주세요.')).toBeInTheDocument();
    });
  });

  describe('비밀번호 필드', () => {
    it('8자 미만 입력 후 blur 시 에러 메시지가 표시된다', async () => {
      renderWithClient(<SignupForm />);
      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'short' } });
      fireEvent.blur(screen.getByLabelText('비밀번호'));
      expect(await screen.findByText('비밀번호가 8자 이상이 되도록 해 주세요.')).toBeInTheDocument();
    });
  });

  describe('비밀번호 확인 필드', () => {
    it('비밀번호와 다른 값 입력 후 blur 시 에러 메시지가 표시된다', async () => {
      renderWithClient(<SignupForm />);
      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } });
      fireEvent.blur(screen.getByLabelText('비밀번호'));
      fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'different123' } });
      fireEvent.blur(screen.getByLabelText('비밀번호 확인'));
      expect(await screen.findByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
    });
  });
});
