import { fireEvent, render, screen } from '@testing-library/react';

import ThemeToggle from '@/src/components/common/settings/ThemeToggle';

const mockSetTheme = jest.fn();
let mockTheme = 'light';

jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme }),
}));

beforeEach(() => {
  mockSetTheme.mockClear();
  mockTheme = 'light';
});

it('라이트/다크/시스템 세 옵션을 라디오로 렌더한다', () => {
  render(<ThemeToggle />);
  expect(screen.getAllByRole('radio')).toHaveLength(3);
  expect(screen.getByRole('radio', { name: '라이트 모드' })).toBeInTheDocument();
  expect(screen.getByRole('radio', { name: '다크 모드' })).toBeInTheDocument();
  expect(screen.getByRole('radio', { name: '시스템 설정' })).toBeInTheDocument();
});

it('현재 테마 탭을 활성 상태로 표시한다', () => {
  mockTheme = 'dark';
  render(<ThemeToggle />);
  expect(screen.getByRole('radio', { name: '다크 모드' })).toBeChecked();
  expect(screen.getByRole('radio', { name: '라이트 모드' })).not.toBeChecked();
});

it('탭을 클릭하면 해당 값으로 setTheme를 호출한다', () => {
  render(<ThemeToggle />);
  fireEvent.click(screen.getByRole('radio', { name: '시스템 설정' }));
  expect(mockSetTheme).toHaveBeenCalledWith('system');
});
