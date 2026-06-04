jest.mock('@/src/hooks/auth', () => ({
  useLogout: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import * as authHooks from '@/src/hooks/auth';
import LogoutButton from '@/src/components/common/sidebar/LogoutButton';

const mockedUseLogout = authHooks.useLogout as jest.MockedFunction<typeof authHooks.useLogout>;
const mockMutate = jest.fn();
const mockReplace = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  mockedUseLogout.mockReturnValue({ mutate: mockMutate } as unknown as ReturnType<typeof authHooks.useLogout>);
});

describe('LogoutButton', () => {
  it('클릭 시 useLogout mutate를 호출한다', () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('로그아웃이 정착(onSettled)되면 /login으로 replace 한다', () => {
    mockMutate.mockImplementation((_data: unknown, options?: { onSettled?: () => void }) => {
      options?.onSettled?.();
    });
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
