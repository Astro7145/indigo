import { fireEvent, render, screen } from '@testing-library/react';

import PasswordInput from '@/src/components/common/inputs/PasswordInput';

jest.mock('@/src/components/common/icons', () => ({
  IcEye: () => <svg data-testid="ic-eye" />,
  IcEyeOff: () => <svg data-testid="ic-eye-off" />,
}));

it('초기 렌더 시 type="password"인 input을 렌더링한다', () => {
  render(<PasswordInput placeholder="비밀번호" />);
  expect(screen.getByPlaceholderText('비밀번호')).toHaveAttribute('type', 'password');
});

it('EyeButton 클릭 시 type="text"로 전환된다', () => {
  render(<PasswordInput placeholder="비밀번호" />);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByPlaceholderText('비밀번호')).toHaveAttribute('type', 'text');
});

it('EyeButton 두 번 클릭 시 type="password"로 돌아온다', () => {
  render(<PasswordInput placeholder="비밀번호" />);
  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByPlaceholderText('비밀번호')).toHaveAttribute('type', 'password');
});

it('EyeButton이 렌더링된다', () => {
  render(<PasswordInput />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
