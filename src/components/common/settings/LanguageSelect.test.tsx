const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: mockRefresh }) }));
jest.mock('@/src/i18n/locale', () => ({ setUserLocale: jest.fn() }));

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { setUserLocale } from '@/src/i18n/locale';

import LanguageSelect from './LanguageSelect';

// next-intl 수동 목의 useLocale은 'ko'를 반환한다(현재 언어 = 한국어).
const mockSetUserLocale = setUserLocale as jest.Mock;

afterEach(() => {
  jest.clearAllMocks();
});

describe('LanguageSelect', () => {
  it('다른 언어를 선택하면 해당 locale로 쿠키를 저장하고 새로고침한다', async () => {
    render(<LanguageSelect />);

    fireEvent.click(screen.getByRole('button', { name: '언어' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'English' }));

    await waitFor(() => expect(mockSetUserLocale).toHaveBeenCalledWith('en'));
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  it('현재 언어(한국어)를 다시 선택하면 아무 동작도 하지 않는다', () => {
    render(<LanguageSelect />);

    fireEvent.click(screen.getByRole('button', { name: '언어' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '한국어' }));

    expect(mockSetUserLocale).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
