import { fireEvent, screen, waitFor } from '@testing-library/react';

import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import LoginPage from './page';

describe('LoginPage 유효성 검증', () => {
  describe('초기 상태', () => {
    it('로그인 버튼이 비활성화되어 있다', () => {
      renderWithClient(<LoginPage />);
      expect(screen.getByRole('button', { name: '로그인하기' })).toBeDisabled();
    });
  });

  describe('이메일 필드', () => {
    it('아무것도 입력하지 않고 blur하면 에러 메시지가 표시된다', async () => {
      renderWithClient(<LoginPage />);
      fireEvent.blur(screen.getByPlaceholderText('이메일을 입력해주세요'));
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('올바른 이메일을 입력해주세요.');
      });
    });

    it('이메일 형식이 올바르지 않으면 에러 메시지가 표시된다', async () => {
      renderWithClient(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('이메일을 입력해주세요');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('올바른 이메일을 입력해주세요.');
      });
    });

    it('올바른 이메일로 수정하면 에러 메시지가 사라진다', async () => {
      renderWithClient(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('이메일을 입력해주세요');

      // 잘못된 값으로 에러 유발
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      fireEvent.blur(emailInput);
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // 올바른 값으로 수정
      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
      fireEvent.blur(emailInput);
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('비밀번호 필드', () => {
    it('아무것도 입력하지 않고 blur하면 에러 메시지가 표시된다', async () => {
      renderWithClient(<LoginPage />);
      fireEvent.blur(screen.getByPlaceholderText('비밀번호를 입력해주세요'));
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('비밀번호는 필수 입력입니다.');
      });
    });

    it('올바른 비밀번호로 수정하면 에러 메시지가 사라진다', async () => {
      renderWithClient(<LoginPage />);
      const pwInput = screen.getByPlaceholderText('비밀번호를 입력해주세요');

      fireEvent.blur(pwInput);
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('비밀번호는 필수 입력입니다.');
      });

      fireEvent.change(pwInput, { target: { value: 'validPassword' } });
      fireEvent.blur(pwInput);
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('로그인 버튼 활성화', () => {
    it('이메일과 비밀번호를 모두 유효하게 입력하면 로그인 버튼이 활성화된다', async () => {
      renderWithClient(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('이메일을 입력해주세요');
      const passwordInput = screen.getByPlaceholderText('비밀번호를 입력해주세요');

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.blur(emailInput);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '로그인하기' })).toBeEnabled();
      });
    });
  });
});
