import { fireEvent, screen } from '@testing-library/react';

import { renderWithIntl } from '@/src/hooks/__tests__/test-utils';
import SettingsModal from './SettingsModal';
import { useSettingsModalStore } from '@/src/stores/settingsModal';

jest.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'ko' }),
  usePathname: () => '/ko/settings',
}));

afterEach(() => {
  useSettingsModalStore.setState({ isOpen: false });
});

describe('SettingsModal', () => {
  it('스토어가 열림 상태면 설정 모달이 보인다', async () => {
    useSettingsModalStore.setState({ isOpen: true });
    await renderWithIntl(<SettingsModal />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '설정' })).toBeInTheDocument();
  });

  it('닫힘 상태면 모달이 렌더되지 않는다', async () => {
    await renderWithIntl(<SettingsModal />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('취소 버튼을 누르면 스토어가 닫힌다', async () => {
    useSettingsModalStore.setState({ isOpen: true });
    await renderWithIntl(<SettingsModal />);

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(useSettingsModalStore.getState().isOpen).toBe(false);
  });
});
